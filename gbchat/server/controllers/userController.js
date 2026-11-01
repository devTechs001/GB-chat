// server/controllers/userController.js
import User from "../models/User.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import Story from "../models/Story.js";
import cloudinary from "../config/cloudinary.js";

export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { fullName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
      ],
    })
      .select("fullName username email phone avatar about status lastSeen isVerified")
      .limit(20);

    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      "fullName username email phone avatar about status statusText lastSeen privacy isVerified createdAt website location coverPhoto pronouns coverGradient"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    // Apply privacy settings
    const isContact = req.user.contacts.includes(user._id);
    const profile = user.toObject();

    if (
      user.privacy.lastSeen === "nobody" ||
      (user.privacy.lastSeen === "contacts" && !isContact)
    ) {
      delete profile.lastSeen;
    }

    if (
      user.privacy.about === "nobody" ||
      (user.privacy.about === "contacts" && !isContact)
    ) {
      delete profile.about;
    }

    // Additive extras used by the redesigned profile page. They never reveal
    // anything the caller could not already see, and failures are non-fatal.
    try {
      const chatIds = await Chat.find({ participants: { $in: [req.user._id, user._id] } })
        .select("_id name avatar isGroup participants")
        .lean();

      const directChatIds = chatIds.filter((c) => !c.isGroup).map((c) => c._id);
      const groupChats = chatIds.filter((c) => c.isGroup);

      const media = await Message.find({
        chat: { $in: directChatIds },
        type: { $in: ["image", "video"] },
        "content.media.url": { $exists: true, $ne: "" },
        deletedFor: { $ne: req.user._id },
      })
        .sort({ createdAt: -1 })
        .limit(12)
        .select("type content.media createdAt sender")
        .lean();

      profile.commonGroups = groupChats.slice(0, 10).map((group) => ({
        _id: group._id,
        name: group.name || "Group",
        avatar: group.avatar || "",
        memberCount: group.participants?.length || 0,
      }));

      profile.sharedMedia = media.map((message) => ({
        _id: message._id,
        type: message.type,
        url: message.content?.media?.url,
        thumbnail: message.content?.media?.thumbnail || message.content?.media?.url,
        createdAt: message.createdAt,
      }));

      profile.contact = req.user.contacts?.some(
        (id) => String(id) === String(user._id)
      ) || false;
    } catch (extrasError) {
      console.warn("[profile] extras unavailable:", extrasError.message);
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Profile statistics (contacts, chats, groups, media, stories)
// @route   GET /api/users/:id/stats
// @access  Private
// @note    One aggregate call keeps the profile page to a single request
//          instead of five, which matters once the API is behind a limiter.
export const getProfileStats = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("contacts createdAt isVerified");
    if (!user) return res.status(404).json({ message: "User not found" });

    const chats = await Chat.find({ participants: { $in: [userId] } })
      .select("_id isGroup participants")
      .lean();

    const directIds = chats.filter((c) => !c.isGroup).map((c) => c._id);
    const groupIds = chats.filter((c) => c.isGroup).map((c) => c._id);

    const [messagesSent, mediaCount, storiesCount] = await Promise.all([
      Message.countDocuments({ sender: userId, deletedFor: { $ne: userId } }),
      Message.countDocuments({
        chat: { $in: directIds },
        type: { $in: ["image", "video", "audio", "voice", "document"] },
      }),
      Story.countDocuments({ user: userId }),
    ]);

    res.json({
      success: true,
      stats: {
        contacts: user.contacts?.length || 0,
        chats: directIds.length,
        groups: groupIds.length,
        messagesSent,
        media: mediaCount,
        stories: storiesCount,
        memberSince: user.createdAt,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Shared media / links between the caller and this user
// @route   GET /api/users/:id/media
// @access  Private
export const getUserMedia = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const limit = Math.min(Number(req.query.limit) || 24, 60);

    const chats = await Chat.find({
      participants: { $in: [req.user._id, userId] },
      isGroup: false,
    })
      .select("_id")
      .lean();

    const chatIds = chats.map((c) => c._id);

    const messages = await Message.find({
      chat: { $in: chatIds },
      deletedFor: { $ne: req.user._id },
      $or: [
        { type: { $in: ["image", "video", "document", "audio", "voice"] } },
        { "content.text": { $regex: "https?://", $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("type content.media.url content.media.thumbnail content.media.filename content.media.mimeType content.text createdAt")
      .lean();

    res.json({
      success: true,
      media: messages.map((message) => {
        const media = message.content?.media || {};
        const kind =
          message.type === "image" || message.type === "video"
            ? message.type
            : media.url
              ? "document"
              : "link";
        return {
          _id: message._id,
          kind,
          type: message.type,
          url: media.url || null,
          thumbnail: media.thumbnail || media.url || null,
          filename: media.filename || "",
          mimeType: media.mimeType || "",
          text: message.content?.text || "",
          createdAt: message.createdAt,
        };
      }),
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ message: "No file provided. Please select an image file." });
    }

    console.log('Uploading avatar:', req.file.path, req.file.size, req.file.mimetype);

    // Validate file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({
        message: "Image size should be less than 5MB. Please choose a smaller file."
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'];
    const ext = req.file.mimetype.split('/')[1];
    if (!allowedTypes.includes(req.file.mimetype) && !['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
      return res.status(400).json({
        message: "Unsupported file type. Please use JPG, PNG, GIF, WEBP, SVG, or BMP."
      });
    }

    // Upload to Cloudinary so all users can see the profile image
    let avatarUrl;
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "gbchat/avatars",
        width: 500,
        height: 500,
        crop: "limit", // Preserve full image without aggressive cropping
        quality: 'auto',
        fetch_format: 'auto',
      });
      avatarUrl = result.secure_url;
      console.log('✓ Uploaded to Cloudinary:', avatarUrl);
    } catch (cloudinaryError) {
      // Fallback to local storage if Cloudinary fails
      console.log('Cloudinary failed, using local file:', cloudinaryError.message);
      avatarUrl = `/uploads/avatars/${req.file.filename}`;
      console.log('✓ Using local avatar:', avatarUrl);
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('fullName email phone avatar about status theme privacy notifications');

    // Return full user object
    res.json(user);
  } catch (error) {
    console.error('Avatar upload error:', error.message);
    console.error('Stack:', error.stack);

    // Handle multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: "File size too large. Maximum size is 5MB." });
    }

    next(error);
  }
};

// @desc    Remove the current user's avatar
// @route   DELETE /api/users/avatar
export const removeAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const previous = user.avatar;

    // Best-effort cleanup of locally stored files
    if (previous && previous.startsWith('/uploads/')) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.join(process.cwd(), previous.replace(/^\//, ''));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.warn('Avatar file cleanup skipped:', cleanupError.message);
      }
    }

    user.avatar = '';
    await user.save();

    const safeUser = await User.findById(user._id).select(
      'fullName email phone avatar about status theme privacy notifications'
    );

    res.json({ message: "Avatar removed", avatar: null, user: safeUser });
  } catch (error) {
    next(error);
  }
};

export const blockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(req.user._id);

    const idx = user.blockedUsers.indexOf(userId);
    if (idx > -1) {
      user.blockedUsers.splice(idx, 1);
    } else {
      user.blockedUsers.push(userId);
    }

    await user.save();
    res.json({ blocked: idx === -1 });
  } catch (error) {
    next(error);
  }
};

