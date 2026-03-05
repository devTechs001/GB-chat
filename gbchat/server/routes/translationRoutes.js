// routes/translationRoutes.js
import express from 'express';
import {
  translateTextEndpoint,
  translateMessage,
  getSupportedLanguages,
  detectLanguageEndpoint,
} from '../controllers/translationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get supported languages
router.get('/languages', getSupportedLanguages);

// Detect language
router.post('/detect', detectLanguageEndpoint);

// Translate text (for input)
router.post('/translate-text', translateTextEndpoint);

// Translate message (existing message)
router.post('/translate', translateMessage);

export default router;
