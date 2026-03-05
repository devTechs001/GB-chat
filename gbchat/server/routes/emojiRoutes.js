// routes/emojiRoutes.js
import express from 'express';
import {
  getEmojiCategories,
  getEmojisByCategory,
  getAllEmojis,
  searchEmojis,
  getFrequentEmojis,
  addFrequentEmoji,
  getEmojiByUnicode,
} from '../controllers/emojiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all emojis
router.get('/all', getAllEmojis);

// Get emoji categories
router.get('/categories', getEmojiCategories);

// Get emojis by category
router.get('/category/:categoryId', getEmojisByCategory);

// Search emojis
router.get('/search', searchEmojis);

// Frequently used emojis
router.get('/frequent', getFrequentEmojis);
router.post('/frequent', addFrequentEmoji);

// Get emoji by unicode
router.get('/unicode/:unicode', getEmojiByUnicode);

export default router;
