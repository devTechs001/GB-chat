import React, { useEffect, useRef } from 'react'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import useThemeStore from '../../store/useThemeStore'
import clsx from 'clsx'

const EmojiPicker = ({ onSelect, onClose, position = 'bottom' }) => {
  const { theme } = useThemeStore()
  const pickerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleEmojiSelect = (emoji) => {
    onSelect(emoji.native)
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={pickerRef}
        initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : -10 }}
        className={clsx(
          'absolute z-50 shadow-2xl rounded-xl overflow-hidden',
          'bg-white dark:bg-gray-800',
          'border border-gray-200 dark:border-gray-700'
        )}
        style={{
          [position]: 'calc(100% + 8px)',
          right: position === 'top' ? '0' : 'auto',
        }}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="md:hidden absolute top-2 right-2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="p-2">
          <Picker
            data={data}
            onEmojiSelect={handleEmojiSelect}
            theme={theme === 'dark' ? 'dark' : 'light'}
            previewPosition="none"
            skinTonePosition="search"
            maxFrequentRows={2}
            perLine={8}
            emojiSize={20}
            emojiButtonSize={32}
            className="emoji-picker-custom"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default EmojiPicker