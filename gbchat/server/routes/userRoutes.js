// server/routes/userRoutes.js
import express from "express";
import {
  searchUsers,
  getUserProfile,
  uploadAvatar,
  blockUser,
  getOnlineUsers,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(protect);
router.get("/search", searchUsers);
router.get("/online", getOnlineUsers);
router.get("/:id", getUserProfile);
router.post("/avatar", upload.single("avatar"), uploadAvatar);
router.post("/:userId/block", blockUser);

export default router;