export const getOnlineUsers = async (req, res, next) => {
  try {
    const contacts = req.user.contacts;
    const onlineUsers = await User.find({
      _id: { $in: contacts },
      status: "online",
    }).select("_id fullName avatar");

    res.json(onlineUsers);
  } catch (error) {
    next(error);
  }
};
/**
 * POST /api/users/:userId/unblock
 * Explicit counterpart to /:userId/block (which toggles).
 */
export const unblockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(req.user._id);

    user.blockedUsers = (user.blockedUsers || []).filter(
      (id) => id.toString() !== userId
    );
    await user.save();

    res.json({ message: "User unblocked", blocked: false });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/blocked
 * Returns the accounts the current user has blocked.
 */
export const getBlockedUsers = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "blockedUsers",
      "fullName avatar phone about status lastSeen"
    );

    res.json(user.blockedUsers || []);
  } catch (error) {
    next(error);
  }
};

/** PATCH /api/users/status — update the presence line */
export const updateStatus = async (req, res, next) => {
  try {
    const { status, statusText } = req.body;
    const allowed = ["online", "offline", "busy", "away"];
    if (status !== undefined && !allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(", ")}` });
    }
    if (status === undefined && statusText === undefined) {
      return res.status(400).json({ message: "status or statusText is required" });
    }

    const patch = {};
    if (status !== undefined) patch.status = status;
    if (statusText !== undefined) patch.statusText = String(statusText).slice(0, 80);

    const user = await User.findByIdAndUpdate(req.user._id, patch, { new: true }).select(
      "-password"
    );

    res.json(user);
  } catch (error) {
    next(error);
  }
};
