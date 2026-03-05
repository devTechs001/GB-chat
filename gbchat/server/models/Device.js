// server/models/Device.js
import mongoose from "mongoose";
import crypto from "crypto";

const deviceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    deviceName: {
      type: String,
      required: true,
      trim: true,
    },
    deviceType: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "web", "unknown"],
      default: "unknown",
    },
    platform: {
      type: String,
      enum: ["windows", "macos", "linux", "android", "ios", "web", "unknown"],
      default: "unknown",
    },
    browser: {
      type: String,
      default: "unknown",
    },
    os: {
      type: String,
      default: "unknown",
    },
    deviceToken: {
      type: String,
      required: true,
      unique: true,
    },
    sessionToken: {
      type: String,
      required: true,
    },
    qrCode: {
      type: String, // Store QR code data temporarily
      expiresAt: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    pushSubscription: {
      type: Object,
      default: null,
    },
    linkedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Generate unique device token
deviceSchema.pre("save", async function (next) {
  if (!this.deviceToken) {
    this.deviceToken = crypto.randomBytes(32).toString("hex");
  }
  if (!this.sessionToken) {
    this.sessionToken = crypto.randomBytes(64).toString("hex");
  }
  next();
});

// Index for efficient queries
deviceSchema.index({ deviceToken: 1 });
deviceSchema.index({ sessionToken: 1 });
deviceSchema.index({ user: 1, isActive: 1 });

// Method to check if device is expired
deviceSchema.methods.isExpired = function () {
  if (this.expiresAt) {
    return new Date() > this.expiresAt;
  }
  return false;
};

// Method to update last seen
deviceSchema.methods.updateLastSeen = async function () {
  this.lastSeen = new Date();
  await this.save();
};

// Static method to generate QR code data
deviceSchema.statics.generateQRData = function () {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  return {
    token,
    expiresAt,
    qrString: `gbchat://link?token=${token}&expires=${expiresAt.getTime()}`,
  };
};

export default mongoose.model("Device", deviceSchema);
