// server/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    about: {
      type: String,
      default: "Hey there! I'm using GBChat",
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["online", "offline", "busy", "away"],
      default: "offline",
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
    privacy: {
      lastSeen: {
        type: String,
        enum: ["everyone", "contacts", "nobody"],
        default: "everyone",
      },
      avatar: {
        type: String,
        enum: ["everyone", "contacts", "nobody"],
        default: "everyone",
      },
      about: {
        type: String,
        enum: ["everyone", "contacts", "nobody"],
        default: "everyone",
      },
      readReceipts: { type: Boolean, default: true },
      onlineStatus: { type: Boolean, default: true },
    },
    theme: {
      name: { type: String, default: "default" },
      wallpaper: { type: String, default: "" },
      fontSize: {
        type: String,
        enum: ["small", "medium", "large"],
        default: "medium",
      },
      bubbleStyle: {
        type: String,
        enum: ["rounded", "sharp", "modern", "minimal"],
        default: "modern",
      },
      chatBackground: { type: String, default: "" },
    },
    contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    pinnedChats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
    archivedChats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
    lockedChats: [
      {
        chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
        pin: String,
        useBiometric: { type: Boolean, default: false },
      },
    ],
    notifications: {
      messages: { type: Boolean, default: true },
      groups: { type: Boolean, default: true },
      calls: { type: Boolean, default: true },
      stories: { type: Boolean, default: true },
      channels: { type: Boolean, default: true },
      sound: { type: String, default: "default" },
      vibrate: { type: Boolean, default: true },
    },
    pushSubscription: { type: Object, default: null },
    dnd: {
      enabled: { type: Boolean, default: false },
      startTime: String,
      endTime: String,
      allowFrom: {
        type: String,
        enum: ["nobody", "favorites", "everyone"],
        default: "nobody",
      },
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicProfile = function () {
  return {
    _id: this._id,
    fullName: this.fullName,
    email: this.email,
    phone: this.phone,
    avatar: this.avatar,
    about: this.about,
    status: this.status,
    lastSeen: this.lastSeen,
  };
};

export default mongoose.model("User", userSchema);