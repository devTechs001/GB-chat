// controllers/chatDisplayController.js
import User from '../models/User.js';
import GBFeatures from '../models/GBFeatures.model.js';
import asyncHandler from 'express-async-handler';

// @desc    Get chat display settings
// @route   GET /api/chat-display/settings
// @access  Private
export const getChatDisplaySettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  // Get GB features if available
  let gbFeatures = await GBFeatures.findOne({ userId: req.user._id });
  if (!gbFeatures) {
    gbFeatures = new GBFeatures({ userId: req.user._id });
  }

  res.json({
    success: true,
    data: {
      // Status icons
      hideBlueTicks: gbFeatures.privacy?.hideBlueTicks ?? false,
      hideSecondTick: gbFeatures.privacy?.hideSecondTick ?? false,
      hideForwardLabel: gbFeatures.privacy?.hideForwardLabel ?? false,
      
      // Network indicators
      showNetworkIndicator: user.theme?.showNetworkIndicator ?? true,
      showConnectionQuality: user.theme?.showConnectionQuality ?? true,
      showTypingIndicator: user.notifications?.showTypingIndicator ?? true,
      showOnlineStatus: user.privacy?.onlineStatus ?? true,
      
      // Timestamp settings
      exactTimestamps: gbFeatures.advanced?.exactTimestamps ?? false,
      showLastSeenExact: user.theme?.showLastSeenExact ?? false,
      showDeliveryTime: user.theme?.showDeliveryTime ?? false,
      
      // Appearance
      bubbleStyle: user.theme?.bubbleStyle || 'modern',
      fontSize: user.theme?.fontSize || 'medium',
      theme: user.theme?.name || 'default',
    },
  });
});

// @desc    Update chat display settings
// @route   PUT /api/chat-display/settings
// @access  Private
export const updateChatDisplaySettings = asyncHandler(async (req, res) => {
  const {
    // Status icons
    hideBlueTicks,
    hideSecondTick,
    hideForwardLabel,
    
    // Network indicators
    showNetworkIndicator,
    showConnectionQuality,
    showTypingIndicator,
    showOnlineStatus,
    
    // Timestamp settings
    exactTimestamps,
    showLastSeenExact,
    showDeliveryTime,
    
    // Appearance
    bubbleStyle,
    fontSize,
    theme,
  } = req.body;

  const user = await User.findById(req.user._id);
  let gbFeatures = await GBFeatures.findOne({ userId: req.user._id });
  
  if (!gbFeatures) {
    gbFeatures = new GBFeatures({ userId: req.user._id });
  }

  // Update GB features (privacy section)
  if (hideBlueTicks !== undefined) gbFeatures.privacy.hideBlueTicks = hideBlueTicks;
  if (hideSecondTick !== undefined) gbFeatures.privacy.hideSecondTick = hideSecondTick;
  if (hideForwardLabel !== undefined) gbFeatures.privacy.hideForwardLabel = hideForwardLabel;
  
  // Update GB features (advanced section)
  if (exactTimestamps !== undefined) gbFeatures.advanced.exactTimestamps = exactTimestamps;

  // Update user theme settings
  if (!user.theme) user.theme = {};
  if (showNetworkIndicator !== undefined) user.theme.showNetworkIndicator = showNetworkIndicator;
  if (showConnectionQuality !== undefined) user.theme.showConnectionQuality = showConnectionQuality;
  if (showLastSeenExact !== undefined) user.theme.showLastSeenExact = showLastSeenExact;
  if (showDeliveryTime !== undefined) user.theme.showDeliveryTime = showDeliveryTime;
  if (bubbleStyle !== undefined) user.theme.bubbleStyle = bubbleStyle;
  if (fontSize !== undefined) user.theme.fontSize = fontSize;
  if (theme !== undefined) user.theme.name = theme;

  // Update user notification settings
  if (!user.notifications) user.notifications = {};
  if (showTypingIndicator !== undefined) user.notifications.showTypingIndicator = showTypingIndicator;

  // Update user privacy settings
  if (!user.privacy) user.privacy = {};
  if (showOnlineStatus !== undefined) user.privacy.onlineStatus = showOnlineStatus;

  await user.save();
  await gbFeatures.save();

  res.json({
    success: true,
    message: 'Chat display settings updated successfully',
    data: {
      // Status icons
      hideBlueTicks: gbFeatures.privacy.hideBlueTicks,
      hideSecondTick: gbFeatures.privacy.hideSecondTick,
      hideForwardLabel: gbFeatures.privacy.hideForwardLabel,
      
      // Network indicators
      showNetworkIndicator: user.theme.showNetworkIndicator,
      showConnectionQuality: user.theme.showConnectionQuality,
      showTypingIndicator: user.notifications.showTypingIndicator,
      showOnlineStatus: user.privacy.onlineStatus,
      
      // Timestamp settings
      exactTimestamps: gbFeatures.advanced.exactTimestamps,
      showLastSeenExact: user.theme.showLastSeenExact,
      showDeliveryTime: user.theme.showDeliveryTime,
      
      // Appearance
      bubbleStyle: user.theme.bubbleStyle,
      fontSize: user.theme.fontSize,
      theme: user.theme.name,
    },
  });
});

