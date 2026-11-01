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
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllRead,
  deleteNotification,
  clearNotifications,
} from '../controllers/notificationFeedController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Feed ---------------------------------------------------------------
router.get('/', getNotifications);
router.delete('/', clearNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markNotificationRead);
router.delete('/:id', deleteNotification);

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
