// controllers/accountController.js
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';

// @desc    Get account settings
// @route   GET /api/account/settings
// @access  Private
export const getAccountSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    'fullName email phone avatar about privacy theme'
  );

  res.json({
    success: true,
    data: {
      profile: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        about: user.about,
      },
      privacy: {
        lastSeen: user.privacy?.lastSeen || 'everyone',
        avatar: user.privacy?.avatar || 'everyone',
        about: user.privacy?.about || 'everyone',
        readReceipts: user.privacy?.readReceipts ?? true,
        onlineStatus: user.privacy?.onlineStatus ?? true,
      },
      theme: {
        name: user.theme?.name || 'default',
        wallpaper: user.theme?.wallpaper || '',
        fontSize: user.theme?.fontSize || 'medium',
      },
    },
  });
});

// @desc    Update account settings
// @route   PUT /api/account/settings
// @access  Private
export const updateAccountSettings = asyncHandler(async (req, res) => {
  const { profile, privacy, theme } = req.body;

  const user = await User.findById(req.user._id);

  // Update profile
  if (profile) {
    if (profile.fullName !== undefined) user.fullName = profile.fullName;
    if (profile.about !== undefined) user.about = profile.about;
    if (profile.avatar !== undefined) user.avatar = profile.avatar;
  }

  // Update privacy
  if (privacy) {
    if (!user.privacy) user.privacy = {};
    if (privacy.lastSeen !== undefined) user.privacy.lastSeen = privacy.lastSeen;
    if (privacy.avatar !== undefined) user.privacy.avatar = privacy.avatar;
    if (privacy.about !== undefined) user.privacy.about = privacy.about;
    if (privacy.readReceipts !== undefined) user.privacy.readReceipts = privacy.readReceipts;
    if (privacy.onlineStatus !== undefined) user.privacy.onlineStatus = privacy.onlineStatus;
  }

  // Update theme
  if (theme) {
    if (!user.theme) user.theme = {};
    if (theme.name !== undefined) user.theme.name = theme.name;
    if (theme.wallpaper !== undefined) user.theme.wallpaper = theme.wallpaper;
    if (theme.fontSize !== undefined) user.theme.fontSize = theme.fontSize;
  }

  await user.save();

  res.json({
    success: true,
    message: 'Account settings updated successfully',
    data: {
      profile: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        about: user.about,
      },
      privacy: user.privacy,
      theme: user.theme,
    },
  });
});

// @desc    Update profile
// @route   PUT /api/account/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, about, avatar, phone } = req.body;

  const user = await User.findById(req.user._id);

  if (fullName !== undefined) user.fullName = fullName;
  if (about !== undefined) user.about = about;
  if (avatar !== undefined) user.avatar = avatar;
  if (phone !== undefined) user.phone = phone;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      fullName: user.fullName,
      about: user.about,
      avatar: user.avatar,
      phone: user.phone,
    },
  });
});

// @desc    Change password
// @route   POST /api/account/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password and new password are required',
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters',
    });
  }

  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect',
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

// @desc    Enable two-factor authentication
// @route   POST /api/account/2fa/enable
// @access  Private
export const enable2FA = asyncHandler(async (req, res) => {
  const { method } = req.body; // 'sms' or 'email'

  const user = await User.findById(req.user._id);

  // Generate 2FA secret
  const secret = crypto.randomBytes(32).toString('hex');
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

  user.otp = {
    code: otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  };
  user.twoFactorAuth = {
    enabled: false, // Will be enabled after verification
    method: method || 'email',
    secret,
  };

  await user.save();

  // In a real app, send OTP via SMS or email
  // For now, we'll return it in the response (only for development)
  res.json({
    success: true,
    message: `2FA setup initiated. Please verify the OTP sent to your ${method || 'email'}.`,
    data: {
      method: user.twoFactorAuth.method,
      otp, // Remove this in production
      secret, // Remove this in production
    },
  });
});

