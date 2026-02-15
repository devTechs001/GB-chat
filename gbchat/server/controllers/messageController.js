// server/controllers/messageController.js
import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import cloudinary from "../config/cloudinary.js";

export const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({
      chat: chatId,
      deletedFor: { $nin: [req.user._id] },
      isScheduled: false,
    })
      .populate("sender", "fullName avatar")
      .populate({
        path: "replyTo",
        populate: { path: "sender", select: "fullName" },
      })
      .populate("reactions.user", "fullName avatar")
      .populate("mentions", "fullName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Mark as read
    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: req.user._id },
        "readBy.user": { $ne: req.user._id },
      },
      {
        $addToSet: {
          readBy: { user: req.user._id, readAt: new Date() },
        },
      }
    );

    // Reset unread count
    await Chat.findOneAndUpdate(
      { _id: chatId, "unreadCounts.user": req.user._id },
      { $set: { "unreadCounts.$.count": 0 } }
    );

    res.json(messages.reverse());
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const {
      type = "text",
      text,
      replyTo,
      mentions,
      selfDestruct,
      scheduledAt,
    } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Check if user is participant
    const isParticipant = chat.participants.some(
      (p) => p.user.toString() === req.user._id.toString()
    );
    if (!isParticipant)
      return res.status(403).json({ message: "Not a participant" });

    // Check group settings
    if (
      chat.type === "group" &&
      chat.groupInfo?.settings?.onlyAdminsCanMessage
    ) {
      const participant = chat.participants.find(
        (p) => p.user.toString() === req.user._id.toString()
      );
      if (participant.role === "member") {
        return res.status(403).json({ message: "Only admins can message" });
      }
    }

    let mediaData = {};
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const resourceType = req.file.mimetype.startsWith("video")
        ? "video"
        : req.file.mimetype.startsWith("audio")
        ? "video"
        : "auto";

      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: resourceType,
        folder: "gbchat",
      });

      mediaData = {
        url: result.secure_url,
        filename: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        width: result.width,
        height: result.height,
        duration: result.duration,
      };
    }

    const messageData = {
      chat: chatId,
      sender: req.user._id,
      type,
      content: {
        text,
        media: Object.keys(mediaData).length > 0 ? mediaData : undefined,
      },
      replyTo: replyTo || undefined,
      mentions: mentions || [],
      isScheduled: !!scheduledAt,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      selfDestruct: selfDestruct
        ? { enabled: true, duration: selfDestruct }
        : undefined,
    };

    let message = await Message.create(messageData);

    message = await Message.findById(message._id)
      .populate("sender", "fullName avatar")
      .populate({
        path: "replyTo",
        populate: { path: "sender", select: "fullName" },
      })
      .populate("mentions", "fullName");

    // Update chat's last message
    if (!scheduledAt) {
      chat.lastMessage = message._id;

      // Increment unread count for other participants
      chat.unreadCounts.forEach((uc) => {
        if (uc.user.toString() !== req.user._id.toString()) {
          uc.count += 1;
        }
      });

      await chat.save();

      // Emit socket event
      const io = req.app.get("io");
      chat.participants.forEach((p) => {
        if (p.user.toString() !== req.user._id.toString()) {
          io.to(p.user.toString()).emit("newMessage", {
            message,
            chatId,
          });
        }
      });
    }

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

export const editMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.sender.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Can only edit your own messages" });
    }

    // Can only edit within 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (message.createdAt < oneHourAgo) {
      return res
        .status(400)
        .json({ message: "Can only edit messages within 1 hour" });
    }

    message.editHistory.push({
      text: message.content.text,
      editedAt: new Date(),
    });

    message.content.text = text;
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();

    const populated = await Message.findById(messageId)
      .populate("sender", "fullName avatar")
      .populate({
        path: "replyTo",
        populate: { path: "sender", select: "fullName" },
      });

    // Emit socket event
    const io = req.app.get("io");
    const chat = await Chat.findById(message.chat);
    chat.participants.forEach((p) => {
      io.to(p.user.toString()).emit("messageEdited", populated);
    });

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { forEveryone } = req.body;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (forEveryone) {
      if (message.sender.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Can only delete your own messages for everyone" });
      }

      message.deletedForEveryone = true;
      message.isDeleted = true;
      message.content = { text: "This message was deleted" };
      await message.save();

      const io = req.app.get("io");
      const chat = await Chat.findById(message.chat);
      chat.participants.forEach((p) => {
        io.to(p.user.toString()).emit("messageDeleted", {
          messageId,
          chatId: message.chat,
          forEveryone: true,
        });
      });
    } else {
      message.deletedFor.push(req.user._id);
      await message.save();
    }

    res.json({ message: "Message deleted" });
  } catch (error) {
    next(error);
  }
};

