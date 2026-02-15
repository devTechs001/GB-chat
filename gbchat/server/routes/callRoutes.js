// server/routes/callRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import Call from "../models/Call.js";

const router = express.Router();
router.use(protect);

router.get("/history", async (req, res, next) => {
  try {
    const calls = await Call.find({
      $or: [
        { caller: req.user._id },
        { "participants.user": req.user._id },
      ],
    })
      .populate("caller", "fullName avatar")
      .populate("participants.user", "fullName avatar")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(calls);
  } catch (error) {
    next(error);
  }
});

export default router;