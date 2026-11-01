// server/routes/channelRoutes.js
import express from "express";
import {
  createChannel,
  getChannels,
  getMyChannels,
  subscribeChannel,
  unsubscribeChannel,
  getChannel,
  getChannelStats,
  updateChannel,
  deleteChannel,
  likeChannelPost,
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
router.post("/:id/unsubscribe", unsubscribeChannel);
router.get("/:id", getChannel);
router.get("/:id/stats", getChannelStats);
router.patch("/:id", updateChannel);
router.put("/:id", updateChannel);
router.delete("/:id", deleteChannel);
router.post("/:id/posts", upload.single("media"), postToChannel);
router.get("/:id/posts", getChannelPosts);
router.post("/posts/:postId/like", likeChannelPost);

export default router;