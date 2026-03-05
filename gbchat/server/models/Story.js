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
        saved: { type: Boolean, default: false }, // Track if viewer saved the story
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
    // Story owner settings
    settings: {
      allowSaving: { type: Boolean, default: true }, // Allow viewers to save story
      allowSharing: { type: Boolean, default: true }, // Allow viewers to share story
      showViewCount: { type: Boolean, default: true }, // Show view count
      allowReplies: { type: Boolean, default: true }, // Allow replies
    },
    // Analytics
    analytics: {
      views: { type: Number, default: 0 },
      uniqueViews: { type: Number, default: 0 },
      replies: { type: Number, default: 0 },
      reactions: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      saves: { type: Number, default: 0 }, // Count how many times saved
      screenshots: { type: Number, default: 0 }, // Track screenshots if possible
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      index: { expireAfterSeconds: 0 }, // Auto-delete after expiry
    },
    isActive: { type: Boolean, default: true },
    isPinned: { type: Boolean, default: false }, // Pin to highlights
    highlightId: { type: mongoose.Schema.Types.ObjectId, ref: "StoryHighlight" }, // Link to highlight if saved
  },
  { timestamps: true }
);

// Index for efficient queries
storySchema.index({ user: 1, createdAt: -1 });
storySchema.index({ expiresAt: 1 });

export default mongoose.model("Story", storySchema);