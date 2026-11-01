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
  getHighlights,
  createHighlight,
  updateHighlight,
  deleteHighlight,
} from "../controllers/storyController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(protect);
router.get("/", getStories);
router.get("/mine", getMyStories);

// Highlights — must stay above "/:id" so they are not swallowed by it
router.get("/highlights", getHighlights);
router.post("/highlights", createHighlight);
router.patch("/highlights/:id", updateHighlight);
router.delete("/highlights/:id", deleteHighlight);
router.post("/", upload.single("media"), createStory);
router.post("/:id/view", viewStory);
router.post("/:id/react", reactToStory);
router.post("/:id/reply", replyToStory);
router.post("/:id/save", viewStory);
router.get("/:id/viewers", getStoryViewers);
router.get("/:id", getStory);
router.delete("/:id", deleteStory);

export default router;