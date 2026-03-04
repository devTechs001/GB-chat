// routes/privacyRoutes.js
import express from 'express';
import {
    getPrivacySettings,
    updatePrivacySettings,
    blockContact,
    unblockContact,
    getBlockedContacts,
    checkIfBlocked,
    toggleDisappearingMessages,
    updateLastSeenPrivacy,
    updateGroupPrivacy,
    enable2FA,
    disable2FA
} from '../controllers/privacyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/settings', getPrivacySettings);
router.put('/settings', updatePrivacySettings);

router.get('/blocked', getBlockedContacts);
router.post('/block/:userId', blockContact);
router.post('/unblock/:userId', unblockContact);
router.get('/is-blocked/:userId', checkIfBlocked);

router.post('/disappearing-messages', toggleDisappearingMessages);
router.post('/last-seen', updateLastSeenPrivacy);
router.post('/groups', updateGroupPrivacy);

router.post('/2fa/enable', enable2FA);
router.post('/2fa/disable', disable2FA);

export default router;
