import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import Avatar from '../common/Avatar'
import { formatDistanceToNow } from 'date-fns'
import api from '../../lib/api'
import clsx from 'clsx'

const PinnedMessages = ({ chatId, onMessageClick }) => {
  const [pinnedMessages, setPinnedMessages] = useState([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetchPinnedMessages()
  }, [chatId])

  const fetchPinnedMessages = async () => {
    try {
      const { data } = await api.get(`/chats/${chatId}/pinned`)
      setPinnedMessages(data.messages)
    } catch (error) {
      console.error('Failed to fetch pinned messages:', error)
    }
  }

  const handleUnpin = async (messageId) => {
    try {
      await api.post(`/messages/${messageId}/unpin`)
      setPinnedMessages((prev) => prev.filter((m) => m._id !== messageId))
    } catch (error) {
      console.error('Failed to unpin message:', error)
    }
  }

  if (pinnedMessages.length === 0) return null

  const currentMessage = pinnedMessages[currentIndex]

  return (
    <div className="bg-primary-50 dark:bg-primary-900/20 border-b border-primary-100 dark:border-primary-800">
      {/* Collapsed View */}
      {!isExpanded ? (
        <div
          className="flex items-center gap-3 px-4 py-2 cursor-pointer"
          onClick={() => setIsExpanded(true)}
        >
          <div className="flex-shrink-0 w-1 h-8 bg-primary-500 rounded-full" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                Pinned Message {pinnedMessages.length > 1 && `(${currentIndex + 1}/${pinnedMessages.length})`}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
              {currentMessage.content}
            </p>
          </div>

          {pinnedMessages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex((prev) => (prev + 1) % pinnedMessages.length)
              }}
              className="p-1 hover:bg-primary-100 dark:hover:bg-primary-800/50 rounded"
            >
              <ChevronDownIcon className="w-4 h-4 text-primary-600" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation()
              handleUnpin(currentMessage._id)
            }}
            className="p-1 hover:bg-primary-100 dark:hover:bg-primary-800/50 rounded"
          >
            <XMarkIcon className="w-4 h-4 text-primary-600" />
          </button>
        </div>
      ) : (
        /* Expanded View */
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-primary-700 dark:text-primary-300">
              Pinned Messages ({pinnedMessages.length})
            </h4>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-primary-100 dark:hover:bg-primary-800/50 rounded"
            >
              <XMarkIcon className="w-5 h-5 text-primary-600" />
            </button>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <AnimatePresence>
              {pinnedMessages.map((message, index) => (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={clsx(
                    'flex items-start gap-3 p-2 rounded-lg cursor-pointer',
                    'hover:bg-primary-100 dark:hover:bg-primary-800/50'
                  )}
                  onClick={() => onMessageClick?.(message._id)}
                >
                  <Avatar
                    src={message.sender.avatar}
                    alt={message.sender.name}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">
                        {message.sender.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {message.content}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUnpin(message._id)
                    }}
                    className="p-1 hover:bg-primary-200 dark:hover:bg-primary-700 rounded"
                  >
                    <XMarkIcon className="w-4 h-4 text-gray-500" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}

export default PinnedMessages