// @desc    Toggle status icon setting
// @route   POST /api/chat-display/toggle-status/:setting
// @access  Private
export const toggleStatusIcon = asyncHandler(async (req, res) => {
  const { setting } = req.params;

  const validSettings = ['hideBlueTicks', 'hideSecondTick', 'hideForwardLabel'];

  if (!validSettings.includes(setting)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status setting',
    });
  }

  let gbFeatures = await GBFeatures.findOne({ userId: req.user._id });
  
  if (!gbFeatures) {
    gbFeatures = new GBFeatures({ userId: req.user._id });
  }

  gbFeatures.privacy[setting] = !gbFeatures.privacy[setting];
  await gbFeatures.save();

  res.json({
    success: true,
    message: `${setting} ${gbFeatures.privacy[setting] ? 'enabled' : 'disabled'}`,
    data: { [setting]: gbFeatures.privacy[setting] },
  });
});

// @desc    Toggle network indicator
// @route   POST /api/chat-display/toggle-network/:setting
// @access  Private
export const toggleNetworkIndicator = asyncHandler(async (req, res) => {
  const { setting } = req.params;

  const validSettings = ['showNetworkIndicator', 'showConnectionQuality', 'showTypingIndicator', 'showOnlineStatus'];

  if (!validSettings.includes(setting)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid network indicator setting',
    });
  }

  const user = await User.findById(req.user._id);

  if (!user.theme) user.theme = {};
  if (!user.notifications) user.notifications = {};
  if (!user.privacy) user.privacy = {};

  let currentValue;
  if (['showNetworkIndicator', 'showConnectionQuality', 'showLastSeenExact', 'showDeliveryTime'].includes(setting)) {
    user.theme[setting] = !user.theme[setting];
    currentValue = user.theme[setting];
  } else if (setting === 'showTypingIndicator') {
    user.notifications.showTypingIndicator = !user.notifications.showTypingIndicator;
    currentValue = user.notifications.showTypingIndicator;
  } else if (setting === 'showOnlineStatus') {
    user.privacy.onlineStatus = !user.privacy.onlineStatus;
    currentValue = user.privacy.onlineStatus;
  }

  await user.save();

  res.json({
    success: true,
    message: `${setting} ${currentValue ? 'enabled' : 'disabled'}`,
    data: { [setting]: currentValue },
  });
});

// @desc    Toggle timestamp setting
// @route   POST /api/chat-display/toggle-timestamp/:setting
// @access  Private
export const toggleTimestampSetting = asyncHandler(async (req, res) => {
  const { setting } = req.params;

  const validSettings = ['exactTimestamps', 'showLastSeenExact', 'showDeliveryTime'];

  if (!validSettings.includes(setting)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid timestamp setting',
    });
  }

  const user = await User.findById(req.user._id);
  let gbFeatures = await GBFeatures.findOne({ userId: req.user._id });
  
  if (!gbFeatures) {
    gbFeatures = new GBFeatures({ userId: req.user._id });
  }

  let currentValue;
  if (setting === 'exactTimestamps') {
    if (!gbFeatures.advanced) gbFeatures.advanced = {};
    gbFeatures.advanced.exactTimestamps = !gbFeatures.advanced.exactTimestamps;
    currentValue = gbFeatures.advanced.exactTimestamps;
  } else {
    if (!user.theme) user.theme = {};
    user.theme[setting] = !user.theme[setting];
    currentValue = user.theme[setting];
  }

  await user.save();
  await gbFeatures.save();

  res.json({
    success: true,
    message: `${setting} ${currentValue ? 'enabled' : 'disabled'}`,
    data: { [setting]: currentValue },
  });
});

