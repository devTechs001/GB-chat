// server/routes/chatRoutes.js
import express from "express";
import {
  unarchiveChat,
  unpinChat,
  unmuteChat,
  getChats,
  getOrCreateChat,
  getChatById,
  archiveChat,
  pinChat,
  muteChat,
  clearChat,
  deleteChat,
  getArchivedChats,
  markChatAsRead,
  getChatMedia,
  searchChatMessages,
  reportChat,
} from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getChats);
router.post("/", getOrCreateChat);
router.get("/archived", getArchivedChats);
router.get("/:id", getChatById);
router.post("/:id/read", markChatAsRead);
router.get("/:id/media", getChatMedia);
router.get("/:id/search", searchChatMessages);
router.post("/:id/report", reportChat);
router.put("/:id/archive", archiveChat);
router.post("/:id/archive", archiveChat);
router.put("/:id/unarchive", unarchiveChat);
router.post("/:id/unarchive", unarchiveChat);
router.put("/:id/pin", pinChat);
router.post("/:id/pin", pinChat);
router.put("/:id/unpin", unpinChat);
router.post("/:id/unpin", unpinChat);
router.put("/:id/mute", muteChat);
router.post("/:id/mute", muteChat);
router.put("/:id/unmute", unmuteChat);
router.post("/:id/unmute", unmuteChat);
router.delete("/:id/clear", clearChat);
router.post("/:id/clear", clearChat);
router.delete("/:id", deleteChat);

export default router;