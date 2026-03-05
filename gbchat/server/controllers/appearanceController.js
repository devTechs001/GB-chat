// controllers/appearanceController.js
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Get appearance settings
// @route   GET /api/appearance/settings
// @access  Private
export const getAppearanceSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    'theme wallpaper fontSize bubbleStyle chatBackground'
  );

  res.json({
    success: true,
    data: {
      theme: user.theme?.name || 'default',
      wallpaper: user.theme?.wallpaper || '',
      fontSize: user.theme?.fontSize || 'medium',
      bubbleStyle: user.theme?.bubbleStyle || 'modern',
      chatBackground: user.theme?.chatBackground || '',
      chatEffects: user.theme?.chatEffects || 'none',
      messageAnimation: user.theme?.messageAnimation || 'slide',
      highContrast: user.theme?.highContrast || false,
      reduceMotion: user.theme?.reduceMotion || false,
      compactMode: user.theme?.compactMode || false,
      customColors: user.theme?.customColors || {},
      gradientTheme: user.theme?.gradientTheme || false,
      darkModeLevel: user.theme?.darkModeLevel || 'default',
      accentColor: user.theme?.accentColor || '#25D366',
    },
  });
});

// @desc    Update appearance settings
// @route   PUT /api/appearance/settings
// @access  Private
export const updateAppearanceSettings = asyncHandler(async (req, res) => {
  const {
    theme, wallpaper, fontSize, bubbleStyle, chatBackground,
    chatEffects, messageAnimation, highContrast, reduceMotion,
    compactMode, customColors, gradientTheme, darkModeLevel, accentColor
  } = req.body;

  const user = await User.findById(req.user._id);

  if (!user.theme) {
    user.theme = {};
  }

  if (theme !== undefined) user.theme.name = theme;
  if (wallpaper !== undefined) user.theme.wallpaper = wallpaper;
  if (fontSize !== undefined) user.theme.fontSize = fontSize;
  if (bubbleStyle !== undefined) user.theme.bubbleStyle = bubbleStyle;
  if (chatBackground !== undefined) user.theme.chatBackground = chatBackground;
  if (chatEffects !== undefined) user.theme.chatEffects = chatEffects;
  if (messageAnimation !== undefined) user.theme.messageAnimation = messageAnimation;
  if (highContrast !== undefined) user.theme.highContrast = highContrast;
  if (reduceMotion !== undefined) user.theme.reduceMotion = reduceMotion;
  if (compactMode !== undefined) user.theme.compactMode = compactMode;
  if (customColors !== undefined) user.theme.customColors = customColors;
  if (gradientTheme !== undefined) user.theme.gradientTheme = gradientTheme;
  if (darkModeLevel !== undefined) user.theme.darkModeLevel = darkModeLevel;
  if (accentColor !== undefined) user.theme.accentColor = accentColor;

  await user.save();

  res.json({
    success: true,
    message: 'Appearance settings updated successfully',
    data: {
      theme: user.theme.name,
      wallpaper: user.theme.wallpaper,
      fontSize: user.theme.fontSize,
      bubbleStyle: user.theme.bubbleStyle,
      chatBackground: user.theme.chatBackground,
      chatEffects: user.theme.chatEffects,
      messageAnimation: user.theme.messageAnimation,
      highContrast: user.theme.highContrast,
      reduceMotion: user.theme.reduceMotion,
      compactMode: user.theme.compactMode,
      customColors: user.theme.customColors,
      gradientTheme: user.theme.gradientTheme,
      darkModeLevel: user.theme.darkModeLevel,
      accentColor: user.theme.accentColor,
    },
  });
});

// @desc    Set theme
// @route   POST /api/appearance/theme
// @access  Private
export const setTheme = asyncHandler(async (req, res) => {
  const { themeId } = req.body;

  if (!themeId) {
    return res.status(400).json({
      success: false,
      message: 'Theme ID is required',
    });
  }

  const user = await User.findById(req.user._id);
  if (!user.theme) user.theme = {};
  user.theme.name = themeId;
  await user.save();

  res.json({
    success: true,
    message: `Theme changed to ${themeId}`,
    data: { theme: themeId },
  });
});

