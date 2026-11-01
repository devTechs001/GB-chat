// server/controllers/authController.js
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import crypto from "crypto";
import phoneVerificationService from "../services/phoneVerificationService.js";
import { getIO } from "../socket/index.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

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
    const {
      fullName,
      about,
      avatar,
      phone,
      theme,
      privacy,
      notifications,
      username,
      website,
      location,
      coverPhoto,
      pronouns,
      coverGradient,
      statusText,
      jobTitle,
      timezone,
    } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (about !== undefined) updateData.about = about;
    if (avatar) updateData.avatar = avatar;
    if (phone) updateData.phone = phone;
    // Public-profile fields (all optional)
    if (website !== undefined) updateData.website = String(website).slice(0, 200);
    if (location !== undefined) updateData.location = String(location).slice(0, 100);
    if (coverPhoto !== undefined) updateData.coverPhoto = coverPhoto;
    if (pronouns !== undefined) updateData.pronouns = String(pronouns).slice(0, 30);
    if (statusText !== undefined) updateData.statusText = String(statusText).slice(0, 80);
    if (jobTitle !== undefined) updateData.jobTitle = String(jobTitle).slice(0, 80);
    if (timezone !== undefined) {
      // Accept only real IANA zones so the profile can render local time safely.
      const zone = String(timezone).slice(0, 64);
      let valid = zone === "";
      if (!valid) {
        try {
          new Intl.DateTimeFormat("en", { timeZone: zone });
          valid = true;
        } catch {
          valid = false;
        }
      }
      if (!valid) return res.status(400).json({ message: "Unknown timezone" });
      updateData.timezone = zone;
    }
    if (coverGradient !== undefined) {
      const allowed = ["aurora", "sunset", "ocean", "forest", "midnight", "rose", "graphite"];
      if (!allowed.includes(coverGradient)) {
        return res.status(400).json({ message: "Unknown cover gradient" });
      }
      updateData.coverGradient = coverGradient;
    }
    if (username !== undefined) {
      const handle = String(username).trim().toLowerCase().replace(/^@/, "");
      if (handle && !/^[a-z0-9._]{3,30}$/.test(handle)) {
        return res.status(400).json({
          message: "Username must be 3–30 characters: letters, numbers, dots or underscores",
        });
      }
      if (handle) {
        const taken = await User.findOne({ username: handle, _id: { $ne: req.user._id } });
        if (taken) return res.status(409).json({ message: "That username is already taken" });
      }
      updateData.username = handle || undefined;
    }
    if (theme) updateData.theme = { ...req.user.theme, ...theme };
    if (privacy) updateData.privacy = { ...req.user.privacy, ...privacy };
    if (notifications)
      updateData.notifications = {
        ...req.user.notifications,
        ...notifications,
      };

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    // Emit real-time profile update to all connected clients
    const io = getIO();
    if (io) {
      io.emit('user:profileUpdated', {
        userId: user._id,
        fullName: user.fullName,
        username: user.username,
        about: user.about,
        phone: user.phone,
        avatar: user.avatar,
        coverPhoto: user.coverPhoto,
        coverGradient: user.coverGradient,
        statusText: user.statusText,
        jobTitle: user.jobTitle,
        timezone: user.timezone,
        website: user.website,
        location: user.location,
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

// Forgot Password via Phone
export const forgotPasswordPhone = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      // For security, don't confirm if user exists
      return res.json({ message: "If an account exists with this phone number, an OTP has been sent." });
    }

    // Use the phoneVerificationService to send OTP
    const result = await phoneVerificationService.initiatePhoneVerification(phone);
    
    if (result.success) {
      res.json({ message: "Verification code sent to your phone" });
    } else {
      res.status(500).json({ message: "Failed to send verification code" });
    }
  } catch (error) {
    next(error);
  }
};

// Reset Password via Phone
export const resetPasswordPhone = async (req, res, next) => {
  try {
    const { phone, code, newPassword } = req.body;

    if (!phone || !code || !newPassword) {
      return res.status(400).json({ message: "Phone, code, and new password are required" });
    }

    // Verify the OTP
    const verification = await phoneVerificationService.verifyPhoneNumber(phone, code);
    
    if (!verification.success) {
      return res.status(401).json({ message: "Invalid or expired verification code" });
    }

    const user = verification.user;
    
    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};
/**
 * POST /api/auth/refresh
 * Exchanges a still-valid refresh token (or the current bearer token) for a
 * fresh access token. Access tokens last 30 days, so this is mostly used by the
 * client interceptor to recover from an expired local copy.
 */
export const refreshToken = async (req, res, next) => {
  try {
    const bearer = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;

    const candidate = req.body?.refreshToken || bearer;

    if (!candidate) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(candidate, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const userId = decoded.userId || decoded.id;
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: "User no longer exists" });

    const token = generateToken(user._id, res);
    const refresh = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "60d",
    });

    res.json({ token, refreshToken: refresh });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/resend-otp
 * Issues a fresh email verification code (the client's OTPVerify screen).
 */
export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account with that email" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = { code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    await user.save();

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      await transporter.sendMail({
        from: `"GBChat" <${process.env.SMTP_FROM || "noreply@gbchat.com"}>`,
        to: email,
        subject: "Your GBChat verification code",
        text: `Your verification code is ${code}. It expires in 10 minutes.`,
      });
    } catch (mailError) {
      // Do not fail the request if SMTP is not configured in this environment
      console.warn("OTP email could not be sent:", mailError.message);
    }

    res.json({
      message: "Verification code sent",
      // Exposed only outside production to keep local testing possible
      ...(process.env.NODE_ENV !== "production" ? { code } : {}),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/verify-otp
 * Verifies an emailed code and signs the user in.
 */
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.otp?.code || user.otp.code !== String(code)) {
      return res.status(400).json({ message: "Invalid verification code" });
    }
    if (user.otp.expiresAt && user.otp.expiresAt < new Date()) {
      return res.status(400).json({ message: "Verification code expired" });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const token = generateToken(user._id, res);

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      isVerified: user.isVerified,
      token,
    });
  } catch (error) {
    next(error);
  }
};
