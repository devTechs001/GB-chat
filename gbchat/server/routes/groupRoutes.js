// server/routes/groupRoutes.js
import express from "express";
import {
  createGroup,
  updateGroup,
  addMembers,
  removeMember,
  leaveGroup,
  makeAdmin,
  updateGroupSettings,
} from "../controllers/groupController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.post("/", createGroup);
router.put("/:id", updateGroup);
router.post("/:id/members", addMembers);
router.delete("/:id/members/:memberId", removeMember);
router.post("/:id/leave", leaveGroup);
router.put("/:id/members/:memberId/admin", makeAdmin);
router.put("/:id/settings", updateGroupSettings);

export default router;