// @desc    Set wallpaper
// @route   POST /api/appearance/wallpaper
// @access  Private
export const setWallpaper = asyncHandler(async (req, res) => {
  const { wallpaperUrl, isGlobal } = req.body;

  const user = await User.findById(req.user._id);
  if (!user.theme) user.theme = {};

  if (isGlobal) {
    user.theme.wallpaper = wallpaperUrl || '';
  } else {
    user.theme.chatBackground = wallpaperUrl || '';
  }

  await user.save();

  res.json({
    success: true,
    message: wallpaperUrl ? 'Wallpaper updated successfully' : 'Wallpaper reset to default',
    data: {
      wallpaper: user.theme.wallpaper,
      chatBackground: user.theme.chatBackground,
    },
  });
});

// @desc    Set font size
// @route   POST /api/appearance/font-size
// @access  Private
export const setFontSize = asyncHandler(async (req, res) => {
  const { fontSize } = req.body;

  if (!fontSize || !['small', 'medium', 'large', 'xlarge'].includes(fontSize)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid font size. Must be small, medium, large, or xlarge',
    });
  }

  const user = await User.findById(req.user._id);
  if (!user.theme) user.theme = {};
  user.theme.fontSize = fontSize;
  await user.save();

  res.json({
    success: true,
    message: 'Font size updated successfully',
    data: { fontSize },
  });
});

// @desc    Set bubble style
// @route   POST /api/appearance/bubble-style
// @access  Private
export const setBubbleStyle = asyncHandler(async (req, res) => {
  const { bubbleStyle } = req.body;

  if (!bubbleStyle || !['modern', 'classic', 'minimal', 'rounded'].includes(bubbleStyle)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid bubble style',
    });
  }

  const user = await User.findById(req.user._id);
  if (!user.theme) user.theme = {};
  user.theme.bubbleStyle = bubbleStyle;
  await user.save();

  res.json({
    success: true,
    message: 'Bubble style updated successfully',
    data: { bubbleStyle },
  });
});

// @desc    Set chat effects
// @route   POST /api/appearance/chat-effects
// @access  Private
export const setChatEffects = asyncHandler(async (req, res) => {
  const { chatEffect } = req.body;

  if (!chatEffect || !['none', 'particles', 'snow', 'hearts', 'stars'].includes(chatEffect)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid chat effect',
    });
  }

  const user = await User.findById(req.user._id);
  if (!user.theme) user.theme = {};
  user.theme.chatEffects = chatEffect;
  await user.save();

  res.json({
    success: true,
    message: 'Chat effects updated successfully',
    data: { chatEffect },
  });
});

// @desc    Set message animation
// @route   POST /api/appearance/message-animation
// @access  Private
export const setMessageAnimation = asyncHandler(async (req, res) => {
  const { messageAnimation } = req.body;

  if (!messageAnimation || !['slide', 'fade', 'pop', 'none'].includes(messageAnimation)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid message animation',
    });
  }

  const user = await User.findById(req.user._id);
  if (!user.theme) user.theme = {};
  user.theme.messageAnimation = messageAnimation;
  await user.save();

  res.json({
    success: true,
    message: 'Message animation updated successfully',
    data: { messageAnimation },
  });
});

// @desc    Reset appearance to defaults
// @route   POST /api/appearance/reset
// @access  Private
export const resetAppearanceToDefaults = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  user.theme = {
    name: 'default',
    wallpaper: '',
    fontSize: 'medium',
    bubbleStyle: 'modern',
    chatBackground: '',
    chatEffects: 'none',
    messageAnimation: 'slide',
    highContrast: false,
    reduceMotion: false,
    compactMode: false,
    customColors: {},
    gradientTheme: false,
    darkModeLevel: 'default',
    accentColor: '#25D366',
  };

  await user.save();

  res.json({
    success: true,
    message: 'Appearance settings reset to defaults',
    data: user.theme,
  });
});

