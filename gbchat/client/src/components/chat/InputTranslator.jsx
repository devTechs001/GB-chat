import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LanguageIcon,
  ArrowPathIcon,
  SparklesIcon,
  CheckIcon,
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

const InputTranslator = ({ onTranslate, inputValue, disabled = false }) => {
  const [showTranslator, setShowTranslator] = useState(false)
  const [sourceLang, setSourceLang] = useState('auto')
  const [targetLang, setTargetLang] = useState('en')
  const [translatedText, setTranslatedText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [autoTranslate, setAutoTranslate] = useState(false)
  const [detectedLang, setDetectedLang] = useState(null)

  // Load user's preferred translation language from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('preferred-translate-lang')
    if (saved) {
      setTargetLang(saved)
    }
    const savedAuto = localStorage.getItem('auto-translate')
    if (savedAuto) {
      setAutoTranslate(JSON.parse(savedAuto))
    }
  }, [])

  const handleTranslate = async (text = inputValue) => {
    if (!text || text.trim() === '') {
      toast.error('No text to translate')
      return
    }

    setIsTranslating(true)
    try {
      const { data } = await api.post('/messages/translate-text', {
        text: text,
        targetLang,
        sourceLang: sourceLang === 'auto' ? undefined : sourceLang,
      })

      setTranslatedText(data.translatedText)
      setDetectedLang(data.detectedLang || 'auto')
      onTranslate?.(data.translatedText)
      toast.success('Text translated')
    } catch (error) {
      console.error('Translation error:', error)
      toast.error(error?.response?.data?.message || 'Translation failed')
    } finally {
      setIsTranslating(false)
    }
  }

  const handleApplyTranslation = () => {
    if (translatedText) {
      onTranslate?.(translatedText)
      setShowTranslator(false)
      toast.success('Translation applied to message')
    }
  }

  const handleSavePreference = () => {
    localStorage.setItem('preferred-translate-lang', targetLang)
    localStorage.setItem('auto-translate', JSON.stringify(autoTranslate))
    toast.success('Translation preferences saved')
  }

  return (
    <div className="relative">
      {/* Translator toggle button */}
      <button
        onClick={() => setShowTranslator(!showTranslator)}
        disabled={disabled}
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-sm',
          disabled
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
            : showTranslator
            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 ring-2 ring-primary-500'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        )}
        title="Translate message"
      >
        {showTranslator ? (
          <>
            <SparklesSolid className="w-4 h-4" />
            <span className="hidden md:inline">Translating</span>
          </>
        ) : (
          <>
            <LanguageIcon className="w-4 h-4" />
            <span className="hidden md:inline">Translate</span>
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
            className="absolute right-0 bottom-full mb-2 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <SparklesSolid className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Message Translator</h3>
                  <p className="text-white/80 text-xs">Translate your message before sending</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Source language */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  From
                </label>
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Original text preview */}
              {inputValue && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Original text
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-900 dark:text-white line-clamp-3">
                      {inputValue}
                    </p>
                  </div>
                </div>
              )}

              {/* Translate button */}
              <button
                onClick={() => handleTranslate()}
                disabled={isTranslating || !inputValue}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-all text-sm font-medium shadow-lg shadow-primary-500/30"
              >
                {isTranslating ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Translating...</span>
                  </>
                ) : (
                  <>
                    <SparklesSolid className="w-4 h-4" />
                    <span>Translate to {languages.find(l => l.code === targetLang)?.flag}</span>
                  </>
                )}
              </button>

              {/* Translated text */}
              {translatedText && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Translation
                    </label>
                    <select
                      value={targetLang}
                      onChange={(e) => {
                        setTargetLang(e.target.value)
                        handleTranslate()
                      }}
                      className="text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-primary-500"
                    >
                      {languages.slice(1).map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/30 rounded-lg border border-primary-200 dark:border-primary-800">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {translatedText}
                    </p>
                    {detectedLang && detectedLang !== 'auto' && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Detected: {languages.find(l => l.code === detectedLang)?.name}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleApplyTranslation}
                      className="flex-1 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckIcon className="w-4 h-4" />
                      Apply to message
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(translatedText)
                        toast.success('Copied!')
                      }}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                    >
                      📋 Copy
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Auto-translate toggle */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <ArrowPathIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      Auto-translate to {languages.find(l => l.code === targetLang)?.name}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={autoTranslate}
                      onChange={(e) => {
                        setAutoTranslate(e.target.checked)
                        localStorage.setItem('auto-translate', JSON.stringify(e.target.checked))
                      }}
                      className="sr-only"
                    />
                    <div
                      className={clsx(
                        'w-10 h-5 rounded-full transition-colors',
                        autoTranslate ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                      )}
                    >
                      <div
                        className={clsx(
                          'w-4 h-4 bg-white rounded-full shadow-md transform transition-transform mt-0.5',
                          autoTranslate ? 'translate-x-5 ml-0.5' : 'translate-x-0.5 ml-0.5'
                        )}
                      />
                    </div>
                  </div>
                </label>
                <button
                  onClick={handleSavePreference}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium mt-2"
                >
                  Save preferences
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default InputTranslator
