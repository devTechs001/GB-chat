// server/routes/deviceRoutes.js
import express from "express";
import {
  generateQRCode,
  verifyQRCode,
  getLinkedDevices,
  unlinkDevice,
  updateDeviceLastSeen,
  refreshSession,
  linkDeviceByPhone,
  getQRCodeStatus,
} from "../controllers/deviceController.js";
import { protect } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// QR Code generation and verification
router.post("/generate-qr", authLimiter, generateQRCode);
router.post("/verify-qr", authLimiter, verifyQRCode);
router.get("/qr-status/:deviceId", getQRCodeStatus);

// Device management
router.get("/linked", getLinkedDevices);
router.delete("/:deviceId", unlinkDevice);
router.post("/:deviceId/refresh", refreshSession);
router.post("/:deviceId/heartbeat", updateDeviceLastSeen);

// Alternative linking methods
router.post("/link-phone", authLimiter, linkDeviceByPhone);

export default router;