export const addReaction = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Remove existing reaction from this user
    message.reactions = message.reactions.filter(
      (r) => r.user.toString() !== req.user._id.toString()
    );

    // Add new reaction
    if (emoji) {
      message.reactions.push({ user: req.user._id, emoji });
    }

    await message.save();

    const populated = await Message.findById(messageId)
      .populate("reactions.user", "fullName avatar");

    const io = req.app.get("io");
    const chat = await Chat.findById(message.chat);
    chat.participants.forEach((p) => {
      io.to(p.user.toString()).emit("messageReaction", {
        messageId,
        chatId: message.chat,
        reactions: populated.reactions,
      });
    });

    res.json(populated.reactions);
  } catch (error) {
    next(error);
  }
};

export const starMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message) return res.status(404).json({ message: "Message not found" });

    const idx = message.isStarred.indexOf(req.user._id);
    if (idx > -1) {
      message.isStarred.splice(idx, 1);
    } else {
      message.isStarred.push(req.user._id);
    }

    await message.save();
    res.json({ starred: idx === -1 });
  } catch (error) {
    next(error);
  }
};

export const forwardMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { chatIds } = req.body;

    const original = await Message.findById(messageId);
    if (!original)
      return res.status(404).json({ message: "Message not found" });

    original.forwardCount += 1;
    await original.save();

    const forwarded = [];
    for (const chatId of chatIds) {
      const msg = await Message.create({
        chat: chatId,
        sender: req.user._id,
        type: original.type,
        content: original.content,
        forwardedFrom: original._id,
      });

      const populated = await Message.findById(msg._id)
        .populate("sender", "fullName avatar");

      forwarded.push(populated);

      await Chat.findByIdAndUpdate(chatId, { lastMessage: msg._id });

      const io = req.app.get("io");
      const chat = await Chat.findById(chatId);
      chat.participants.forEach((p) => {
        if (p.user.toString() !== req.user._id.toString()) {
          io.to(p.user.toString()).emit("newMessage", {
            message: populated,
            chatId,
          });
        }
      });
    }

    res.json(forwarded);
  } catch (error) {
    next(error);
  }
};

export const getStarredMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      isStarred: req.user._id,
      deletedFor: { $nin: [req.user._id] },
    })
      .populate("sender", "fullName avatar")
      .populate("chat", "type groupInfo.name")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const searchMessages = async (req, res, next) => {
  try {
    const { q, chatId } = req.query;

    const query = {
      "content.text": { $regex: q, $options: "i" },
      deletedFor: { $nin: [req.user._id] },
      deletedForEveryone: false,
    };

    if (chatId) query.chat = chatId;

    const messages = await Message.find(query)
      .populate("sender", "fullName avatar")
      .populate("chat", "type groupInfo.name participants.user")
      .sort({ createdAt: -1 })
      .limit(50);

    // Filter to only chats user is part of
    const filtered = messages.filter((msg) =>
      msg.chat.participants.some(
        (p) => p.user.toString() === req.user._id.toString()
      )
    );

    res.json(filtered);
  } catch (error) {
    next(error);
  }
};

export const getScheduledMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      sender: req.user._id,
      isScheduled: true,
      scheduledAt: { $gt: new Date() },
    })
      .populate("chat", "type groupInfo.name participants.user")
      .sort({ scheduledAt: 1 });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};