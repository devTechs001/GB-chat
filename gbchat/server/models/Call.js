// server/models/Call.js
import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    caller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        joinedAt: Date,
        leftAt: Date,
        status: {
          type: String,
          enum: ["ringing", "accepted", "declined", "missed", "busy"],
          default: "ringing",
        },
      },
    ],
    type: {
      type: String,
      enum: ["audio", "video"],
      required: true,
    },
    isGroup: { type: Boolean, default: false },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    startedAt: Date,
    endedAt: Date,
    duration: Number,
    status: {
      type: String,
      enum: ["initiated", "ringing", "ongoing", "ended", "missed", "declined"],
      default: "initiated",
    },
    recording: {
      url: String,
      duration: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Call", callSchema);