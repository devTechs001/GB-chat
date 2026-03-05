// controllers/translationController.js
import asyncHandler from 'express-async-handler';

// Supported languages
const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'bn': 'Bengali',
  'ur': 'Urdu',
  'tr': 'Turkish',
  'vi': 'Vietnamese',
  'th': 'Thai',
  'id': 'Indonesian',
  'ms': 'Malay',
  'sw': 'Swahili',
};

// Simple translation mapping (in production, use a real translation API)
const TRANSLATION_DICTIONARY = {
  'hello': {
    'es': 'hola',
    'fr': 'bonjour',
    'de': 'hallo',
    'it': 'ciao',
    'pt': 'olá',
    'ru': 'привет',
    'ja': 'こんにちは',
    'ko': '안녕하세요',
    'zh': '你好',
    'ar': 'مرحبا',
    'hi': 'नमस्ते',
    'bn': 'হ্যালো',
    'ur': 'ہیلو',
    'tr': 'merhaba',
    'vi': 'xin chào',
    'th': 'สวัสดี',
    'id': 'halo',
    'ms': 'hai',
    'sw': 'habari',
  },
  // Add more common phrases as needed
};

// Detect language (simple heuristic)
const detectLanguage = (text) => {
  const textLower = text.toLowerCase();
  
  // Check for common characters/patterns
  if (/[\u0600-\u06FF]/.test(text)) return 'ar'; // Arabic
  if (/[\u0400-\u04FF]/.test(text)) return 'ru'; // Russian
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja'; // Japanese
  if (/[\uAC00-\uD7AF]/.test(text)) return 'ko'; // Korean
  if (/[\u4E00-\u9FA5]/.test(text)) return 'zh'; // Chinese
  if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Hindi
  if (/[\u0980-\u09FF]/.test(text)) return 'bn'; // Bengali
  if (/[\u0600-\u06FF]/.test(text)) return 'ur'; // Urdu
  
  // Check for common words
  if (/\b(hola|buenos|días)\b/i.test(textLower)) return 'es';
  if (/\b(bonjour|merci|au revoir)\b/i.test(textLower)) return 'fr';
  if (/\b(hallo|guten tag|danke)\b/i.test(textLower)) return 'de';
  if (/\b(ciao|buongiorno|grazie)\b/i.test(textLower)) return 'it';
  if (/\b(olá|bom dia|obrigado)\b/i.test(textLower)) return 'pt';
  if (/\b(merhaba|günaydın|teşekkürler)\b/i.test(textLower)) return 'tr';
  if (/\b(xin chào|cảm ơn)\b/i.test(textLower)) return 'vi';
  if (/\b(สวัสดี|ขอบคุณ)\b/i.test(textLower)) return 'th';
  if (/\b(halo|selamat pagi|terima kasih)\b/i.test(textLower)) return 'id';
  
  // Default to English
  return 'en';
};

// Simple translation function (in production, integrate with Google Translate, DeepL, etc.)
const translateText = (text, targetLang, sourceLang = 'auto') => {
  // Detect source language if auto
  const detectedLang = sourceLang === 'auto' ? detectLanguage(text) : sourceLang;
  
  // If same language, return original
  if (detectedLang === targetLang) {
    return {
      translatedText: text,
      detectedLang,
      isSameLanguage: true,
    };
  }
  
  // For demo purposes, we'll use a simple approach
  // In production, integrate with a real translation API
  const lowerText = text.toLowerCase();
  let translated = text;
  
  // Check dictionary for exact matches
  Object.keys(TRANSLATION_DICTIONARY).forEach(word => {
    if (lowerText.includes(word)) {
      const translation = TRANSLATION_DICTIONARY[word][targetLang];
      if (translation) {
        translated = translated.replace(new RegExp(word, 'gi'), translation);
      }
    }
  });
  
  // For demo: add a prefix to show translation happened
  if (translated === text) {
    translated = `[${SUPPORTED_LANGUAGES[targetLang]}] ${text}`;
  }
  
  return {
    translatedText: translated,
    detectedLang,
    isSameLanguage: false,
  };
};

// @desc    Translate text
// @route   POST /api/translations/translate-text
// @access  Private
export const translateTextEndpoint = asyncHandler(async (req, res) => {
  const { text, targetLang, sourceLang = 'auto' } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Text is required',
    });
  }

  if (!targetLang || !SUPPORTED_LANGUAGES[targetLang]) {
    return res.status(400).json({
      success: false,
      message: 'Invalid target language',
    });
  }

  const result = translateText(text, targetLang, sourceLang);

  res.json({
    success: true,
    data: {
      originalText: text,
      translatedText: result.translatedText,
      detectedLang: result.detectedLang,
      targetLang,
      isSameLanguage: result.isSameLanguage || false,
    },
  });
});

// @desc    Translate a message
// @route   POST /api/messages/translate
// @access  Private
export const translateMessage = asyncHandler(async (req, res) => {
  const { messageId, text, targetLang, sourceLang = 'auto' } = req.body;

  if (!messageId) {
    return res.status(400).json({
      success: false,
      message: 'Message ID is required',
    });
  }

  if (!text || typeof text !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Text is required',
    });
  }

  if (!targetLang || !SUPPORTED_LANGUAGES[targetLang]) {
    return res.status(400).json({
      success: false,
      message: 'Invalid target language',
    });
  }

  const result = translateText(text, targetLang, sourceLang);

  res.json({
    success: true,
    data: {
      messageId,
      originalText: text,
      translatedText: result.translatedText,
      detectedLang: result.detectedLang,
      targetLang,
    },
  });
});

// @desc    Get supported languages
// @route   GET /api/translations/languages
// @access  Private
export const getSupportedLanguages = asyncHandler(async (req, res) => {
  const languages = Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => ({
    code,
    name,
    auto: code === 'en', // English can be auto-detected
  }));

  res.json({
    success: true,
    data: languages,
  });
});

// @desc    Detect language
// @route   POST /api/translations/detect
// @access  Private
export const detectLanguageEndpoint = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Text is required',
    });
  }

  const detectedLang = detectLanguage(text);

  res.json({
    success: true,
    data: {
      text,
      detectedLang,
      languageName: SUPPORTED_LANGUAGES[detectedLang] || 'Unknown',
      confidence: 0.9, // Mock confidence score
    },
  });
});
