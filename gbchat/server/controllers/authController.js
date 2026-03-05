// server/controllers/authController.js
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import crypto from "crypto";
import phoneVerificationService from "../services/phoneVerificationService.js";
import { getIO } from "../socket/index.js";
import nodemailer from "nodemailer";

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

    // Emit real-time profile update to all connected clients
    const io = getIO();
    if (io) {
      io.emit('user:profileUpdated', {
        userId: user._id,
        fullName: user.fullName,
        about: user.about,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status,
      });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Forgot Password - Generate reset token and send email
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({
        message: "If an account exists with this email, a password reset link has been sent."
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.otp = {
      code: resetToken,
      expiresAt: new Date(resetTokenExpiry),
    };

    await user.save();

    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"GBChat" <${process.env.SMTP_FROM || "noreply@gbchat.com"}>`,
      to: email,
      subject: "Password Reset Request - GBChat",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">GBChat Password Reset</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Hello ${user.fullName},
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              You requested to reset your GBChat password. Click the button below to set a new password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #10b981 0%, #8b5cf6 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              Or copy and paste this link into your browser:
            </p>
            <p style="color: #10b981; font-size: 14px; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 5px;">
              ${resetUrl}
            </p>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 20px;">
              This link will expire in 1 hour for security reasons.
            </p>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              If you didn't request this password reset, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              © 2026 GBChat. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message: "If an account exists with this email, a password reset link has been sent."
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    next(error);
  }
};

// Reset Password - Verify token and update password
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      "otp.code": token,
      "otp.expiresAt": { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Update password
    user.password = newPassword;
    user.otp = undefined; // Clear reset token
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    next(error);
  }
};

// Export User Data - For backup to phone storage
export const exportUserData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("contacts", "fullName email phone avatar")
      .populate("pinnedChats")
      .populate("archivedChats");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare export data
    const exportData = {
      exportDate: new Date().toISOString(),
      version: "1.0",
      user: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        about: user.about,
        avatar: user.avatar,
        status: user.status,
        createdAt: user.createdAt,
      },
      contacts: user.contacts.map(c => ({
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        avatar: c.avatar,
      })),
      settings: {
        theme: user.theme,
        privacy: user.privacy,
        notifications: user.notifications,
        chatSettings: user.chatSettings,
      },
      pinnedChats: user.pinnedChats,
      archivedChats: user.archivedChats,
    };

    res.json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    console.error("Export data error:", error);
    next(error);
  }
};

// Import User Data - Restore from backup
export const importUserData = async (req, res, next) => {
  try {
    const { data } = req.body;

    if (!data || !data.user) {
      return res.status(400).json({ message: "Invalid backup data" });
    }

    const user = await User.findById(req.user._id);

    // Update user settings from backup
    if (data.settings) {
      if (data.settings.theme) {
        user.theme = { ...user.theme, ...data.settings.theme };
      }
      if (data.settings.privacy) {
        user.privacy = { ...user.privacy, ...data.settings.privacy };
      }
      if (data.settings.notifications) {
        user.notifications = { ...user.notifications, ...data.settings.notifications };
      }
      if (data.settings.chatSettings) {
        user.chatSettings = { ...user.chatSettings, ...data.settings.chatSettings };
      }
    }

    await user.save();

    res.json({
      success: true,
      message: "Data imported successfully",
    });
  } catch (error) {
    console.error("Import data error:", error);
    next(error);
  }
};