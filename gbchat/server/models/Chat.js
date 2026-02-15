// server/models/Chat.js
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["private", "group", "channel", "broadcast"],
      default: "private",
    },
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: {
          type: String,
          enum: ["admin", "moderator", "member"],
          default: "member",
        },
        joinedAt: { type: Date, default: Date.now },
        nickname: String,
        isMuted: { type: Boolean, default: false },
        muteUntil: Date,
      },
    ],
    groupInfo: {
      name: { type: String, maxlength: 100 },
      description: { type: String, maxlength: 1024 },
      avatar: String,
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      inviteLink: String,
      settings: {
        onlyAdminsCanMessage: { type: Boolean, default: false },
        onlyAdminsCanEditInfo: { type: Boolean, default: true },
        approveNewMembers: { type: Boolean, default: false },
        messageDeletionTimer: {
          type: Number,
          enum: [0, 86400, 604800, 2592000],
          default: 0,
        },
        maxMembers: { type: Number, default: 1024 },
      },
    },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    pinnedMessages: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    ],
    unreadCounts: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        count: { type: Number, default: 0 },
      },
    ],
    isActive: { type: Boolean, default: true },
    wallpaper: String,
    labels: [
      {
        name: String,
        color: String,
      },
    ],
  },
  { timestamps: true }
);

chatSchema.index({ "participants.user": 1 });
chatSchema.index({ updatedAt: -1 });

export default mongoose.model("Chat", chatSchema);