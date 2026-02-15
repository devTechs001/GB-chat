// server/routes/channelRoutes.js
import express from "express";
import {
  createChannel,
  getChannels,
  getMyChannels,
  subscribeChannel,
  postToChannel,
  getChannelPosts,
} from "../controllers/channelController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(protect);
router.get("/", getChannels);
router.get("/mine", getMyChannels);
router.post("/", createChannel);
router.post("/:id/subscribe", subscribeChannel);
router.post("/:id/posts", upload.single("media"), postToChannel);
router.get("/:id/posts", getChannelPosts);

export default router;