// @desc    Verify 2FA
// @route   POST /api/account/2fa/verify
// @access  Private
export const verify2FA = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({
      success: false,
      message: 'OTP is required',
    });
  }

  const user = await User.findById(req.user._id);

  if (!user.otp || user.otp.code !== otp || user.otp.expiresAt < Date.now()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired OTP',
    });
  }

  // Enable 2FA
  user.twoFactorAuth = {
    ...user.twoFactorAuth,
    enabled: true,
  };
  user.otp = undefined;

  await user.save();

  res.json({
    success: true,
    message: 'Two-factor authentication enabled successfully',
  });
});

// @desc    Disable two-factor authentication
// @route   POST /api/account/2fa/disable
// @access  Private
export const disable2FA = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Incorrect password',
    });
  }

  user.twoFactorAuth = {
    enabled: false,
    method: null,
    secret: null,
  };

  await user.save();

  res.json({
    success: true,
    message: 'Two-factor authentication disabled successfully',
  });
});

// @desc    Get active sessions
// @route   GET /api/account/sessions
// @access  Private
export const getActiveSessions = asyncHandler(async (req, res) => {
  // This would typically query a sessions collection
  // For now, we'll return mock data
  const sessions = [
    {
      id: 'session_1',
      device: 'Chrome on Windows',
      location: 'New York, USA',
      ip: '192.168.1.1',
      lastActive: new Date(),
      current: true,
    },
    {
      id: 'session_2',
      device: 'Safari on iPhone',
      location: 'New York, USA',
      ip: '192.168.1.2',
      lastActive: new Date(Date.now() - 3600000), // 1 hour ago
      current: false,
    },
  ];

  res.json({
    success: true,
    data: sessions,
  });
});

// @desc    Logout from session
// @route   POST /api/account/sessions/logout/:sessionId
// @access  Private
export const logoutFromSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  // In a real app, you'd invalidate the session token
  // For now, we'll just return success

  res.json({
    success: true,
    message: 'Logged out from session successfully',
  });
});

// @desc    Logout from all sessions
// @route   POST /api/account/sessions/logout-all
// @access  Private
export const logoutFromAllSessions = asyncHandler(async (req, res) => {
  // In a real app, you'd invalidate all session tokens
  // For now, we'll just return success

  res.json({
    success: true,
    message: 'Logged out from all sessions successfully',
  });
});

// @desc    Delete account
// @route   DELETE /api/account
// @access  Private
export const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Incorrect password',
    });
  }

  // Soft delete - mark account as deleted
  user.isDeleted = true;
  user.deletedAt = new Date();
  await user.save();

  // In a real app, you'd also:
  // - Delete or anonymize user data
  // - Remove from all chats/groups
  // - Delete uploaded files
  // - Cancel subscriptions

  res.json({
    success: true,
    message: 'Account deleted successfully',
  });
});

// @desc    Export account data
// @route   GET /api/account/export
// @access  Private
export const exportAccountData = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const exportData = {
    profile: {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      about: user.about,
      avatar: user.avatar,
    },
    privacy: user.privacy,
    theme: user.theme,
    createdAt: user.createdAt,
    lastSeen: user.lastSeen,
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="gbchat-account-export-${Date.now()}.json"`);

  res.json(exportData);
});

// @desc    Deactivate account
// @route   POST /api/account/deactivate
// @access  Private
export const deactivateAccount = asyncHandler(async (req, res) => {
  const { password, reason } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Incorrect password',
    });
  }

  user.isActive = false;
  user.deactivationReason = reason || '';
  user.deactivatedAt = new Date();
  await user.save();

  res.json({
    success: true,
    message: 'Account deactivated successfully',
  });
});

// @desc    Reactivate account
// @route   POST /api/account/reactivate
// @access  Private
export const reactivateAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  user.isActive = true;
  user.deactivatedAt = null;
  user.deactivationReason = null;
  await user.save();

  res.json({
    success: true,
    message: 'Account reactivated successfully',
  });
});
