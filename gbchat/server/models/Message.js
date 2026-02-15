// server/models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "text",
        "image",
        "video",
        "audio",
        "voice",
        "document",
        "location",
        "contact",
        "sticker",
        "gif",
        "poll",
        "system",
      ],
      default: "text",
    },
    content: {
      text: { type: String, maxlength: 65536 },
      media: {
        url: String,
        thumbnail: String,
        filename: String,
        fileSize: Number,
        mimeType: String,
        duration: Number,
        width: Number,
        height: Number,
      },
      location: {
        latitude: Number,
        longitude: Number,
        address: String,
      },
      contact: {
        name: String,
        phone: String,
        avatar: String,
      },
      poll: { type: mongoose.Schema.Types.ObjectId, ref: "Poll" },
    },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    forwardedFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    forwardCount: { type: Number, default: 0 },
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    readBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        readAt: { type: Date, default: Date.now },
      },
    ],
    deliveredTo: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        deliveredAt: { type: Date, default: Date.now },
      },
    ],
    isEdited: { type: Boolean, default: false },
    editedAt: Date,
    editHistory: [
      {
        text: String,
        editedAt: Date,
      },
    ],
    isDeleted: { type: Boolean, default: false },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    deletedForEveryone: { type: Boolean, default: false },
    isStarred: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isScheduled: { type: Boolean, default: false },
    scheduledAt: Date,
    selfDestruct: {
      enabled: { type: Boolean, default: false },
      duration: Number, // seconds
      viewedAt: Date,
    },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    formatting: {
      bold: [{ start: Number, end: Number }],
      italic: [{ start: Number, end: Number }],
      strikethrough: [{ start: Number, end: Number }],
      monospace: [{ start: Number, end: Number }],
    },
  },
  { timestamps: true }
);

messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ "content.text": "text" });

export default mongoose.model("Message", messageSchema);