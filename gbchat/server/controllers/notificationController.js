// controllers/notificationController.js
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Get notification settings
// @route   GET /api/notifications/settings
// @access  Private
export const getNotificationSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('notifications dnd');

  res.json({
    success: true,
    data: {
      enabled: user.notifications?.messages ?? true,
      sound: user.notifications?.sound ?? 'default',
      vibration: user.notifications?.vibrate ?? true,
      desktop: user.notifications?.desktop ?? true,
      messagePreview: user.notifications?.messagePreview ?? true,
      groupMessages: user.notifications?.groups ?? true,
      callNotifications: user.notifications?.calls ?? true,
      storyNotifications: user.notifications?.stories ?? true,
      channelNotifications: user.notifications?.channels ?? true,
      dndMode: user.dnd?.enabled ?? false,
      dndStartTime: user.dnd?.startTime || '22:00',
      dndEndTime: user.dnd?.endTime || '07:00',
      dndAllowFrom: user.dnd?.allowFrom || 'nobody',
    },
  });
});

// @desc    Update notification settings
// @route   PUT /api/notifications/settings
// @access  Private
export const updateNotificationSettings = asyncHandler(async (req, res) => {
  const {
    enabled,
    sound,
    vibration,
    desktop,
    messagePreview,
    groupMessages,
    callNotifications,
    storyNotifications,
    channelNotifications,
    dndMode,
    dndStartTime,
    dndEndTime,
    dndAllowFrom,
  } = req.body;

  const user = await User.findById(req.user._id);

  // Update notification settings
  if (!user.notifications) user.notifications = {};
  if (enabled !== undefined) user.notifications.messages = enabled;
  if (sound !== undefined) user.notifications.sound = sound;
  if (vibration !== undefined) user.notifications.vibrate = vibration;
  if (desktop !== undefined) user.notifications.desktop = desktop;
  if (messagePreview !== undefined) user.notifications.messagePreview = messagePreview;
  if (groupMessages !== undefined) user.notifications.groups = groupMessages;
  if (callNotifications !== undefined) user.notifications.calls = callNotifications;
  if (storyNotifications !== undefined) user.notifications.stories = storyNotifications;
  if (channelNotifications !== undefined) user.notifications.channels = channelNotifications;

  // Update DND settings
  if (!user.dnd) user.dnd = {};
  if (dndMode !== undefined) user.dnd.enabled = dndMode;
  if (dndStartTime !== undefined) user.dnd.startTime = dndStartTime;
  if (dndEndTime !== undefined) user.dnd.endTime = dndEndTime;
  if (dndAllowFrom !== undefined) user.dnd.allowFrom = dndAllowFrom;

  await user.save();

  res.json({
    success: true,
    message: 'Notification settings updated successfully',
    data: {
      enabled: user.notifications.messages,
      sound: user.notifications.sound,
      vibration: user.notifications.vibrate,
      desktop: user.notifications.desktop,
      messagePreview: user.notifications.messagePreview,
      groupMessages: user.notifications.groups,
      callNotifications: user.notifications.calls,
      storyNotifications: user.notifications.stories,
      channelNotifications: user.notifications.channels,
      dndMode: user.dnd.enabled,
      dndStartTime: user.dnd.startTime,
      dndEndTime: user.dnd.endTime,
      dndAllowFrom: user.dnd.allowFrom,
    },
  });
});

// @desc    Toggle notification
// @route   POST /api/notifications/toggle/:setting
// @access  Private
export const toggleNotification = asyncHandler(async (req, res) => {
  const { setting } = req.params;

  const validSettings = [
    'messages',
    'groups',
    'calls',
    'stories',
    'channels',
    'vibrate',
    'desktop',
    'messagePreview',
  ];

  if (!validSettings.includes(setting)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid notification setting',
    });
  }

  const user = await User.findById(req.user._id);
  if (!user.notifications) user.notifications = {};
  
  user.notifications[setting] = !user.notifications[setting];
  await user.save();

  res.json({
    success: true,
    message: `${setting} notifications ${user.notifications[setting] ? 'enabled' : 'disabled'}`,
    data: { [setting]: user.notifications[setting] },
  });
});

