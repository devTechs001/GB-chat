import express from 'express';
import {
  getAllPermissions,
  updateDevicePermissions,
  updateFeaturePermissions,
  updatePrivacyPermissions,
  toggleContactPermission,
  toggleCameraPermission,
  toggleMicrophonePermission,
  toggleMediaPermission,
  togglePhotosPermission,
  toggleStoragePermission,
  toggleLocationPermission,
  toggleNotificationPermission,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getPermissionHistory,
  resetPermissions
} from '../controllers/permissionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ============================================================================
// Get/Update All Permissions
// ============================================================================
router.get('/', getAllPermissions);
router.put('/device', updateDevicePermissions);
router.put('/feature', updateFeaturePermissions);
router.put('/privacy', updatePrivacyPermissions);
router.post('/reset', resetPermissions);

// ============================================================================
// Individual Device Permissions
// ============================================================================
router.post('/device/contacts', toggleContactPermission);
router.post('/device/camera', toggleCameraPermission);
router.post('/device/microphone', toggleMicrophonePermission);
router.post('/device/media', toggleMediaPermission);
router.post('/device/photos', togglePhotosPermission);
router.post('/device/storage', toggleStoragePermission);
router.post('/device/location', toggleLocationPermission);
router.post('/device/notifications', toggleNotificationPermission);

// ============================================================================
// Blocked Users
// ============================================================================
router.get('/blocked', getBlockedUsers);
router.post('/block', blockUser);
router.post('/unblock', unblockUser);

// ============================================================================
// Permission History
// ============================================================================
router.get('/history', getPermissionHistory);

export default router;
