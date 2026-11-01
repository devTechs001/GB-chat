// server/controllers/pushController.js
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import PushSubscription, { hashEndpoint } from "../models/PushSubscription.js";
import {
  isPushConfigured,
  getVapidPublicKey,
  getPushConfigError,
  getPushStats,
  sendToUser,
} from "../services/webPushService.js";

const dbReady = () => mongoose.connection?.readyState === 1;

const badRequest = (res, message) => res.status(400).json({ success: false, message });

/**
 * @desc    Public VAPID key + whether the server can actually deliver
 * @route   GET /api/push/public-key
 * @access  Private (a logged-in client is the only caller)
 */
export const getPublicKey = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    enabled: isPushConfigured(),
    publicKey: getVapidPublicKey() || null,
    reason: isPushConfigured() ? null : getPushConfigError() || "push disabled",
  });
});

/**
 * @desc    Register (or refresh) this browser's push subscription
 * @route   POST /api/push/subscribe
 * @access  Private
 */
export const subscribe = asyncHandler(async (req, res) => {
  if (!isPushConfigured()) {
    return res.status(503).json({
      success: false,
      message: "Push notifications are not configured on this server",
    });
  }
  if (!dbReady()) {
    return res.status(503).json({ success: false, message: "Database unavailable" });
  }

  const { subscription } = req.body || {};
  const endpoint = subscription?.endpoint;
  const p256dh = subscription?.keys?.p256dh;
  const auth = subscription?.keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    return badRequest(res, "subscription.endpoint and subscription.keys are required");
  }
  if (!/^https:\/\//i.test(endpoint)) {
    return badRequest(res, "Push endpoint must be an https URL");
  }

  const endpointHash = hashEndpoint(endpoint);
  const now = new Date();

  // Re-subscribing the same browser must never create a duplicate row, and the
  // row may belong to a previous account on a shared device — take it over.
  const record = await PushSubscription.findOneAndUpdate(
    { endpointHash },
    {
      $set: {
        user: req.user._id,
        endpoint,
        keys: { p256dh, auth },
        expirationTime: subscription?.expirationTime ?? null,
        userAgent: String(req.headers["user-agent"] || "").slice(0, 300),
        platform: "web",
        isActive: true,
        lastError: "",
        failureCount: 0,
        lastUsedAt: now,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  // Cap subscriptions per user so a broken client cannot grow the collection.
  const max = Number(process.env.WEB_PUSH_MAX_SUBS_PER_USER || 20);
  const stale = await PushSubscription.find({ user: req.user._id, isActive: true })
    .sort({ lastUsedAt: -1, updatedAt: -1 })
    .skip(max)
    .select("_id")
    .lean();
  if (stale.length) {
    await PushSubscription.deleteMany({ _id: { $in: stale.map((s) => s._id) } });
  }

  res.status(201).json({
    success: true,
    subscription: {
      id: record._id,
      endpointHash: record.endpointHash,
      createdAt: record.createdAt,
      lastUsedAt: record.lastUsedAt,
    },
  });
});

/**
 * @desc    Remove a subscription (permission revoked / user switched it off)
 * @route   DELETE /api/push/subscribe
 * @access  Private
 */
export const unsubscribe = asyncHandler(async (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ success: false, message: "Database unavailable" });
  }

  const endpoint = req.body?.endpoint || req.query?.endpoint;
  if (!endpoint) return badRequest(res, "endpoint is required");

  const result = await PushSubscription.deleteOne({
    endpointHash: hashEndpoint(endpoint),
    user: req.user._id,
  });

  res.json({ success: true, removed: result.deletedCount || 0 });
});

/**
 * @desc    How many browsers this account has registered (and server state)
 * @route   GET /api/push/status
 * @access  Private
 */
export const status = asyncHandler(async (req, res) => {
  const global = await getPushStats();
  let mine = 0;
  if (dbReady()) {
    mine = await PushSubscription.countDocuments({ user: req.user._id, isActive: true });
  }

  res.json({
    success: true,
    enabled: isPushConfigured(),
    reason: isPushConfigured() ? null : getPushConfigError() || "push disabled",
    mine,
    server: global,
  });
});

/**
 * @desc    Send a push to every browser the caller has registered
 * @route   POST /api/push/test
 * @access  Private
 */
export const sendTest = asyncHandler(async (req, res) => {
  if (!isPushConfigured()) {
    return res.status(503).json({ success: false, message: "Push is not configured" });
  }

  const result = await sendToUser(req.user._id, {
    title: "GBChat test notification",
    body: "If you can read this, push notifications reach this browser.",
    url: "/notifications",
    tag: "gbchat-test",
    type: "system",
    force: true,
    data: { kind: "test" },
  });

  res.json({
    success: result.sent > 0,
    message:
      result.sent > 0
        ? `Delivered to ${result.sent} browser${result.sent === 1 ? "" : "s"}`
        : result.skipped
        ? "No registered browsers for this account"
        : "Push service rejected the delivery",
    result,
  });
});

/**
 * @desc    Remove every subscription for this account (used by account cleanup)
 * @route   DELETE /api/push/subscriptions
 * @access  Private
 */
export const removeAll = asyncHandler(async (req, res) => {
  if (!dbReady()) {
    return res.status(503).json({ success: false, message: "Database unavailable" });
  }
  const result = await PushSubscription.deleteMany({ user: req.user._id });
  res.json({ success: true, removed: result.deletedCount || 0 });
});
