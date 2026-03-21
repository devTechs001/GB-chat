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
import {
  // Privacy Toggles
  toggleOnlineStatus,
  toggleLastSeen,
  toggleReadReceipts,
  toggleDeliveryReceipts,
  toggleForwardLabel,
  toggleAntiStatusView,
  toggleAntiDeleteStatus,
  toggleAntiRevoke,
  toggleViewOnceBypass,
  toggleIncognitoMode,
  // Customization Toggles
  toggleCustomTheme,
  toggleCustomFont,
  setWidgetSettings,
  // Messaging Toggles
  toggleScheduleMessages,
  pinMessage,
  unpinMessage,
  getPinnedMessages,
  starMessage,
  unstarMessage,
  getStarredMessages,
  addChatFilter,
  removeChatFilter,
  getChatFilters,
  // Media Toggles
  toggleHDUpload,
  toggleMediaZoom,
  toggleGalleryViewer,
  toggleAutoSaveStatus,
  // Group Toggles
  toggleJoinViaLink,
  toggleAutoJoinGroups,
  hideGroup,
  unhideGroup,
  getHiddenGroups,
  // Advanced Toggles
  toggleCopySentMessages,
  toggleExtendedStatusLimit,
  toggleExactTimestamps,
  toggleConfirmClearChats,
  toggleArchiveOnSwipe,
  toggleEnterToSend,
  toggleDoubleTapToReply,
  // Stats
  getStats,
} from '../controllers/gbSettingsAdditional.controller.js';
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
// Individual Privacy Toggles
router.post('/privacy/online-status', toggleOnlineStatus);
router.post('/privacy/last-seen', toggleLastSeen);
router.post('/privacy/read-receipts', toggleReadReceipts);
router.post('/privacy/delivery-receipts', toggleDeliveryReceipts);
router.post('/privacy/forward-label', toggleForwardLabel);
router.post('/privacy/anti-status-view', toggleAntiStatusView);
router.post('/privacy/anti-delete-status', toggleAntiDeleteStatus);
router.post('/privacy/anti-revoke', toggleAntiRevoke);
router.post('/privacy/view-once-bypass', toggleViewOnceBypass);
router.post('/privacy/incognito-mode', toggleIncognitoMode);

// ============================================================================
// Theme Settings
// ============================================================================
router.get('/themes', getThemeSettings);
router.put('/themes', updateThemeSettings);
router.post('/theme', setTheme);
router.post('/font', setFont);
router.post('/icon-pack', setIconPack);
// Individual Theme Toggles
router.post('/themes/custom', toggleCustomTheme);
router.post('/themes/font', toggleCustomFont);
router.post('/themes/widget', setWidgetSettings);

// ============================================================================
// Messaging Settings
// ============================================================================
router.get('/messaging', getMessagingSettings);
router.put('/messaging', updateMessagingSettings);
router.post('/auto-delete', setAutoDelete);
router.post('/dnd', setDNDMode);
// Individual Messaging Toggles
router.post('/messaging/schedule', toggleScheduleMessages);
router.get('/messaging/pinned', getPinnedMessages);
router.post('/messaging/pin', pinMessage);
router.post('/messaging/unpin', unpinMessage);
router.get('/messaging/starred', getStarredMessages);
router.post('/messaging/star', starMessage);
router.post('/messaging/unstar', unstarMessage);
router.get('/messaging/filters', getChatFilters);
router.post('/messaging/filter', addChatFilter);
router.delete('/messaging/filter', removeChatFilter);

// ============================================================================
// Media Settings
// ============================================================================
router.get('/media', getMediaSettings);
router.put('/media', updateMediaSettings);
router.post('/upload-quality', setUploadQuality);
router.post('/auto-download', setAutoDownload);
// Individual Media Toggles
router.post('/media/hd-upload', toggleHDUpload);
router.post('/media/zoom', toggleMediaZoom);
router.post('/media/gallery-viewer', toggleGalleryViewer);
router.post('/media/auto-save-status', toggleAutoSaveStatus);

// ============================================================================
// Group Settings
// ============================================================================
router.get('/groups', getGroupSettings);
router.put('/groups', updateGroupSettings);
// Individual Group Toggles
router.post('/groups/join-via-link', toggleJoinViaLink);
router.post('/groups/auto-join', toggleAutoJoinGroups);
router.get('/groups/hidden', getHiddenGroups);
router.post('/groups/hide', hideGroup);
router.post('/groups/unhide', unhideGroup);

// ============================================================================
// Advanced Settings
// ============================================================================
router.get('/advanced', getAdvancedSettings);
router.put('/advanced', updateAdvancedSettings);
router.post('/call-quality', setCallQuality);
// Individual Advanced Toggles
router.post('/advanced/copy-sent', toggleCopySentMessages);
router.post('/advanced/extended-status', toggleExtendedStatusLimit);
router.post('/advanced/exact-timestamps', toggleExactTimestamps);
router.post('/advanced/confirm-clear', toggleConfirmClearChats);
router.post('/advanced/archive-on-swipe', toggleArchiveOnSwipe);
router.post('/advanced/enter-to-send', toggleEnterToSend);
router.post('/advanced/double-tap', toggleDoubleTapToReply);

// ============================================================================
// Home Screen Settings
// ============================================================================
router.get('/home-screen', getHomeScreenSettings);
router.put('/home-screen', updateHomeScreenSettings);

// ============================================================================
// Statistics
// ============================================================================
router.get('/stats', getStats);

export default router;
