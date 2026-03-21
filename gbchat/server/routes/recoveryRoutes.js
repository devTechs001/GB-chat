import express from 'express';
import {
  getRecoverySettings,
  setupEmailRecovery,
  verifyEmailRecovery,
  setupPhoneRecovery,
  generateRecoveryCodes,
  verifyRecoveryCode,
  setup2FA,
  verify2FA,
  disable2FA,
  addTrustedContact,
  removeTrustedContact,
  getTrustedContacts,
  requestAccountRecovery,
  resetPasswordViaRecovery,
  getRecoveryHistory,
  updateAccountProtection
} from '../controllers/recoveryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication (except account recovery request)
router.use(protect);

// ============================================================================
// Recovery Settings
// ============================================================================
router.get('/', getRecoverySettings);
router.get('/history', getRecoveryHistory);

// ============================================================================
// Email Recovery
// ============================================================================
router.post('/email/setup', setupEmailRecovery);
router.post('/email/verify', verifyEmailRecovery);

// ============================================================================
// Phone Recovery
// ============================================================================
router.post('/phone/setup', setupPhoneRecovery);

// ============================================================================
// Recovery Codes
// ============================================================================
router.post('/codes/generate', generateRecoveryCodes);
router.post('/codes/verify', verifyRecoveryCode);

// ============================================================================
// Two-Factor Authentication
// ============================================================================
router.post('/2fa/setup', setup2FA);
router.post('/2fa/verify', verify2FA);
router.post('/2fa/disable', disable2FA);

// ============================================================================
// Trusted Contacts
// ============================================================================
router.get('/trusted-contacts', getTrustedContacts);
router.post('/trusted-contacts/add', addTrustedContact);
router.post('/trusted-contacts/remove', removeTrustedContact);

// ============================================================================
// Account Protection
// ============================================================================
router.put('/protection', updateAccountProtection);

// ============================================================================
// Account Recovery (public route - no auth required)
// ============================================================================
router.post('/request', requestAccountRecovery);

// ============================================================================
// Password Reset via Recovery
// ============================================================================
router.post('/reset-password', resetPasswordViaRecovery);

export default router;
