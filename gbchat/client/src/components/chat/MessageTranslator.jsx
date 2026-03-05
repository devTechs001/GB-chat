import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LanguageIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { SparklesIcon as SparklesSolid } from '@heroicons/react/24/solid'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const languages = [
  { code: 'auto', name: 'Auto Detect', flag: '🌐' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
]

const MessageTranslator = ({ messageId, content, type = 'text' }) => {
  const [showTranslator, setShowTranslator] = useState(false)
  const [detectedLang, setDetectedLang] = useState('auto')
  const [targetLang, setTargetLang] = useState('en')
  const [translatedText, setTranslatedText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [hasTranslated, setHasTranslated] = useState(false)

  const handleTranslate = async () => {
    if (!content || content.trim() === '') return

    setIsTranslating(true)
    try {
      const { data } = await api.post('/messages/translate', {
        messageId,
        text: content,
        targetLang,
        sourceLang: detectedLang === 'auto' ? undefined : detectedLang,
      })

      setTranslatedText(data.translatedText)
      setDetectedLang(data.detectedLang || 'auto')
      setHasTranslated(true)
      toast.success('Message translated')
    } catch (error) {
      toast.error('Translation failed')
      console.error('Translation error:', error)
    } finally {
      setIsTranslating(false)
    }
  }

  const handleCopyTranslation = () => {
    navigator.clipboard.writeText(translatedText)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="relative">
      {/* Translate button */}
      <button
        onClick={() => setShowTranslator(!showTranslator)}
        className={clsx(
          'flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors',
          hasTranslated
            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        )}
      >
        {hasTranslated ? (
          <>
            <CheckIcon className="w-3 h-3" />
            <span>Translated</span>
          </>
        ) : (
          <>
            <LanguageIcon className="w-3 h-3" />
            <span>Translate</span>
          </>
        )}
      </button>

      {/* Translator panel */}
      <AnimatePresence>
        {showTranslator && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-72 md:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-primary-500 to-primary-600">
              <div className="flex items-center gap-2">
                <SparklesSolid className="w-4 h-4 text-white" />
                <span className="text-white font-medium text-sm">Translate</span>
              </div>
              <button
                onClick={() => setShowTranslator(false)}
                className="text-white/80 hover:text-white"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-3 space-y-3">
              {/* Original text */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Original</span>
                  <select
                    value={detectedLang}
                    onChange={(e) => setDetectedLang(e.target.value)}
                    className="text-xs bg-gray-100 dark:bg-gray-700 border-none rounded px-2 py-1 text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-primary-500"
                  >
                    {languages.slice(0, 10).map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-900 dark:text-white line-clamp-3">
                    {content}
                  </p>
                </div>
              </div>

              {/* Translate button */}
              <button
                onClick={handleTranslate}
                disabled={isTranslating}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors text-sm font-medium"
              >
                {isTranslating ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Translating...</span>
                  </>
                ) : (
                  <>
                    <SparklesSolid className="w-4 h-4" />
                    <span>Translate</span>
                  </>
                )}
              </button>

              {/* Translated text */}
              {hasTranslated && translatedText && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Translation</span>
                    <select
                      value={targetLang}
                      onChange={(e) => {
                        setTargetLang(e.target.value)
                        handleTranslate()
                      }}
                      className="text-xs bg-gray-100 dark:bg-gray-700 border-none rounded px-2 py-1 text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-primary-500"
                    >
                      {languages.slice(1).map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                    <p className="text-sm text-gray-900 dark:text-white line-clamp-3">
                      {translatedText}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyTranslation}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                  >
                    📋 Copy translation
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MessageTranslator
