// server/controllers/authController.js
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import crypto from "crypto";
import phoneVerificationService from "../services/phoneVerificationService.js";

export const register = async (req, res, next) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Either email or phone must be provided
    if (!fullName || (!email && !phone) || !password) {
      return res.status(400).json({ message: "Full name, email or phone, and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const existingUserByPhone = await User.findOne({ phone });
      if (existingUserByPhone) {
        return res.status(400).json({ message: "Phone number already registered" });
      }
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
    const { email, phone, password } = req.body;

    // Either email or phone must be provided
    if (!email && !phone) {
      return res.status(400).json({ message: "Email or phone number is required" });
    }

    let user;
    if (email) {
      user = await User.findOne({ email }).select("+password");
    } else if (phone) {
      user = await User.findOne({ phone }).select("+password");
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
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

export const phoneLogin = async (req, res, next) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ message: "Phone number and verification code are required" });
    }

    // Verify the phone number and code
    const result = await phoneVerificationService.verifyPhoneNumber(phone, code);

    if (!result.success) {
      return res.status(401).json({ message: result.message || "Invalid verification code" });
    }

    const user = result.user;

    // Update user status
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