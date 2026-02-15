// server/models/Story.js
import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "video", "text"],
      required: true,
    },
    content: {
      media: {
        url: String,
        thumbnail: String,
        duration: Number,
      },
      text: String,
      backgroundColor: String,
      fontFamily: String,
      fontColor: String,
    },
    caption: { type: String, maxlength: 700 },
    viewers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        viewedAt: { type: Date, default: Date.now },
        reaction: String,
      },
    ],
    privacy: {
      type: String,
      enum: ["everyone", "contacts", "selected", "except"],
      default: "contacts",
    },
    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    excludedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replies: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Story", storySchema);