import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import ChatBubble from './ChatBubble'
import useAuthStore from '../../store/useAuthStore'
import api from '../../lib/api'
import clsx from 'clsx'

const StarredMessagesModal = ({ isOpen, onClose, chatId }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    if (isOpen) {
      fetchStarredMessages()
    }
  }, [isOpen, chatId])

  const fetchStarredMessages = async () => {
    setLoading(true)
    try {
      const endpoint = chatId 
        ? `/chats/${chatId}/starred`
        : '/messages/starred'
      
      const { data } = await api.get(endpoint)
      setMessages(data.messages || data || [])
    } catch (error) {
      console.error('Failed to fetch starred messages:', error)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const handleUnstar = async (messageId) => {
    try {
      await api.post(`/messages/${messageId}/unstar`)
      setMessages(messages.filter(m => m._id !== messageId))
    } catch (error) {
      console.error('Failed to unstar message:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 pointer-events-auto"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative bg-white dark:bg-gray-900 w-full md:max-w-2xl md:rounded-2xl shadow-2xl pointer-events-auto flex flex-col max-h-[90vh] md:max-h-[80vh] overflow-hidden"
      >
        {/* Handle */}
        <div className="md:hidden flex items-center justify-center py-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-yellow-500 to-orange-500 md:rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <StarIconSolid className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {chatId ? 'Starred Messages' : 'All Starred'}
                </h2>
                <p className="text-xs text-white/80">
                  {messages.length} message{messages.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <StarIcon className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm">No starred messages</p>
              <p className="text-xs mt-1">Star important messages to find them quickly</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className="relative group"
                >
                  <ChatBubble
                    message={message}
                    isMine={message.sender?._id === user?._id}
                    showAvatar={false}
                  />
                  
                  {/* Unstar button */}
                  <button
                    onClick={() => handleUnstar(message._id)}
                    className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Remove from starred"
                  >
                    <StarIconSolid className="w-4 h-4 text-yellow-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default StarredMessagesModal