// @desc    Get available themes
// @route   GET /api/appearance/themes
// @access  Private
export const getAvailableThemes = asyncHandler(async (req, res) => {
  const themes = {
    default: {
      id: 'default',
      name: 'Default',
      emoji: '🟢',
      description: 'Classic WhatsApp green',
      primary: '#25D366',
      background: '#128C7E',
    },
    dark: {
      id: 'dark',
      name: 'Dark',
      emoji: '🌙',
      description: 'Easy on the eyes',
      primary: '#1a1a1a',
      background: '#2d2d2d',
    },
    light: {
      id: 'light',
      name: 'Light',
      emoji: '☀️',
      description: 'Clean and bright',
      primary: '#00a884',
      background: '#f0f2f5',
    },
    ocean: {
      id: 'ocean',
      name: 'Ocean',
      emoji: '🌊',
      description: 'Cool blue tones',
      primary: '#007bff',
      background: '#0056b3',
    },
    royal: {
      id: 'royal',
      name: 'Royal',
      emoji: '👑',
      description: 'Purple elegance',
      primary: '#6f42c1',
      background: '#563d7c',
    },
    passion: {
      id: 'passion',
      name: 'Passion',
      emoji: '❤️',
      description: 'Bold red theme',
      primary: '#dc3545',
      background: '#c82333',
    },
    sunset: {
      id: 'sunset',
      name: 'Sunset',
      emoji: '🌅',
      description: 'Warm orange hues',
      primary: '#fd7e14',
      background: '#e36a0d',
    },
    rose: {
      id: 'rose',
      name: 'Rose',
      emoji: '🌹',
      description: 'Soft pink theme',
      primary: '#e83e8c',
      background: '#d63384',
    },
    nature: {
      id: 'nature',
      name: 'Nature',
      emoji: '🌿',
      description: 'Natural teal theme',
      primary: '#20c997',
      background: '#1aa179',
    },
    midnight: {
      id: 'midnight',
      name: 'Midnight',
      emoji: '🌑',
      description: 'Deep dark blue theme',
      primary: '#0f172a',
      background: '#1e293b',
    },
    gold: {
      id: 'gold',
      name: 'Gold',
      emoji: '✨',
      description: 'Luxurious gold theme',
      primary: '#fbbf24',
      background: '#78350f',
    },
    cyber: {
      id: 'cyber',
      name: 'Cyberpunk',
      emoji: '🤖',
      description: 'Neon futuristic theme',
      primary: '#ec4899',
      background: '#7c3aed',
    },
  };

  res.json({
    success: true,
    data: themes,
  });
});

// @desc    Get available wallpapers
// @route   GET /api/appearance/wallpapers
// @access  Private
export const getAvailableWallpapers = asyncHandler(async (req, res) => {
  const wallpapers = [
    { id: 'none', name: 'None', thumbnail: null, url: null },
    { id: 'default', name: 'Default', thumbnail: '/wallpapers/default-thumb.jpg', url: '/wallpapers/default.jpg' },
    { id: 'abstract', name: 'Abstract', thumbnail: '/wallpapers/abstract-thumb.jpg', url: '/wallpapers/abstract.jpg' },
    { id: 'gradient1', name: 'Gradient Blue', thumbnail: '/wallpapers/gradient1-thumb.jpg', url: '/wallpapers/gradient1.jpg' },
    { id: 'gradient2', name: 'Gradient Purple', thumbnail: '/wallpapers/gradient2-thumb.jpg', url: '/wallpapers/gradient2.jpg' },
    { id: 'pattern1', name: 'Pattern Dots', thumbnail: '/wallpapers/pattern1-thumb.jpg', url: '/wallpapers/pattern1.jpg' },
    { id: 'nature1', name: 'Nature Leaves', thumbnail: '/wallpapers/nature1-thumb.jpg', url: '/wallpapers/nature1.jpg' },
    { id: 'nature2', name: 'Mountain View', thumbnail: '/wallpapers/nature2-thumb.jpg', url: '/wallpapers/nature2.jpg' },
    { id: 'geometric1', name: 'Geometric Shapes', thumbnail: '/wallpapers/geometric1-thumb.jpg', url: '/wallpapers/geometric1.jpg' },
    { id: 'blur1', name: 'Soft Blur', thumbnail: '/wallpapers/blur1-thumb.jpg', url: '/wallpapers/blur1.jpg' },
    { id: 'stars', name: 'Starry Night', thumbnail: '/wallpapers/stars-thumb.jpg', url: '/wallpapers/stars.jpg' },
    { id: 'ocean', name: 'Ocean Waves', thumbnail: '/wallpapers/ocean-thumb.jpg', url: '/wallpapers/ocean.jpg' },
  ];

  res.json({
    success: true,
    data: wallpapers,
  });
});

// @desc    Upload custom wallpaper
// @route   POST /api/appearance/wallpaper/upload
// @access  Private
export const uploadCustomWallpaper = asyncHandler(async (req, res) => {
  const { wallpaperUrl } = req.body;

  if (!wallpaperUrl) {
    return res.status(400).json({
      success: false,
      message: 'Wallpaper URL is required',
    });
  }

  const user = await User.findById(req.user._id);
  if (!user.theme) user.theme = {};
  user.theme.wallpaper = wallpaperUrl;
  await user.save();

  res.json({
    success: true,
    message: 'Custom wallpaper uploaded and applied',
    data: { wallpaper: wallpaperUrl },
  });
});

