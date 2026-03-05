// routes/chatSettingsRoutes.js
import express from 'express';
import {
  getChatSettings,
  updateChatSettings,
  setMediaQuality,
  clearAllChats,
  exportChats,
  archiveAllChats,
  getGlobalWallpaper,
  setGlobalWallpaper,
  toggleChatSetting,
  setAutoReply,
  setQuickReactions,
  createChatFolder,
  updateChatFolder,
  deleteChatFolder,
  getChatFolders,
  setSwipeActions,
  setAutoArchive,
} from '../controllers/chatSettingsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Get/Set chat settings
router.get('/', getChatSettings);
router.put('/', updateChatSettings);

// Media quality
router.post('/media-quality', setMediaQuality);

// Chat management
router.post('/clear-all', clearAllChats);
router.post('/archive-all', archiveAllChats);
router.get('/export', exportChats);

// Global wallpaper
router.get('/global-wallpaper', getGlobalWallpaper);
router.post('/global-wallpaper', setGlobalWallpaper);

// Toggle settings
router.post('/toggle/:setting', toggleChatSetting);

// Auto-reply
router.post('/auto-reply', setAutoReply);

// Quick reactions
router.post('/quick-reactions', setQuickReactions);

// Chat folders
router.get('/folders', getChatFolders);
router.post('/folders', createChatFolder);
router.put('/folders/:folderId', updateChatFolder);
router.delete('/folders/:folderId', deleteChatFolder);

// Swipe actions
router.post('/swipe-actions', setSwipeActions);

// Auto-archive
router.post('/auto-archive', setAutoArchive);

export default router;
