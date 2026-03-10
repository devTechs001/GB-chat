// routes/gbSettingsRoutes.js
import express from 'express';
import {
  // Privacy Settings
  getPrivacySettings,
  updatePrivacySettings,
  // Theme Settings
  getThemeSettings,
  updateThemeSettings,
  setTheme,
  setFont,
  setIconPack,
  // Messaging Settings
  getMessagingSettings,
  updateMessagingSettings,
  setAutoDelete,
  setDNDMode,
  // Media Settings
  getMediaSettings,
  updateMediaSettings,
  setUploadQuality,
  setAutoDownload,
  // Group Settings
  getGroupSettings,
  updateGroupSettings,
  // Advanced Settings
  getAdvancedSettings,
  updateAdvancedSettings,
  setCallQuality,
  // Home Screen Settings
  getHomeScreenSettings,
  updateHomeScreenSettings,
  // All Settings
  getAllGBSettings,
  updateAllGBSettings,
  resetGBSettings,
} from '../controllers/gbSettingsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ============================================================================
// Get/Update All GB Settings
// ============================================================================
router.get('/', getAllGBSettings);
router.put('/', updateAllGBSettings);
router.post('/reset', resetGBSettings);

// ============================================================================
// Privacy Settings
// ============================================================================
router.get('/privacy', getPrivacySettings);
router.put('/privacy', updatePrivacySettings);

// ============================================================================
// Theme Settings
// ============================================================================
router.get('/themes', getThemeSettings);
router.put('/themes', updateThemeSettings);
router.post('/theme', setTheme);
router.post('/font', setFont);
router.post('/icon-pack', setIconPack);

// ============================================================================
// Messaging Settings
// ============================================================================
router.get('/messaging', getMessagingSettings);
router.put('/messaging', updateMessagingSettings);
router.post('/auto-delete', setAutoDelete);
router.post('/dnd', setDNDMode);

// ============================================================================
// Media Settings
// ============================================================================
router.get('/media', getMediaSettings);
router.put('/media', updateMediaSettings);
router.post('/upload-quality', setUploadQuality);
router.post('/auto-download', setAutoDownload);

// ============================================================================
// Group Settings
// ============================================================================
router.get('/groups', getGroupSettings);
router.put('/groups', updateGroupSettings);

// ============================================================================
// Advanced Settings
// ============================================================================
router.get('/advanced', getAdvancedSettings);
router.put('/advanced', updateAdvancedSettings);
router.post('/call-quality', setCallQuality);

// ============================================================================
// Home Screen Settings
// ============================================================================
router.get('/home-screen', getHomeScreenSettings);
router.put('/home-screen', updateHomeScreenSettings);

export default router;
