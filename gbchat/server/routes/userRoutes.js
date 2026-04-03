// server/routes/userRoutes.js
import express from "express";
import {
  searchUsers,
  getUserProfile,
  uploadAvatar,
  blockUser,
  getOnlineUsers,
} from "../controllers/userController.js";
import {
  updateProfile,
} from "../controllers/authController.js";
import {
    getPrivacySettings,
    updatePrivacySettings
} from "../controllers/privacyController.js";
import { protect } from "../middleware/auth.js";
import { uploadAvatarDisk } from "../middleware/upload.js";

const router = express.Router();

router.use(protect);

// Privacy settings routes
router.get("/privacy-settings", getPrivacySettings);
router.patch("/privacy-settings", updatePrivacySettings);
router.put("/privacy-settings", updatePrivacySettings);

router.get("/search", searchUsers);
router.get("/online", getOnlineUsers);
router.get("/:id", getUserProfile);
router.post("/avatar", uploadAvatarDisk.single("avatar"), uploadAvatar);
router.patch("/profile", updateProfile);
router.post("/:userId/block", blockUser);

export default router;