// server/models/Poll.js
import mongoose from "mongoose";

const pollSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, maxlength: 500 },
    options: [
      {
        text: { type: String, required: true },
        votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      },
    ],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    allowMultipleVotes: { type: Boolean, default: false },
    isAnonymous: { type: Boolean, default: false },
    expiresAt: Date,
    isClosed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Poll", pollSchema);