// server/controllers/channelController.js
import Channel from "../models/Channel.js";
import Message from "../models/Message.js";
import crypto from "crypto";

export const createChannel = async (req, res, next) => {
  try {
    const { name, username, description, category, avatar, isPublic } = req.body;

    const channel = await Channel.create({
      name,
      username: username.toLowerCase().replace(/\s/g, ""),
      description,
      category,
      avatar,
      isPublic: isPublic !== false,
      owner: req.user._id,
      admins: [req.user._id],
      subscribers: [{ user: req.user._id }],
      subscriberCount: 1,
      inviteLink: crypto.randomBytes(16).toString("hex"),
    });

    res.status(201).json(channel);
  } catch (error) {
    next(error);
  }
};

export const getChannels = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = { isPublic: true };
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: "i" };

    const channels = await Channel.find(query)
      .populate("owner", "fullName avatar")
      .sort({ subscriberCount: -1 })
      .limit(50);

    res.json(channels);
  } catch (error) {
    next(error);
  }
};

export const getMyChannels = async (req, res, next) => {
  try {
    const channels = await Channel.find({
      "subscribers.user": req.user._id,
    }).populate("owner", "fullName avatar");

    res.json(channels);
  } catch (error) {
    next(error);
  }
};

export const subscribeChannel = async (req, res, next) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    const isSubscribed = channel.subscribers.some(
      (s) => s.user.toString() === req.user._id.toString()
    );

    if (isSubscribed) {
      channel.subscribers = channel.subscribers.filter(
        (s) => s.user.toString() !== req.user._id.toString()
      );
      channel.subscriberCount -= 1;
    } else {
      channel.subscribers.push({ user: req.user._id });
      channel.subscriberCount += 1;
    }

    await channel.save();
    res.json({ subscribed: !isSubscribed, subscriberCount: channel.subscriberCount });
  } catch (error) {
    next(error);
  }
};

export const postToChannel = async (req, res, next) => {
  try {
    const channel = await Channel.findById(req.params.id);

    const isAdmin =
      channel.owner.toString() === req.user._id.toString() ||
      channel.admins.some((a) => a.toString() === req.user._id.toString());

    if (!isAdmin) {
      return res.status(403).json({ message: "Only admins can post" });
    }

    const { type, text } = req.body;

    let mediaData = {};
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto",
        folder: "gbchat/channels",
      });
      mediaData = { url: result.secure_url, filename: req.file.originalname };
    }

    // Create a pseudo-chat for channel messages
    const message = await Message.create({
      chat: channel._id,
      sender: req.user._id,
      type: type || "text",
      content: {
        text,
        media: Object.keys(mediaData).length > 0 ? mediaData : undefined,
      },
    });

    channel.posts.push(message._id);
    await channel.save();

    const populated = await Message.findById(message._id).populate(
      "sender",
      "fullName avatar"
    );

    // Notify subscribers
    const io = req.app.get("io");
    channel.subscribers.forEach((s) => {
      io.to(s.user.toString()).emit("channelPost", {
        channelId: channel._id,
        message: populated,
      });
    });

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const getChannelPosts = async (req, res, next) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    const { page = 1, limit = 30 } = req.query;

    const posts = await Message.find({ _id: { $in: channel.posts } })
      .populate("sender", "fullName avatar")
      .populate("reactions.user", "fullName avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(posts.reverse());
  } catch (error) {
    next(error);
  }
};