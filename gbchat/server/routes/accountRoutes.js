// routes/accountRoutes.js
import express from 'express';
import {
  getAccountSettings,
  updateAccountSettings,
  updateProfile,
  changePassword,
  enable2FA,
  verify2FA,
  disable2FA,
  getActiveSessions,
  logoutFromSession,
  logoutFromAllSessions,
  deleteAccount,
  exportAccountData,
  deactivateAccount,
  reactivateAccount,
} from '../controllers/accountController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Account settings
router.get('/settings', getAccountSettings);
router.put('/settings', updateAccountSettings);

// Profile management
router.put('/profile', updateProfile);

// Password management
router.post('/change-password', changePassword);

// 2FA management
router.post('/2fa/enable', enable2FA);
router.post('/2fa/verify', verify2FA);
router.post('/2fa/disable', disable2FA);

// Session management
router.get('/sessions', getActiveSessions);
router.post('/sessions/logout/:sessionId', logoutFromSession);
router.post('/sessions/logout-all', logoutFromAllSessions);

// Account management
router.post('/deactivate', deactivateAccount);
router.post('/reactivate', reactivateAccount);
router.delete('/', deleteAccount);

// Export data
router.get('/export', exportAccountData);

export default router;
