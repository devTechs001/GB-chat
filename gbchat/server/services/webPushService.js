// server/services/webPushService.js
import webpush from "web-push";
import mongoose from "mongoose";
import PushSubscription, { isGoneStatus } from "../models/PushSubscription.js";

/**
 * Web Push delivery.
 *
 * Design rules:
 *  - Never throw into a caller. Notifications are best-effort by definition.
 *  - Degrade quietly. Without VAPID keys (or with WEB_PUSH_ENABLED=false) every
 *    function is a no-op and `isPushConfigured()` returns false, so the app and
 *    the REST API behave exactly as before.
 *  - Clean up after the push services: 404/410 means the subscription is dead
 *    (browser data cleared, permission revoked) and is deleted so the next send
 *    does not pay for it again.
 */

const DEFAULT_SUBJECT = "mailto:notifications@gbchat.app";

/**
 * VAPID is resolved lazily, not at import time: `dotenv` runs from the entry
 * point, which is evaluated *after* its static imports, so reading env vars in
 * a module body would see an empty environment. Resolving on first use also
 * lets a test set the keys after import.
 */
let resolved = null;

const readConfig = () => {
  const disabled = String(process.env.WEB_PUSH_ENABLED || "true").toLowerCase() === "false";
  const publicKey = (process.env.VAPID_PUBLIC_KEY || "").trim();
  const privateKey = (process.env.VAPID_PRIVATE_KEY || "").trim();
  const subject = (process.env.VAPID_SUBJECT || DEFAULT_SUBJECT).trim();
  return { disabled, publicKey, privateKey, subject };
};

const resolveVapid = () => {
  const config = readConfig();

  // Re-resolve when the environment changes (dotenv loaded late, tests).
  if (resolved && resolved.publicKey === config.publicKey && resolved.privateKey === config.privateKey) {
    return resolved;
  }

  let configured = false;
  let error = "";

  if (config.disabled) {
    error = "push disabled by WEB_PUSH_ENABLED=false";
  } else if (!config.publicKey || !config.privateKey) {
    error = "VAPID keys are not set";
  } else {
    try {
      webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
      configured = true;
    } catch (configError) {
      error = configError.message;
      console.warn("[push] invalid VAPID configuration:", configError.message);
    }
  }

  resolved = { ...config, configured, error };
  return resolved;
};

export const isPushConfigured = () => resolveVapid().configured;
export const getVapidPublicKey = () => resolveVapid().publicKey;
export const getPushConfigError = () => resolveVapid().error;

export const generateVapidKeys = () => webpush.generateVAPIDKeys();

const dbReady = () => mongoose.connection?.readyState === 1;

/**
 * Canonical notification payload. `url` is a client route, `tag` collapses
 * repeated notifications for the same conversation.
 */
export const buildPayload = ({
  title = "GBChat",
  body = "",
  url = "/chats",
  tag = "",
  type = "system",
  icon = "/icons/icon-192x192.png",
  badge = "/icons/favicon-32x32.png",
  data = {},
  force = false,
} = {}) => ({
  title: String(title).slice(0, 120),
  body: String(body || "").slice(0, 240),
  url,
  tag,
  type,
  icon,
  badge,
  force,
  data,
  at: new Date().toISOString(),
});

const serialize = (payload) => JSON.stringify(payload);

/**
 * Send one payload to a single stored subscription document.
 * Returns "sent" | "gone" | "failed" | "skipped".
 */
export const sendToSubscription = async (subscription, payload) => {
  if (!isPushConfigured()) return "skipped";
  const target = subscription?.toWebPush?.() || subscription;
  if (!target?.endpoint) return "skipped";

  try {
    await webpush.sendNotification(target, serialize(payload), {
      TTL: Number(process.env.WEB_PUSH_TTL_SECONDS || 60 * 60 * 24),
      urgency: payload?.type === "message" || payload?.type === "missed_call" ? "high" : "normal",
    });

    // Touch usage counters without blocking on the result.
    if (subscription?._id) {
      PushSubscription.updateOne(
        { _id: subscription._id },
        { $set: { lastUsedAt: new Date(), lastError: "", failureCount: 0 } }
      ).catch(() => {});
    }
    return "sent";
  } catch (error) {
    const statusCode = error?.statusCode || 0;
    if (isGoneStatus(statusCode)) {
      if (subscription?._id) {
        PushSubscription.deleteOne({ _id: subscription._id }).catch(() => {});
      }
      return "gone";
    }
    if (subscription?._id) {
      PushSubscription.updateOne(
        { _id: subscription._id },
        {
          $inc: { failureCount: 1 },
          $set: { lastError: String(error.message || "push failed").slice(0, 300) },
        }
      ).catch(() => {});
    }
    console.warn("[push] send failed:", statusCode || "-", error.message);
    return "failed";
  }
};

/**
 * Fan a payload out to every active subscription of the given users.
 * Never rejects.
 */
export const sendToUsers = async (userIds = [], payloadInput = {}) => {
  const configured = isPushConfigured();
  const result = { configured, sent: 0, gone: 0, failed: 0, skipped: 0, users: 0 };
  if (!configured || !userIds.length || !dbReady()) return result;

  const unique = [...new Set(userIds.filter(Boolean).map(String))];
  if (!unique.length) return result;
  result.users = unique.length;

  let subscriptions = [];
  try {
    subscriptions = await PushSubscription.find({
      user: { $in: unique },
      isActive: true,
    })
      .limit(unique.length * Number(process.env.WEB_PUSH_MAX_SUBS_PER_USER || 20))
      .lean({ virtuals: false });
  } catch (error) {
    console.warn("[push] could not load subscriptions:", error.message);
    return result;
  }

  const payload = buildPayload(payloadInput);
  const outcomes = await Promise.all(
    subscriptions.map(async (subscription) => {
      // lean() drops schema methods, so hand the service the raw record.
      const outcome = await sendToSubscription(subscription, payload);
      return outcome;
    })
  );

  outcomes.forEach((outcome) => {
    result[outcome] = (result[outcome] || 0) + 1;
  });
  return result;
};

export const sendToUser = (userId, payload) => sendToUsers([userId], payload);

/** Cheap counts for the settings screen and /api/push/status. */
export const getPushStats = async () => {
  const stats = { configured: isPushConfigured(), subscriptions: 0, users: 0, failing: 0 };
  if (!dbReady()) return stats;
  try {
    const [subscriptions, users, failing] = await Promise.all([
      PushSubscription.countDocuments({ isActive: true }),
      PushSubscription.distinct("user", { isActive: true }),
      PushSubscription.countDocuments({ isActive: true, failureCount: { $gt: 0 } }),
    ]);
    stats.subscriptions = subscriptions;
    stats.users = users.length;
    stats.failing = failing;
  } catch (error) {
    console.warn("[push] stats failed:", error.message);
  }
  return stats;
};

export default {
  isPushConfigured,
  getVapidPublicKey,
  getPushConfigError,
  generateVapidKeys,
  buildPayload,
  sendToUser,
  sendToUsers,
  sendToSubscription,
  getPushStats,
};
