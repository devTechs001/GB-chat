import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  StarIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import Avatar from '../common/Avatar'
import SearchBar from '../common/SearchBar'
import Modal from '../common/Modal'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

const StarredMessages = ({ isOpen, onClose, onMessageClick }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchStarredMessages()
    }
  }, [isOpen])

  const fetchStarredMessages = async () => {
    try {
      const { data } = await api.get('/messages/starred')
      setMessages(data.messages)
    } catch (error) {
      toast.error('Failed to load starred messages')
    } finally {
      setLoading(false)
    }
  }

  const handleUnstar = async (messageId) => {
    try {
      await api.post(`/messages/${messageId}/unstar`)
      setMessages((prev) => prev.filter((m) => m._id !== messageId))
      toast.success('Message unstarred')
    } catch (error) {
      toast.error('Failed to unstar message')
    }
  }

  const filteredMessages = messages.filter((message) => {
    if (!searchQuery) return true
    return message.content.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Group messages by chat
  const groupedMessages = filteredMessages.reduce((groups, message) => {
    const chatId = message.chat._id || message.chat
    if (!groups[chatId]) {
      groups[chatId] = {
        chat: message.chatInfo,
        messages: [],
      }
    }
    groups[chatId].messages.push(message)
    return groups
  }, {})

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Starred Messages" size="lg">
      <div className="space-y-4">
        {/* Search */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search starred messages..."
        />

        {/* Messages */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <StarIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No starred messages
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Star important messages to find them easily later
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {Object.entries(groupedMessages).map(([chatId, group]) => (
                  <div key={chatId}>
                    {/* Chat Header */}
                    <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={group.chat?.avatar}
                          alt={group.chat?.name}
                          size="xs"
                        />
                        <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                          {group.chat?.name || 'Unknown Chat'}
                        </span>
                      </div>
                    </div>

                    {/* Messages */}
                    {group.messages.map((message) => (
                      <motion.div
                        key={message._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => {
                          onMessageClick?.(message)
                          onClose()
                        }}
                      >
                        <Avatar
                          src={message.sender.avatar}
                          alt={message.sender.name}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-gray-900 dark:text-white">
                              {message.sender.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDistanceToNow(new Date(message.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {message.content}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUnstar(message._id)
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          <StarSolidIcon className="w-5 h-5 text-yellow-500" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default StarredMessages