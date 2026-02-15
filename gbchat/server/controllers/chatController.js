// server/controllers/chatController.js
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

export const getChats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({
      "participants.user": userId,
      isActive: true,
    })
      .populate("participants.user", "fullName avatar status lastSeen about")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "fullName avatar" },
      })
      .sort({ updatedAt: -1 });

    // Filter out archived chats
    const archivedIds = req.user.archivedChats.map((id) => id.toString());
    const activeChats = chats.filter(
      (chat) => !archivedIds.includes(chat._id.toString())
    );

    res.json(activeChats);
  } catch (error) {
    next(error);
  }
};

export const getOrCreateChat = async (req, res, next) => {
  try {
    const { participantId } = req.body;
    const userId = req.user._id;

    // Find existing private chat
    let chat = await Chat.findOne({
      type: "private",
      "participants.user": { $all: [userId, participantId] },
    })
      .populate("participants.user", "fullName avatar status lastSeen about")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "fullName avatar" },
      });

    if (!chat) {
      chat = await Chat.create({
        type: "private",
        participants: [
          { user: userId, role: "member" },
          { user: participantId, role: "member" },
        ],
        unreadCounts: [
          { user: userId, count: 0 },
          { user: participantId, count: 0 },
        ],
      });

      chat = await Chat.findById(chat._id).populate(
        "participants.user",
        "fullName avatar status lastSeen about"
      );
    }

    res.json(chat);
  } catch (error) {
    next(error);
  }
};

export const getChatById = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate("participants.user", "fullName avatar status lastSeen about")
      .populate({
        path: "pinnedMessages",
        populate: { path: "sender", select: "fullName avatar" },
      });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json(chat);
  } catch (error) {
    next(error);
  }
};

export const archiveChat = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const chatId = req.params.id;

    const idx = user.archivedChats.indexOf(chatId);
    if (idx > -1) {
      user.archivedChats.splice(idx, 1);
    } else {
      user.archivedChats.push(chatId);
    }

    await user.save();
    res.json({ archived: idx === -1 });
  } catch (error) {
    next(error);
  }
};

export const pinChat = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const chatId = req.params.id;

    const idx = user.pinnedChats.indexOf(chatId);
    if (idx > -1) {
      user.pinnedChats.splice(idx, 1);
    } else {
      if (user.pinnedChats.length >= 5) {
        return res.status(400).json({ message: "Maximum 5 pinned chats" });
      }
      user.pinnedChats.push(chatId);
    }

    await user.save();
    res.json({ pinned: idx === -1 });
  } catch (error) {
    next(error);
  }
};

export const muteChat = async (req, res, next) => {
  try {
    const { duration } = req.body; // hours, 0 = unmute
    const chat = await Chat.findById(req.params.id);

    const participant = chat.participants.find(
      (p) => p.user.toString() === req.user._id.toString()
    );

    if (participant) {
      participant.isMuted = duration > 0;
      participant.muteUntil =
        duration > 0
          ? new Date(Date.now() + duration * 60 * 60 * 1000)
          : null;
      await chat.save();
    }

    res.json({ muted: duration > 0 });
  } catch (error) {
    next(error);
  }
};

export const clearChat = async (req, res, next) => {
  try {
    await Message.updateMany(
      { chat: req.params.id },
      { $addToSet: { deletedFor: req.user._id } }
    );

    res.json({ message: "Chat cleared" });
  } catch (error) {
    next(error);
  }
};

export const deleteChat = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (chat.type === "private") {
      await Message.updateMany(
        { chat: req.params.id },
        { $addToSet: { deletedFor: req.user._id } }
      );

      const participant = chat.participants.find(
        (p) => p.user.toString() === req.user._id.toString()
      );
      if (participant) {
        chat.participants = chat.participants.filter(
          (p) => p.user.toString() !== req.user._id.toString()
        );
        if (chat.participants.length === 0) chat.isActive = false;
        await chat.save();
      }
    }

    res.json({ message: "Chat deleted" });
  } catch (error) {
    next(error);
  }
};

export const getArchivedChats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const chats = await Chat.find({
      _id: { $in: user.archivedChats },
    })
      .populate("participants.user", "fullName avatar status lastSeen")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "fullName" },
      });

    res.json(chats);
  } catch (error) {
    next(error);
  }
};