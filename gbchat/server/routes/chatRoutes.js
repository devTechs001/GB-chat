// server/routes/chatRoutes.js
import express from "express";
import {
  getChats,
  getOrCreateChat,
  getChatById,
  archiveChat,
  pinChat,
  muteChat,
  clearChat,
  deleteChat,
  getArchivedChats,
} from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getChats);
router.post("/", getOrCreateChat);
router.get("/archived", getArchivedChats);
router.get("/:id", getChatById);
router.put("/:id/archive", archiveChat);
router.put("/:id/pin", pinChat);
router.put("/:id/mute", muteChat);
router.delete("/:id/clear", clearChat);
router.delete("/:id", deleteChat);

export default router;