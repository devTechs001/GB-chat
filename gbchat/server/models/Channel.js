// server/models/Channel.js
import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: { type: String, maxlength: 2048 },
    avatar: String,
    banner: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    subscribers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        subscribedAt: { type: Date, default: Date.now },
        isMuted: { type: Boolean, default: false },
      },
    ],
    subscriberCount: { type: Number, default: 0 },
    category: {
      type: String,
      enum: [
        "news",
        "entertainment",
        "technology",
        "sports",
        "education",
        "business",
        "lifestyle",
        "other",
      ],
      default: "other",
    },
    isVerified: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: true },
    inviteLink: String,
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  },
  { timestamps: true }
);

export default mongoose.model("Channel", channelSchema);