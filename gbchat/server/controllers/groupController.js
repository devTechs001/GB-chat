// server/controllers/groupController.js
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import crypto from "crypto";

export const createGroup = async (req, res, next) => {
  try {
    const { name, description, members, avatar } = req.body;

    if (!name) return res.status(400).json({ message: "Group name required" });
    if (!members || members.length < 1) {
      return res
        .status(400)
        .json({ message: "At least 1 member required" });
    }

    const participants = [
      { user: req.user._id, role: "admin" },
      ...members.map((id) => ({ user: id, role: "member" })),
    ];

    const inviteLink = crypto.randomBytes(16).toString("hex");

    const chat = await Chat.create({
      type: "group",
      participants,
      groupInfo: {
        name,
        description,
        avatar: avatar || "",
        createdBy: req.user._id,
        inviteLink,
      },
      unreadCounts: participants.map((p) => ({ user: p.user, count: 0 })),
    });

    // System message
    const systemMsg = await Message.create({
      chat: chat._id,
      sender: req.user._id,
      type: "system",
      content: { text: `${req.user.fullName} created the group "${name}"` },
    });

    chat.lastMessage = systemMsg._id;
    await chat.save();

    const populated = await Chat.findById(chat._id)
      .populate("participants.user", "fullName avatar status")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "fullName" },
      });

    // Notify members
    const io = req.app.get("io");
    members.forEach((memberId) => {
      io.to(memberId.toString()).emit("addedToGroup", populated);
    });

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const updateGroup = async (req, res, next) => {
  try {
    const { name, description, avatar } = req.body;
    const chat = await Chat.findById(req.params.id);

    if (!chat || chat.type !== "group") {
      return res.status(404).json({ message: "Group not found" });
    }

    const participant = chat.participants.find(
      (p) => p.user.toString() === req.user._id.toString()
    );

    if (
      chat.groupInfo.settings.onlyAdminsCanEditInfo &&
      participant?.role === "member"
    ) {
      return res.status(403).json({ message: "Only admins can edit group info" });
    }

    if (name) chat.groupInfo.name = name;
    if (description !== undefined) chat.groupInfo.description = description;
    if (avatar) chat.groupInfo.avatar = avatar;

    await chat.save();

    const populated = await Chat.findById(chat._id).populate(
      "participants.user",
      "fullName avatar status"
    );

    const io = req.app.get("io");
    chat.participants.forEach((p) => {
      io.to(p.user.toString()).emit("groupUpdated", populated);
    });

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

export const addMembers = async (req, res, next) => {
  try {
    const { members } = req.body;
    const chat = await Chat.findById(req.params.id);

    if (!chat || chat.type !== "group")
      return res.status(404).json({ message: "Group not found" });

    const participant = chat.participants.find(
      (p) => p.user.toString() === req.user._id.toString()
    );

    if (!participant || participant.role === "member") {
      return res.status(403).json({ message: "Only admins can add members" });
    }

    const currentCount = chat.participants.length;
    const maxMembers = chat.groupInfo.settings.maxMembers;

    if (currentCount + members.length > maxMembers) {
      return res.status(400).json({ message: `Maximum ${maxMembers} members` });
    }

    for (const memberId of members) {
      const exists = chat.participants.some(
        (p) => p.user.toString() === memberId
      );
      if (!exists) {
        chat.participants.push({ user: memberId, role: "member" });
        chat.unreadCounts.push({ user: memberId, count: 0 });
      }
    }

    await chat.save();

    const io = req.app.get("io");
    members.forEach((memberId) => {
      io.to(memberId.toString()).emit("addedToGroup", { chatId: chat._id });
    });

    res.json({ message: "Members added" });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    const chat = await Chat.findById(req.params.id);

    if (!chat || chat.type !== "group")
      return res.status(404).json({ message: "Group not found" });

    const requester = chat.participants.find(
      (p) => p.user.toString() === req.user._id.toString()
    );

    if (!requester || requester.role === "member") {
      return res.status(403).json({ message: "Only admins can remove members" });
    }

    chat.participants = chat.participants.filter(
      (p) => p.user.toString() !== memberId
    );
    chat.unreadCounts = chat.unreadCounts.filter(
      (uc) => uc.user.toString() !== memberId
    );

    await chat.save();

    const io = req.app.get("io");
    io.to(memberId).emit("removedFromGroup", { chatId: chat._id });

    res.json({ message: "Member removed" });
  } catch (error) {
    next(error);
  }
};

export const leaveGroup = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat || chat.type !== "group")
      return res.status(404).json({ message: "Group not found" });

    chat.participants = chat.participants.filter(
      (p) => p.user.toString() !== req.user._id.toString()
    );

    // If admin left, make oldest member admin
    const admins = chat.participants.filter((p) => p.role === "admin");
    if (admins.length === 0 && chat.participants.length > 0) {
      chat.participants[0].role = "admin";
    }

    if (chat.participants.length === 0) {
      chat.isActive = false;
    }

    await chat.save();

    const systemMsg = await Message.create({
      chat: chat._id,
      sender: req.user._id,
      type: "system",
      content: { text: `${req.user.fullName} left the group` },
    });

    res.json({ message: "Left group" });
  } catch (error) {
    next(error);
  }
};

export const makeAdmin = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    const chat = await Chat.findById(req.params.id);

    const requester = chat.participants.find(
      (p) => p.user.toString() === req.user._id.toString()
    );

    if (!requester || requester.role !== "admin") {
      return res.status(403).json({ message: "Only admins can promote" });
    }

    const target = chat.participants.find(
      (p) => p.user.toString() === memberId
    );
    if (target) target.role = "admin";

    await chat.save();
    res.json({ message: "Member promoted to admin" });
  } catch (error) {
    next(error);
  }
};

export const updateGroupSettings = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id);
    const { settings } = req.body;

    const requester = chat.participants.find(
      (p) => p.user.toString() === req.user._id.toString()
    );

    if (!requester || requester.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    chat.groupInfo.settings = { ...chat.groupInfo.settings, ...settings };
    await chat.save();

    res.json(chat.groupInfo.settings);
  } catch (error) {
    next(error);
  }
};