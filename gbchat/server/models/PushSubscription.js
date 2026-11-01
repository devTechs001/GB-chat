// server/models/PushSubscription.js
import mongoose from "mongoose";
import crypto from "crypto";

/**
 * Web Push subscription for one browser profile.
 *
 * A user can (and usually does) have several: phone, laptop, a second browser.
 * Endpoints are long, opaque URLs handed out by the browser's push service, so
 * we index a SHA-256 of the endpoint instead of the raw value — this keeps the
 * unique index inside Mongo's 1024-byte key limit and avoids leaking the
 * capability URL into index files.
 */
const pushSubscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    endpoint: { type: String, required: true },
    endpointHash: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, default: "" },
      auth: { type: String, default: "" },
    },
    expirationTime: { type: Number, default: null },
    userAgent: { type: String, default: "" },
    platform: { type: String, default: "web" },
    isActive: { type: Boolean, default: true },
    failureCount: { type: Number, default: 0 },
    lastError: { type: String, default: "" },
    lastUsedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

pushSubscriptionSchema.index({ user: 1, isActive: 1 });

export const hashEndpoint = (endpoint) =>
  crypto.createHash("sha256").update(String(endpoint)).digest("hex");

pushSubscriptionSchema.pre("validate", function next(next) {
  if (this.endpoint && !this.endpointHash) {
    this.endpointHash = hashEndpoint(this.endpoint);
  }
  next();
});

/** Shape expected by web-push, or null when the record is incomplete. */
pushSubscriptionSchema.methods.toWebPush = function toWebPush() {
  if (!this.endpoint || !this.keys?.p256dh || !this.keys?.auth) return null;
  return {
    endpoint: this.endpoint,
    keys: { p256dh: this.keys.p256dh, auth: this.keys.auth },
    expirationTime: this.expirationTime ?? null,
  };
};

/** True for "this endpoint is gone forever" push-service replies. */
export const isGoneStatus = (statusCode) => statusCode === 404 || statusCode === 410;

const PushSubscription = mongoose.model("PushSubscription", pushSubscriptionSchema);

export default PushSubscription;
