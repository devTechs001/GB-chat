// server/routes/authRoutes.js
import express from "express";
import {
  register,
  login,
  phoneLogin,
  logout,
  getMe,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { initiatePhoneVerification, verifyPhoneNumber, resendVerificationCode } from "../controllers/phoneVerificationController.js";

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/phone-login", authLimiter, phoneLogin);
router.post("/phone-verify", authLimiter, initiatePhoneVerification);
router.post("/phone-verify/resend", authLimiter, resendVerificationCode);
router.post("/phone-verify/confirm", authLimiter, verifyPhoneNumber);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

export default router;