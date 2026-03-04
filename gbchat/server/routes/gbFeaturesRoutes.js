import express from 'express';
import {
  getGBFeatures,
  updateGBFeatures,
  toggleFeature,
  pinMessage,
  unpinMessage,
  getPinnedMessages,
  starMessage,
  unstarMessage,
  getStarredMessages,
  scheduleMessage,
  getScheduledMessages,
  cancelScheduledMessage,
  createChatFilter,
  updateChatFilter,
  deleteChatFilter,
  getChatFilters
} from '../controllers/gbFeaturesController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get GB features
router.get('/', getGBFeatures);

// Update GB features
router.put('/', updateGBFeatures);

// Toggle specific feature
router.post('/toggle', toggleFeature);

// Pinned messages
router.post('/pin', pinMessage);
router.post('/unpin', unpinMessage);
router.get('/pinned', getPinnedMessages);

// Starred messages
router.post('/star', starMessage);
router.post('/unstar', unstarMessage);
router.get('/starred', getStarredMessages);

// Scheduled messages
router.post('/schedule', scheduleMessage);
router.get('/scheduled', getScheduledMessages);
router.post('/cancel-schedule', cancelScheduledMessage);

// Chat filters
router.get('/filters', getChatFilters);
router.post('/filters', createChatFilter);
router.put('/filters', updateChatFilter);
router.delete('/filters', deleteChatFilter);

export default router;
