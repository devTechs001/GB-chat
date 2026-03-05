// server/controllers/deviceController.js
import Device from "../models/Device.js";
import User from "../models/User.js";
import QRCode from "qrcode";
import crypto from "crypto";
import { getIO } from "../socket/index.js";

// Generate QR code for device linking
export const generateQRCode = async (req, res) => {
  try {
    const userId = req.user._id;

    // Generate QR data
    const qrData = Device.generateQRData();

    // Create a pending device entry
    const device = await Device.create({
      user: userId,
      deviceName: "Pending Device",
      deviceType: "unknown",
      platform: "unknown",
      deviceToken: qrData.token,
      sessionToken: crypto.randomBytes(64).toString("hex"),
      qrCode: qrData.qrString,
      expiresAt: qrData.expiresAt,
      isActive: false,
    });

    // Generate QR code as base64
    const qrCodeDataUrl = await QRCode.toDataURL(qrData.qrString, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: "H",
    });

    res.json({
      success: true,
      qrCode: qrCodeDataUrl,
      token: qrData.token,
      expiresAt: qrData.expiresAt,
      deviceId: device._id,
    });
  } catch (error) {
    console.error("Generate QR Code error:", error);
    res.status(500).json({ message: "Failed to generate QR code", error: error.message });
  }
};

// Verify QR code and link device
export const verifyQRCode = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Find the pending device
    const device = await Device.findOne({
      deviceToken: token,
      isActive: false,
      expiresAt: { $gt: new Date() },
    }).populate("user");

    if (!device) {
      return res.status(400).json({ message: "Invalid or expired QR code" });
    }

    // Get device info from request
    const { deviceName, deviceType, platform, browser, os } = req.body;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Update device info
    device.deviceName = deviceName || "Linked Device";
    device.deviceType = deviceType || "unknown";
    device.platform = platform || "unknown";
    device.browser = browser || "unknown";
    device.os = os || "unknown";
    device.userAgent = userAgent;
    device.ipAddress = ipAddress;
    device.isActive = true;
    device.linkedAt = new Date();
    device.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await device.save();

    // Notify the primary device via socket
    const io = getIO();
    if (io) {
      io.to(device.user._id.toString()).emit("device:linked", {
        deviceId: device._id,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        linkedAt: device.linkedAt,
      });
    }

    res.json({
      success: true,
      message: "Device linked successfully",
      device: {
        id: device._id,
        name: device.deviceName,
        type: device.deviceType,
        platform: device.platform,
        linkedAt: device.linkedAt,
        expiresAt: device.expiresAt,
      },
    });
  } catch (error) {
    console.error("Verify QR Code error:", error);
    res.status(500).json({ message: "Failed to verify QR code", error: error.message });
  }
};

// Get all linked devices
export const getLinkedDevices = async (req, res) => {
  try {
    const userId = req.user._id;

    const devices = await Device.find({
      user: userId,
      isActive: true,
    }).sort({ linkedAt: -1 });

    res.json({
      success: true,
      devices: devices.map((device) => ({
        id: device._id,
        name: device.deviceName,
        type: device.deviceType,
        platform: device.platform,
        browser: device.browser,
        os: device.os,
        isPrimary: device.isPrimary,
        lastSeen: device.lastSeen,
        linkedAt: device.linkedAt,
        expiresAt: device.expiresAt,
        ipAddress: device.ipAddress?.split(".").slice(0, 2).join(".") + ".*.*", // Mask IP
      })),
    });
  } catch (error) {
    console.error("Get Linked Devices error:", error);
    res.status(500).json({ message: "Failed to get linked devices", error: error.message });
  }
};

// Unlink/remove a device
export const unlinkDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const userId = req.user._id;

    const device = await Device.findOne({
      _id: deviceId,
      user: userId,
    });

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    // Don't allow removing primary device
    if (device.isPrimary) {
      return res.status(400).json({ message: "Cannot remove primary device" });
    }

    device.isActive = false;
    await device.save();

    // Notify the device to logout
    const io = getIO();
    if (io) {
      io.emit("device:unlinked", { deviceId: device._id });
    }

    res.json({
      success: true,
      message: "Device unlinked successfully",
    });
  } catch (error) {
    console.error("Unlink Device error:", error);
    res.status(500).json({ message: "Failed to unlink device", error: error.message });
  }
};

// Update device last seen
export const updateDeviceLastSeen = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const userId = req.user._id;

    const device = await Device.findOne({
      _id: deviceId,
      user: userId,
      isActive: true,
    });

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    await device.updateLastSeen();

    res.json({
      success: true,
      lastSeen: device.lastSeen,
    });
  } catch (error) {
    console.error("Update Last Seen error:", error);
    res.status(500).json({ message: "Failed to update last seen", error: error.message });
  }
};

// Refresh device session
export const refreshSession = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const userId = req.user._id;

    const device = await Device.findOne({
      _id: deviceId,
      user: userId,
      isActive: true,
    });

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    // Generate new session token
    device.sessionToken = crypto.randomBytes(64).toString("hex");
    device.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    device.lastSeen = new Date();

    await device.save();

    res.json({
      success: true,
      message: "Session refreshed successfully",
      expiresAt: device.expiresAt,
    });
  } catch (error) {
    console.error("Refresh Session error:", error);
    res.status(500).json({ message: "Failed to refresh session", error: error.message });
  }
};

// Link device via phone number (alternative to QR)
export const linkDeviceByPhone = async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;

    if (!phoneNumber || !code) {
      return res.status(400).json({ message: "Phone number and code are required" });
    }

    // Find user by phone
    const user = await User.findOne({ phone: phoneNumber });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify OTP (using existing phone verification service)
    // This would integrate with your existing phone verification system
    // For now, we'll create a simple device link

    const { deviceName, deviceType, platform } = req.body;

    const device = await Device.create({
      user: user._id,
      deviceName: deviceName || "Linked Device",
      deviceType: deviceType || "mobile",
      platform: platform || "unknown",
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.json({
      success: true,
      message: "Device linked successfully via phone",
      device: {
        id: device._id,
        name: device.deviceName,
        type: device.deviceType,
      },
    });
  } catch (error) {
    console.error("Link Device By Phone error:", error);
    res.status(500).json({ message: "Failed to link device", error: error.message });
  }
};

// Get QR code status (polling endpoint)
export const getQRCodeStatus = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const device = await Device.findById(deviceId);

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    const isExpired = device.expiresAt && new Date() > device.expiresAt;

    res.json({
      success: true,
      isActive: device.isActive,
      isExpired,
      linkedAt: device.linkedAt,
    });
  } catch (error) {
    console.error("Get QR Code Status error:", error);
    res.status(500).json({ message: "Failed to get status", error: error.message });
  }
};
