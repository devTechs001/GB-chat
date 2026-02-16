import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PaperClipIcon,
  FaceSmileIcon,
  MicrophoneIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  DocumentIcon,
  MapPinIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import EmojiPicker from '../common/EmojiPicker'
import VoiceRecorder from './VoiceRecorder'
import Button from '../common/Button'
import clsx from 'clsx'
import useSocket from '../../hooks/useSocket'

const ChatInput = ({ onSendMessage, replyTo, chatId }) => {
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachments, setShowAttachments] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const { emitTyping } = useSocket()

  // Auto-focus input on mount and when reply changes
  useEffect(() => {
    inputRef.current?.focus()
  }, [replyTo])

  // Handle typing indicator
  const handleTyping = (value) => {
    setMessage(value)
    
    if (!isTyping && value.length > 0) {
      setIsTyping(true)
      emitTyping(chatId, true)
    }
    
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false)
        emitTyping(chatId, false)
      }
    }, 1000)
  }

  const handleSend = () => {
    if (message.trim() || attachedFiles.length > 0) {
      onSendMessage(message.trim(), attachedFiles)
      setMessage('')
      setAttachedFiles([])
      setShowAttachments(false)
      inputRef.current?.focus()
      
      if (isTyping) {
        setIsTyping(false)
        emitTyping(chatId, false)
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setAttachedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const attachmentOptions = [
    { icon: PhotoIcon, label: 'Photo & Video', accept: 'image/*,video/*' },
    { icon: DocumentIcon, label: 'Document', accept: '.pdf,.doc,.docx,.txt' },
    { icon: MapPinIcon, label: 'Location', action: 'location' },
  ]

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Attached files preview */}
      {attachedFiles.length > 0 && (
        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2 overflow-x-auto">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="relative flex-shrink-0 group"
              >
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <DocumentIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 p-2 md:p-3">
        {/* Mobile: Toggle attachments, Desktop: Show button */}
        <button
          onClick={() => setShowAttachments(!showAttachments)}
          className={clsx(
            'p-2 rounded-full transition-colors',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            showAttachments && 'bg-gray-100 dark:bg-gray-800'
          )}
        >
          <PaperClipIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
            className={clsx(
              'w-full px-3 py-2 md:px-4 md:py-2.5',
              'bg-gray-100 dark:bg-gray-800',
              'rounded-full resize-none',
              'text-sm md:text-base',
              'placeholder-gray-500 dark:placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-primary-500',
              'max-h-32 overflow-y-auto'
            )}
            style={{ minHeight: '40px' }}
          />
          
          {/* Emoji picker button */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-2 bottom-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
          >
            <FaceSmileIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Send button or voice recorder */}
        {message.trim() || attachedFiles.length > 0 ? (
          <button
            onClick={handleSend}
            className={clsx(
              'p-2 md:p-2.5 rounded-full',
              'bg-primary-600 hover:bg-primary-700',
              'text-white transition-colors'
            )}
          >
            <PaperAirplaneIcon className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        ) : (
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={clsx(
              'p-2 md:p-2.5 rounded-full transition-colors',
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            <MicrophoneIcon className={clsx(
              'w-5 h-5 md:w-6 md:h-6',
              !isRecording && 'text-gray-600 dark:text-gray-400'
            )} />
          </button>
        )}
      </div>

      {/* Attachment options - Mobile bottom sheet style */}
      <AnimatePresence>
        {showAttachments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 dark:border-gray-700"
          >
            <div className="grid grid-cols-3 md:flex md:gap-4 p-3">
              {attachmentOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => {
                    if (option.action === 'location') {
                      // Handle location sharing
                      console.log('Share location')
                    } else {
                      fileInputRef.current.accept = option.accept
                      fileInputRef.current.click()
                    }
                  }}
                  className="flex flex-col items-center gap-1 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <option.icon className="w-8 h-8 md:w-6 md:h-6 text-primary-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-2 md:left-auto md:right-2 z-50">
          <EmojiPicker
            onSelect={(emoji) => {
              setMessage(prev => prev + emoji)
              setShowEmojiPicker(false)
              inputRef.current?.focus()
            }}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}

      {/* Voice Recorder */}
      {isRecording && (
        <VoiceRecorder
          onStop={(audioBlob) => {
            setAttachedFiles(prev => [...prev, audioBlob])
            setIsRecording(false)
          }}
          onCancel={() => setIsRecording(false)}
        />
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  )
}

export default ChatInput