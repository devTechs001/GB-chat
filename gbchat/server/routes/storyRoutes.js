// server/routes/storyRoutes.js
import express from "express";
import {
  createStory,
  getStories,
  viewStory,
  reactToStory,
  replyToStory,
  deleteStory,
  getMyStories,
  getStory,
  getStoryViewers,
} from "../controllers/storyController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(protect);
router.get("/", getStories);
router.get("/mine", getMyStories);
router.post("/", upload.single("media"), createStory);
router.post("/:id/view", viewStory);
router.post("/:id/react", reactToStory);
router.post("/:id/reply", replyToStory);
router.post("/:id/save", viewStory);
router.get("/:id/viewers", getStoryViewers);
router.get("/:id", getStory);
router.delete("/:id", deleteStory);

export default router;