// @desc    Set accessibility options
// @route   POST /api/appearance/accessibility
// @access  Private
export const setAccessibilityOptions = asyncHandler(async (req, res) => {
  const { highContrast, reduceMotion, compactMode } = req.body;

  const user = await User.findById(req.user._id);
  if (!user.theme) user.theme = {};

  if (highContrast !== undefined) user.theme.highContrast = highContrast;
  if (reduceMotion !== undefined) user.theme.reduceMotion = reduceMotion;
  if (compactMode !== undefined) user.theme.compactMode = compactMode;

  await user.save();

  res.json({
    success: true,
    message: 'Accessibility options updated',
    data: {
      highContrast: user.theme.highContrast,
      reduceMotion: user.theme.reduceMotion,
      compactMode: user.theme.compactMode,
    },
  });
});

// @desc    Set custom theme colors
// @route   POST /api/appearance/custom-colors
// @access  Private
export const setCustomColors = asyncHandler(async (req, res) => {
  const { primaryColor, secondaryColor, backgroundColor, textColor, accentColor } = req.body;

  const user = await User.findById(req.user._id);
  if (!user.theme) user.theme = {};
  if (!user.theme.customColors) user.theme.customColors = {};

  if (primaryColor) user.theme.customColors.primary = primaryColor;
  if (secondaryColor) user.theme.customColors.secondary = secondaryColor;
  if (backgroundColor) user.theme.customColors.background = backgroundColor;
  if (textColor) user.theme.customColors.text = textColor;
  if (accentColor) user.theme.accentColor = accentColor;

  await user.save();

  res.json({
    success: true,
    message: 'Custom colors updated',
    data: {
      customColors: user.theme.customColors,
      accentColor: user.theme.accentColor,
    },
  });
});

// @desc    Toggle gradient theme
// @route   POST /api/appearance/gradient
// @access  Private
export const toggleGradientTheme = asyncHandler(async (req, res) => {
  const { enabled } = req.body;

  const user = await User.findById(req.user._id);
  if (!user.theme) user.theme = {};

  user.theme.gradientTheme = enabled !== undefined ? enabled : !user.theme.gradientTheme;
  await user.save();

  res.json({
    success: true,
    message: user.theme.gradientTheme ? 'Gradient theme enabled' : 'Gradient theme disabled',
    data: { gradientTheme: user.theme.gradientTheme },
  });
});

// @desc    Set dark mode level
// @route   POST /api/appearance/dark-mode-level
// @access  Private
export const setDarkModeLevel = asyncHandler(async (req, res) => {
  const { level } = req.body;

  if (!level || !['default', 'dark', 'darker', 'amoled'].includes(level)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid dark mode level',
    });
  }

  const user = await User.findById(req.user._id);
  if (!user.theme) user.theme = {};

  user.theme.darkModeLevel = level;
  await user.save();

  res.json({
    success: true,
    message: `Dark mode level set to ${level}`,
    data: { darkModeLevel: level },
  });
});

// @desc    Create custom theme
// @route   POST /api/appearance/create-theme
// @access  Private
export const createCustomTheme = asyncHandler(async (req, res) => {
  const { name, colors, gradient } = req.body;

  if (!name || !colors) {
    return res.status(400).json({
      success: false,
      message: 'Theme name and colors are required',
    });
  }

  const user = await User.findById(req.user._id);
  if (!user.theme) user.theme = {};
  if (!user.theme.customThemes) user.theme.customThemes = [];

  const newTheme = {
    id: `custom_${Date.now()}`,
    name,
    colors,
    gradient: gradient || false,
    createdAt: new Date(),
  };

  user.theme.customThemes.push(newTheme);
  await user.save();

  res.json({
    success: true,
    message: 'Custom theme created',
    data: newTheme,
  });
});

// @desc    Get custom themes
// @route   GET /api/appearance/custom-themes
// @access  Private
export const getCustomThemes = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    data: user.theme?.customThemes || [],
  });
});

// @desc    Delete custom theme
// @route   DELETE /api/appearance/custom-theme/:themeId
// @access  Private
export const deleteCustomTheme = asyncHandler(async (req, res) => {
  const { themeId } = req.params;

  const user = await User.findById(req.user._id);
  if (!user.theme || !user.theme.customThemes) {
    return res.status(404).json({
      success: false,
      message: 'No custom themes found',
    });
  }

  user.theme.customThemes = user.theme.customThemes.filter(
    theme => theme.id !== themeId
  );
  await user.save();

  res.json({
    success: true,
    message: 'Custom theme deleted',
  });
});
