// server/controllers/authController.js
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import crypto from "crypto";

export const register = async (req, res, next) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      fullName,
      email,
      phone,
      password,
    });

    const token = generateToken(user._id, res);

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      about: user.about,
      status: user.status,
      theme: user.theme,
      privacy: user.privacy,
      notifications: user.notifications,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    user.status = "online";
    user.lastSeen = new Date();
    await user.save();

    const token = generateToken(user._id, res);

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      about: user.about,
      status: user.status,
      theme: user.theme,
      privacy: user.privacy,
      notifications: user.notifications,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      status: "offline",
      lastSeen: new Date(),
    });

    res.cookie("gbchat_token", "", { maxAge: 0 });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, about, avatar, phone, theme, privacy, notifications } =
      req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (about !== undefined) updateData.about = about;
    if (avatar) updateData.avatar = avatar;
    if (phone) updateData.phone = phone;
    if (theme) updateData.theme = { ...req.user.theme, ...theme };
    if (privacy) updateData.privacy = { ...req.user.privacy, ...privacy };
    if (notifications)
      updateData.notifications = {
        ...req.user.notifications,
        ...notifications,
      };

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
};