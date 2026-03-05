// routes/appearanceRoutes.js
import express from 'express';
import {
  getAppearanceSettings,
  updateAppearanceSettings,
  setTheme,
  setWallpaper,
  setFontSize,
  setBubbleStyle,
  setChatEffects,
  setMessageAnimation,
  resetAppearanceToDefaults,
  getAvailableThemes,
  getAvailableWallpapers,
  uploadCustomWallpaper,
  setAccessibilityOptions,
  setCustomColors,
  toggleGradientTheme,
  setDarkModeLevel,
  createCustomTheme,
  getCustomThemes,
  deleteCustomTheme,
} from '../controllers/appearanceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get/Set appearance settings
router.get('/settings', getAppearanceSettings);
router.put('/settings', updateAppearanceSettings);

// Theme management
router.get('/themes', getAvailableThemes);
router.post('/theme', setTheme);

// Custom themes
router.get('/custom-themes', getCustomThemes);
router.post('/create-theme', createCustomTheme);
router.delete('/custom-theme/:themeId', deleteCustomTheme);

// Wallpaper management
router.get('/wallpapers', getAvailableWallpapers);
router.post('/wallpaper', setWallpaper);
router.post('/wallpaper/upload', uploadCustomWallpaper);

// Font size
router.post('/font-size', setFontSize);

// Bubble style
router.post('/bubble-style', setBubbleStyle);

// Chat effects
router.post('/chat-effects', setChatEffects);

// Message animation
router.post('/message-animation', setMessageAnimation);

// Accessibility
router.post('/accessibility', setAccessibilityOptions);

// Custom colors
router.post('/custom-colors', setCustomColors);

// Gradient theme
router.post('/gradient', toggleGradientTheme);

// Dark mode level
router.post('/dark-mode-level', setDarkModeLevel);

// Reset to defaults
router.post('/reset', resetAppearanceToDefaults);

export default router;
