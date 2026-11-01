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
      .populate("participants.user", "fullName avatar status lastSeen about email phone username location isVerified createdAt bio")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "fullName avatar _id"
        },
        select: "content type status createdAt sender readBy deliveredAt"
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

export const markChatAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    await Chat.findOneAndUpdate(
      { _id: id, "participants.user": userId },
      { $set: { "participants.$.unreadCount": 0 } }
    );

    // Also mark messages as read
    await Message.updateMany(
      {
        chat: id,
        sender: { $ne: userId },
        "readBy.user": { $ne: userId },
      },
      {
        $addToSet: {
          readBy: { user: userId, readAt: new Date() },
        },
      }
    );

    res.json({ success: true });
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
      .populate("participants.user", "fullName avatar status lastSeen about email phone username location isVerified createdAt bio")
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
        "fullName avatar status lastSeen about email phone username location isVerified createdAt bio"
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
      .populate("participants.user", "fullName avatar status lastSeen about email phone username location isVerified createdAt bio")
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
      .populate("participants.user", "fullName avatar status lastSeen about email phone username location isVerified createdAt bio")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "fullName" },
      });

    res.json(chats);
  } catch (error) {
    next(error);
  }
};
/** PUT/POST /api/chats/:id/unarchive — force-remove from the archive list */
export const unarchiveChat = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.archivedChats = user.archivedChats.filter(
      (id) => id.toString() !== req.params.id
    );
    await user.save();
    res.json({ archived: false });
  } catch (error) {
    next(error);
  }
};

/** PUT/POST /api/chats/:id/unpin — force-unpin */
export const unpinChat = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.pinnedChats = user.pinnedChats.filter(
      (id) => id.toString() !== req.params.id
    );
    await user.save();
    res.json({ pinned: false });
  } catch (error) {
    next(error);
  }
};

/** PUT/POST /api/chats/:id/unmute — force-unmute */
export const unmuteChat = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const participant = chat.participants.find(
      (p) => p.user.toString() === req.user._id.toString()
    );

    if (participant) {
      participant.isMuted = false;
      participant.muteUntil = null;
      await chat.save();
    }

    res.json({ muted: false });
  } catch (error) {
    next(error);
  }
};

/** GET /api/chats/:id/media — shared media for the media gallery */
export const getChatMedia = async (req, res, next) => {
  try {
    const media = await Message.find({
      chat: req.params.id,
      type: { $in: ["image", "video", "audio", "voice", "document"] },
    })
      .select("type content createdAt sender")
      .populate("sender", "fullName avatar")
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(media);
  } catch (error) {
    next(error);
  }
};

/** GET /api/chats/:id/search?q=term — search inside a conversation */
export const searchChatMessages = async (req, res, next) => {
  try {
    const query = (req.query.q || "").trim();
    if (!query) return res.json([]);

    const results = await Message.find({
      chat: req.params.id,
      "content.text": { $regex: query, $options: "i" },
    })
      .select("content type createdAt sender")
      .populate("sender", "fullName avatar")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(results);
  } catch (error) {
    next(error);
  }
};

/** POST /api/chats/:id/report — report a conversation */
export const reportChat = async (req, res, next) => {
  try {
    const io = req.app.get("io");
    if (io) {
      io.to(req.params.id).emit("chatReported", {
        chatId: req.params.id,
        reportedBy: req.user._id,
        reason: req.body?.reason || "unspecified",
      });
    }

    res.json({ message: "Report submitted" });
  } catch (error) {
    next(error);
  }
};
