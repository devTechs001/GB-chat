// server/routes/localBackupRoutes.js
import express from "express";
import {
  createLocalSnapshot,
  deleteLocalBackup,
  downloadLocalFile,
  exportLocalJson,
  getLocalStatus,
  importLocalJson,
  localBackupExists,
} from "../controllers/localBackupController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/status", getLocalStatus);
router.get("/exists", localBackupExists);
router.post("/snapshot", createLocalSnapshot);
router.get("/export", exportLocalJson);
router.get("/download", downloadLocalFile);
router.post("/import", importLocalJson);
router.delete("/", deleteLocalBackup);

export default router;
