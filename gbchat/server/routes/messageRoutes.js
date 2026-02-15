// server/routes/messageRoutes.js
import express from "express";
import {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  starMessage,
  forwardMessage,
  getStarredMessages,
  searchMessages,
  getScheduledMessages,
} from "../controllers/messageController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(protect);
router.get("/starred", getStarredMessages);
router.get("/scheduled", getScheduledMessages);
router.get("/search", searchMessages);
router.get("/:chatId", getMessages);
router.post("/:chatId", upload.single("media"), sendMessage);
router.put("/:messageId/edit", editMessage);
router.delete("/:messageId", deleteMessage);
router.post("/:messageId/react", addReaction);
router.post("/:messageId/star", starMessage);
router.post("/:messageId/forward", forwardMessage);

export default router;