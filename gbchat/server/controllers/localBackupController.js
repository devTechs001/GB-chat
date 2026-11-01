
// server/controllers/localBackupController.js
/**
 * Local SQLite mirror + offline reads.
 *
 * This is deliberately separate from `backupController.js` (the Mongo-backed
 * backup documents with scheduling/email). Here we keep a *single file per
 * user* on the API host that can be downloaded, re-imported and — crucially —
 * read from when Mongo is unreachable.
 */
import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import {
  deleteSnapshot,
  isSqliteAvailable,
  readSnapshot,
  snapshotPath,
  snapshotStatus,
  sqliteInfo,
  writeSnapshot,
} from "../services/sqliteStore.js";

const OFFLINE_MESSAGE_LIMIT = Number(process.env.OFFLINE_MESSAGE_LIMIT || 5000);

const normalizeChatForBackup = (chat, viewerId) => {
  const other = (chat.participants || []).find(
    (participant) => String(participant.user?._id || participant.user) !== String(viewerId)
  );
  return {
    _id: chat._id,
    name: chat.name || other?.user?.fullName || "Chat",
    avatar: chat.avatar || other?.user?.avatar || "",
    isGroup: Boolean(chat.isGroup || chat.type === "group"),
    lastMessageAt: chat.lastMessageAt || chat.updatedAt,
    unreadCount: chat.unreadCount || 0,
    participants: (chat.participants || []).map((participant) => ({
      user: participant.user?._id || participant.user,
      role: participant.role,
    })),
  };
};

// @desc    What the local mirror currently holds
// @route   GET /api/backup/local/status
export const getLocalStatus = async (req, res, next) => {
  try {
    res.json({
      success: true,
      sqlite: sqliteInfo(),
      backup: snapshotStatus(req.user._id),
      mongo: {
        connected: mongoose.connection.readyState === 1,
        state:
          ["disconnected", "connected", "connecting", "disconnecting"][
            mongoose.connection.readyState
          ] || "unknown",
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Write a fresh snapshot of my data into the local SQLite file
// @route   POST /api/backup/local/snapshot
export const createLocalSnapshot = async (req, res, next) => {
  try {
    if (!isSqliteAvailable()) {
      return res.status(503).json({
        success: false,
        code: "SQLITE_UNAVAILABLE",
        message: "Local backups need Node 22.5+ (node:sqlite)",
      });
    }

    const userId = req.user._id;
    const user = await User.findById(userId)
      .select(
        "fullName username email phone avatar about website location pronouns coverGradient statusText jobTitle timezone isVerified createdAt"
      )
      .lean();

    const chats = await Chat.find({ participants: { $elemMatch: { user: userId } } })
      .populate("participants.user", "fullName username avatar")
      .sort({ lastMessageAt: -1 })
      .limit(500)
      .lean();

    const chatIds = chats.map((chat) => chat._id);
    const messages = await Message.find({
      chat: { $in: chatIds },
      deletedFor: { $ne: userId },
    })
      .sort({ createdAt: -1 })
      .limit(OFFLINE_MESSAGE_LIMIT)
      .select("chat sender type content createdAt status")
      .populate("sender", "fullName username avatar")
      .lean();

    const contacts = await User.find({ _id: { $in: (req.user.contacts || []).slice(0, 1000) } })
      .select("fullName username avatar phone email about")
      .lean();

    const result = writeSnapshot(userId, {
      profile: user,
      chats: chats.map((chat) => normalizeChatForBackup(chat, userId)),
      messages: messages.reverse(),
      contacts,
    });

    res.json({
      success: true,
      message: "Local backup created",
      backup: { ...snapshotStatus(userId), ...result },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download the JSON export (portable, human readable)
// @route   GET /api/backup/local/export
export const exportLocalJson = async (req, res, next) => {
  try {
    const snapshot = readSnapshot(req.user._id);
    const filename = `gbchat-backup-${new Date().toISOString().slice(0, 10)}.json`;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(JSON.stringify(snapshot, null, 2));
  } catch (error) {
    next(error);
  }
};

// @desc    Download the SQLite file itself
// @route   GET /api/backup/local/download
export const downloadLocalFile = async (req, res, next) => {
  try {
    const file = snapshotPath(req.user._id);
    res.setHeader("Content-Type", "application/vnd.sqlite3");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="gbchat-${String(req.user._id)}.db"`
    );
    res.sendFile(file);
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, code: "NO_BACKUP", message: error.message });
    }
    next(error);
  }
};

// @desc    Restore a JSON export into the local mirror
// @route   POST /api/backup/local/import
export const importLocalJson = async (req, res, next) => {
  try {
    const payload = req.body;
    const chats = Array.isArray(payload?.chats) ? payload.chats : null;
    const messages = Array.isArray(payload?.messages) ? payload.messages : [];
    const contacts = Array.isArray(payload?.contacts) ? payload.contacts : [];

    if (!chats) {
      return res.status(400).json({
        success: false,
        code: "INVALID_BACKUP",
        message: "A backup needs a chats array",
      });
    }
    if (messages.length > 20000) {
      return res.status(413).json({
        success: false,
        code: "BACKUP_TOO_LARGE",
        message: "That export is larger than the 20 000 message limit",
      });
    }

    const result = writeSnapshot(req.user._id, {
      profile: payload.profile || null,
      chats,
      messages,
      contacts,
    });

    res.json({
      success: true,
      message: "Backup restored into the local mirror",
      backup: { ...snapshotStatus(req.user._id), ...result },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete the local copy
// @route   DELETE /api/backup/local
export const deleteLocalBackup = async (req, res, next) => {
  try {
    const removed = deleteSnapshot(req.user._id);
    res.json({ success: true, removed, message: "Local backup deleted" });
  } catch (error) {
    next(error);
  }
};

// @desc    Cheap probe: does a file exist and how big is it
// @route   GET /api/backup/local/exists
export const localBackupExists = async (req, res, next) => {
  try {
    const status = snapshotStatus(req.user._id);
    res.json({ success: true, exists: Boolean(status.exists), sizeBytes: status.sizeBytes || 0 });
  } catch (error) {
    next(error);
  }
};

// @desc    Recent chats from the local mirror (works with Mongo down)
// @route   GET /api/backup/offline/chats
export const getOfflineChats = async (req, res, next) => {
  try {
    if (!isSqliteAvailable()) {
      return res.status(503).json({ success: false, code: "SQLITE_UNAVAILABLE" });
    }
    const { chats } = readSnapshot(req.user._id);
    res.json({ success: true, offline: true, chats });
  } catch (error) {
    next(error);
  }
};

// @desc    Cached messages for one chat
// @route   GET /api/backup/offline/messages/:chatId
export const getOfflineMessages = async (req, res, next) => {
  try {
    if (!isSqliteAvailable()) {
      return res.status(503).json({ success: false, code: "SQLITE_UNAVAILABLE" });
    }
    const { messages } = readSnapshot(req.user._id);
    const chatId = String(req.params.chatId);
    const filtered = messages.filter((message) => {
      const id = typeof message.chat === "object" && message.chat ? message.chat._id : message.chat;
      return String(id) === chatId;
    });
    res.json({ success: true, offline: true, messages: filtered });
  } catch (error) {
    next(error);
  }
};