// @desc    Set notification sound
// @route   POST /api/notifications/sound
// @access  Private
export const setNotificationSound = asyncHandler(async (req, res) => {
  const { sound } = req.body;

  const validSounds = [
    'default',
    'none',
    'chord',
    'breeze',
    'ripple',
    'ping',
    'note',
  ];

  if (!sound || !validSounds.includes(sound)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid sound. Choose from: ' + validSounds.join(', '),
    });
  }

  const user = await User.findById(req.user._id);
  if (!user.notifications) user.notifications = {};
  user.notifications.sound = sound;
  await user.save();

  res.json({
    success: true,
    message: `Notification sound set to ${sound}`,
    data: { sound },
  });
});

// @desc    Enable/disable DND mode
// @route   POST /api/notifications/dnd
// @access  Private
export const toggleDNDMode = asyncHandler(async (req, res) => {
  const { enabled, startTime, endTime, allowFrom } = req.body;

  const user = await User.findById(req.user._id);
  if (!user.dnd) user.dnd = {};

  if (enabled !== undefined) user.dnd.enabled = enabled;
  if (startTime) user.dnd.startTime = startTime;
  if (endTime) user.dnd.endTime = endTime;
  if (allowFrom) user.dnd.allowFrom = allowFrom;

  await user.save();

  res.json({
    success: true,
    message: user.dnd.enabled ? 'DND mode enabled' : 'DND mode disabled',
    data: {
      enabled: user.dnd.enabled,
      startTime: user.dnd.startTime,
      endTime: user.dnd.endTime,
      allowFrom: user.dnd.allowFrom,
    },
  });
});

// @desc    Set DND schedule
// @route   POST /api/notifications/dnd/schedule
// @access  Private
export const setDNDSchedule = asyncHandler(async (req, res) => {
  const { startTime, endTime } = req.body;

  if (!startTime || !endTime) {
    return res.status(400).json({
      success: false,
      message: 'Start time and end time are required',
    });
  }

  const user = await User.findById(req.user._id);
  if (!user.dnd) user.dnd = {};
  
  user.dnd.startTime = startTime;
  user.dnd.endTime = endTime;
  await user.save();

  res.json({
    success: true,
    message: 'DND schedule updated',
    data: {
      startTime: user.dnd.startTime,
      endTime: user.dnd.endTime,
    },
  });
});

// @desc    Request notification permission
// @route   POST /api/notifications/permission
// @access  Private
export const requestNotificationPermission = asyncHandler(async (req, res) => {
  // This is mainly a client-side operation, but we can track the user's preference
  const user = await User.findById(req.user._id);
  if (!user.notifications) user.notifications = {};
  
  user.notifications.permissionRequested = true;
  user.notifications.permissionGranted = true;
  await user.save();

  res.json({
    success: true,
    message: 'Notification permission granted',
    data: { granted: true },
  });
});

// @desc    Get available notification sounds
// @route   GET /api/notifications/sounds
// @access  Private
export const getNotificationSounds = asyncHandler(async (req, res) => {
  const sounds = [
    { id: 'default', name: 'Default', preview: '/sounds/notifications/default.mp3' },
    { id: 'none', name: 'None', preview: null },
    { id: 'chord', name: 'Chord', preview: '/sounds/notifications/chord.mp3' },
    { id: 'breeze', name: 'Breeze', preview: '/sounds/notifications/breeze.mp3' },
    { id: 'ripple', name: 'Ripple', preview: '/sounds/notifications/ripple.mp3' },
    { id: 'ping', name: 'Ping', preview: '/sounds/notifications/ping.mp3' },
    { id: 'note', name: 'Note', preview: '/sounds/notifications/note.mp3' },
  ];

  res.json({
    success: true,
    data: sounds,
  });
});

// @desc    Send test notification
// @route   POST /api/notifications/test
// @access  Private
export const sendTestNotification = asyncHandler(async (req, res) => {
  // In a real app, this would trigger a push notification
  // For now, we'll just return success
  res.json({
    success: true,
    message: 'Test notification sent',
  });
});
