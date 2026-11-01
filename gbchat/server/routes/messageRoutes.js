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

// Literal paths MUST stay above "/:chatId" & friends, otherwise Express
// matches "/schedule" as a chat id.
router.get("/starred", getStarredMessages);
router.get("/scheduled", getScheduledMessages);
router.get("/schedule", getScheduledMessages);
router.get("/search", searchMessages);
router.post("/schedule", scheduleMessage);
router.post("/cancel-schedule", cancelScheduledMessage);
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

// Scheduled messages are declared above (before "/:chatId") so they are
// reachable — see the note at the top of the file.

export default router;