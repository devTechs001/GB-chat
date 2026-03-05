// routes/chatDisplayRoutes.js
import express from 'express';
import {
  getChatDisplaySettings,
  updateChatDisplaySettings,
  toggleStatusIcon,
  toggleNetworkIndicator,
  toggleTimestampSetting,
  setBubbleStyleDisplay,
  setFontSizeDisplay,
  setThemeDisplay,
  resetChatDisplaySettings,
} from '../controllers/chatDisplayController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get/Set chat display settings
router.get('/settings', getChatDisplaySettings);
router.put('/settings', updateChatDisplaySettings);

// Toggle status icons
router.post('/toggle-status/:setting', toggleStatusIcon);

// Toggle network indicators
router.post('/toggle-network/:setting', toggleNetworkIndicator);

// Toggle timestamp settings
router.post('/toggle-timestamp/:setting', toggleTimestampSetting);

// Appearance settings
router.post('/bubble-style', setBubbleStyleDisplay);
router.post('/font-size', setFontSizeDisplay);
router.post('/theme', setThemeDisplay);

// Reset to defaults
router.post('/reset', resetChatDisplaySettings);

export default router;
