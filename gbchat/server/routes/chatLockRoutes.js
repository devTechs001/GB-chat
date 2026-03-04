import express from 'express';
import {
  lockChat,
  unlockChat,
  toggleLock,
  getLockStatus,
  getLockedChats,
  updateLockSettings,
  removeLock,
  quickToggle
} from '../controllers/chatLockController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all locked chats for user
router.get('/locked', getLockedChats);

// Get lock status for specific chat
router.get('/status/:chatId', getLockStatus);

// Quick toggle lock (for already configured chats)
router.post('/:chatId/toggle', quickToggle);

// Lock a chat
router.post('/lock', lockChat);

// Unlock a chat
router.post('/unlock', unlockChat);

// Toggle lock with PIN verification
router.post('/toggle', toggleLock);

// Update lock settings
router.put('/:chatId/settings', updateLockSettings);

// Remove lock
router.delete('/remove', removeLock);

export default router;
