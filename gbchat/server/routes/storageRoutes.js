// routes/storageRoutes.js
import express from 'express';
import {
  getStorageUsage,
  clearStorage,
  clearCache,
  clearTempFiles,
  getNetworkUsage,
  resetNetworkStats,
  getStorageByChat,
} from '../controllers/storageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Storage usage
router.get('/usage', getStorageUsage);

// Clear storage by type
router.delete('/clear/:type', clearStorage);

// Cache and temp files
router.post('/clear-cache', clearCache);
router.post('/clear-temp', clearTempFiles);

// Network usage
router.get('/network-usage', getNetworkUsage);
router.post('/reset-network-stats', resetNetworkStats);

// Storage by chat
router.get('/by-chat', getStorageByChat);

export default router;
