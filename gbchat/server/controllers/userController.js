// server/controllers/userController.js
import User from "../models/User.js";
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
      .select("fullName email phone avatar about status lastSeen")
      .limit(20);

    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      "fullName email phone avatar about status lastSeen privacy"
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

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ message: "No file provided" });
    }

    console.log('Uploading avatar:', req.file.path, req.file.size, req.file.mimetype);

    let avatarUrl;

    // Try Cloudinary, fallback to local storage
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "gbchat/avatars",
        width: 500,
        height: 500,
        crop: "fill",
        gravity: "face",
      });
      avatarUrl = result.secure_url;
      console.log('✓ Uploaded to Cloudinary:', avatarUrl);
    } catch (cloudinaryError) {
      console.log('Cloudinary failed, using local file:', cloudinaryError.message);
      // Fallback: use local file path
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