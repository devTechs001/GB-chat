// routes/notificationRoutes.js
import express from 'express';
import {
  getNotificationSettings,
  updateNotificationSettings,
  toggleNotification,
  setNotificationSound,
  toggleDNDMode,
  setDNDSchedule,
  requestNotificationPermission,
  getNotificationSounds,
  sendTestNotification,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get/Set notification settings
router.get('/settings', getNotificationSettings);
router.put('/settings', updateNotificationSettings);

// Toggle notifications
router.post('/toggle/:setting', toggleNotification);

// Notification sound
router.get('/sounds', getNotificationSounds);
router.post('/sound', setNotificationSound);

// DND mode
router.post('/dnd', toggleDNDMode);
router.post('/dnd/schedule', setDNDSchedule);

// Permission
router.post('/permission', requestNotificationPermission);

// Test notification
router.post('/test', sendTestNotification);

export default router;
