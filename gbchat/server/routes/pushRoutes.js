// server/routes/pushRoutes.js
import express from "express";
import {
  getPublicKey,
  subscribe,
  unsubscribe,
  status,
  sendTest,
  removeAll,
} from "../controllers/pushController.js";
import { protect } from "../middleware/auth.js";
import { writeLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.use(protect);

router.get("/public-key", getPublicKey);
router.get("/status", status);

router.post("/subscribe", writeLimiter, subscribe);
router.delete("/subscribe", writeLimiter, unsubscribe);
router.delete("/subscriptions", writeLimiter, removeAll);
router.post("/test", writeLimiter, sendTest);

export default router;
