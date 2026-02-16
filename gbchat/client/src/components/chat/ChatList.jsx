import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'
import useChatStore from '../../store/useChatStore'
import ChatListItem from './ChatListItem'
import SearchBar from '../common/SearchBar'
import Button from '../common/Button'
import clsx from 'clsx'

const ChatList = ({ onChatSelect, className }) => {
  const { chats, searchQuery, setSearchQuery, isLoading } = useChatStore()
  const [filter, setFilter] = useState('all') // all, unread, groups, archived

  const filteredChats = useMemo(() => {
    let filtered = chats

    // Apply filter
    if (filter === 'unread') {
      filtered = filtered.filter(chat => chat.unreadCount > 0)
    } else if (filter === 'groups') {
      filtered = filtered.filter(chat => chat.isGroup)
    } else if (filter === 'archived') {
      filtered = filtered.filter(chat => chat.isArchived)
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [chats, filter, searchQuery])

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'groups', label: 'Groups' },
    { id: 'archived', label: 'Archived' },
  ]

  return (
    <div className={clsx(
      'flex flex-col h-full bg-white dark:bg-gray-900',
      'w-full md:w-80 lg:w-96',
      'border-r border-gray-200 dark:border-gray-700',
      className
    )}>
      {/* Header - Mobile Optimized */}
      <div className="flex-shrink-0 p-3 md:p-4 space-y-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
            Messages
          </h2>
          <Button
            variant="ghost"
            size="sm"
            icon={<PlusIcon className="w-5 h-5" />}
            className="md:hidden"
            aria-label="New Chat"
          />
          <Button
            variant="primary"
            size="sm"
            icon={<PlusIcon className="w-4 h-4" />}
            className="hidden md:flex"
          >
            New Chat
          </Button>
        </div>

        {/* Search Bar - Full width on mobile */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search conversations..."
          className="w-full"
        />

        {/* Filter Tabs - Horizontally scrollable on mobile */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {filters.map((filterItem) => (
            <button
              key={filterItem.id}
              onClick={() => setFilter(filterItem.id)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap',
                'transition-colors duration-200',
                filter === filterItem.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              )}
            >
              {filterItem.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat List - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 px-4">
            <p className="text-gray-500 dark:text-gray-400 text-center">
              {searchQuery ? 'No chats found' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredChats.map((chat, index) => (
              <motion.div
                key={chat._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <ChatListItem
                  chat={chat}
                  onClick={() => onChatSelect(chat)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

export default ChatList