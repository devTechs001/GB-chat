// server/routes/messageRoutes.js
import express from "express";
import {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  starMessage,
  unstarMessage,
  scheduleMessage,
  forwardMessage,
  getStarredMessages,
  searchMessages,
  getScheduledMessages,
  cancelScheduledMessage,
  sendVoiceMessage,
  getMessageReactions,
} from "../controllers/messageController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(protect);

// Get messages
router.get("/starred", getStarredMessages);
router.get("/scheduled", getScheduledMessages);
router.get("/search", searchMessages);
router.get("/:chatId", getMessages);

// Send messages (including voice)
router.post("/:chatId", upload.single("media"), sendMessage);
router.post("/:chatId/voice", upload.single("audio"), sendVoiceMessage);

// Message actions
router.put("/:messageId/edit", editMessage);
router.delete("/:messageId", deleteMessage);
router.post("/:messageId/react", addReaction);
router.delete("/:messageId/react/:emoji", removeReaction);
router.post("/:messageId/star", starMessage);
router.post("/:messageId/unstar", unstarMessage);
router.post("/:messageId/forward", forwardMessage);
router.get("/:messageId/reactions", getMessageReactions);

// Scheduled messages
// NOTE: POST /schedule now creates a scheduled message (it used to be bound to
// the list handler, which made scheduling impossible). GET /scheduled lists them.
router.post("/schedule", scheduleMessage);
router.get("/schedule", getScheduledMessages);
router.post("/cancel-schedule", cancelScheduledMessage);

export default router;