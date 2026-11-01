// server/routes/offlineRoutes.js
import express from "express";
import { getOfflineChats, getOfflineMessages } from "../controllers/localBackupController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/chats", getOfflineChats);
router.get("/messages/:chatId", getOfflineMessages);

export default router;