// @desc    Set bubble style
// @route   POST /api/chat-display/bubble-style
// @access  Private
export const setBubbleStyleDisplay = asyncHandler(async (req, res) => {
  const { style } = req.body;

  const validStyles = ['modern', 'classic', 'minimal', 'rounded'];

  if (!style || !validStyles.includes(style)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid bubble style',
    });
  }

  const user = await User.findById(req.user._id);
  if (!user.theme) user.theme = {};
  user.theme.bubbleStyle = style;
  await user.save();

  res.json({
    success: true,
    message: 'Bubble style updated successfully',
    data: { bubbleStyle: style },
  });
});

// @desc    Set font size
// @route   POST /api/chat-display/font-size
// @access  Private
export const setFontSizeDisplay = asyncHandler(async (req, res) => {
  const { size } = req.body;

  const validSizes = ['small', 'medium', 'large', 'xlarge'];

  if (!size || !validSizes.includes(size)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid font size',
    });
  }

  const user = await User.findById(req.user._id);
  if (!user.theme) user.theme = {};
  user.theme.fontSize = size;
  await user.save();

  res.json({
    success: true,
    message: 'Font size updated successfully',
    data: { fontSize: size },
  });
});

// @desc    Set theme
// @route   POST /api/chat-display/theme
// @access  Private
export const setThemeDisplay = asyncHandler(async (req, res) => {
  const { themeId } = req.body;

  const validThemes = ['default', 'dark', 'light', 'ocean', 'royal', 'passion', 'sunset', 'rose', 'nature'];

  if (!themeId || !validThemes.includes(themeId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid theme',
    });
  }

  const user = await User.findById(req.user._id);
  if (!user.theme) user.theme = {};
  user.theme.name = themeId;
  await user.save();

  res.json({
    success: true,
    message: 'Theme updated successfully',
    data: { theme: themeId },
  });
});

// @desc    Reset chat display settings
// @route   POST /api/chat-display/reset
// @access  Private
export const resetChatDisplaySettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  let gbFeatures = await GBFeatures.findOne({ userId: req.user._id });
  
  if (!gbFeatures) {
    gbFeatures = new GBFeatures({ userId: req.user._id });
  }

  // Reset GB features
  if (gbFeatures.privacy) {
    gbFeatures.privacy.hideBlueTicks = false;
    gbFeatures.privacy.hideSecondTick = false;
    gbFeatures.privacy.hideForwardLabel = false;
  }
  if (gbFeatures.advanced) {
    gbFeatures.advanced.exactTimestamps = false;
  }

  // Reset user theme settings
  if (user.theme) {
    user.theme.bubbleStyle = 'modern';
    user.theme.fontSize = 'medium';
    user.theme.name = 'default';
    user.theme.showNetworkIndicator = true;
    user.theme.showConnectionQuality = true;
    user.theme.showLastSeenExact = false;
    user.theme.showDeliveryTime = false;
  }

  // Reset user notification settings
  if (user.notifications) {
    user.notifications.showTypingIndicator = true;
  }

  // Reset user privacy settings
  if (user.privacy) {
    user.privacy.onlineStatus = true;
  }

  await user.save();
  await gbFeatures.save();

  res.json({
    success: true,
    message: 'Chat display settings reset to defaults',
    data: {
      hideBlueTicks: false,
      hideSecondTick: false,
      hideForwardLabel: false,
      showNetworkIndicator: true,
      showConnectionQuality: true,
      showTypingIndicator: true,
      showOnlineStatus: true,
      exactTimestamps: false,
      showLastSeenExact: false,
      showDeliveryTime: false,
      bubbleStyle: 'modern',
      fontSize: 'medium',
      theme: 'default',
    },
  });
});
