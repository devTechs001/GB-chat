import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlassIcon, PlusIcon, FunnelIcon } from '@heroicons/react/24/outline'
import useChatStore from '../../store/useChatStore'
import ChatListItem from './ChatListItem'
import Button from '../common/Button'
import clsx from 'clsx'

const ChatList = ({ onChatSelect, className }) => {
  const { chats, searchQuery, setSearchQuery, isLoading } = useChatStore()
  const [filter, setFilter] = useState('all') // all, unread, groups, archived
  const [sortBy, setSortBy] = useState('date') // date, name, unread

  const filteredChats = useMemo(() => {
    let filtered = [...chats]

    // Apply filter
    if (filter === 'unread') {
      filtered = filtered.filter(chat => chat.unreadCount > 0)
    } else if (filter === 'groups') {
      filtered = filtered.filter(chat => chat.isGroup)
    } else if (filter === 'archived') {
      filtered = filtered.filter(chat => chat.isArchived)
    }

    // Separate pinned and unpinned
    const pinned = filtered.filter(chat => chat.isPinned)
    const unpinned = filtered.filter(chat => !chat.isPinned)

    // Sort unpinned
    if (sortBy === 'name') {
      unpinned.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    } else if (sortBy === 'unread') {
      unpinned.sort((a, b) => (b.unreadCount || 0) - (a.unreadCount || 0))
    } else {
      unpinned.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0))
    }

    filtered = [...pinned, ...unpinned]

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof chat.lastMessage?.content === 'string'
          ? chat.lastMessage.content
          : chat.lastMessage?.content?.text
        )?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [chats, filter, searchQuery, sortBy])

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'groups', label: 'Groups' },
    { id: 'archived', label: 'Archived' },
  ]

  const totalUnread = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0)

  return (
    <div className={clsx(
      'flex flex-col h-full bg-white dark:bg-gray-900',
      'w-full md:w-80 lg:w-96',
      'border-r border-gray-200 dark:border-gray-700',
      className
    )}>
      {/* Header with Gradient GB Style */}
      <div className="flex-shrink-0 p-4 space-y-3 border-b border-gray-200 dark:border-gray-700 relative overflow-hidden">
        {/* Decorative gradient blob */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-primary-400/20 to-primary-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 bg-clip-text text-transparent">
              Chats
            </h2>
            {totalUnread > 0 && (
              <span className="px-2 py-0.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold rounded-full shadow-lg shadow-primary-500/30">
                {totalUnread}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 relative z-10">
            {/* Sort dropdown */}
            <div className="relative group">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                <FunnelIcon className="w-4 h-4" />
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 w-32 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button onClick={() => setSortBy('date')} className={clsx('w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700', sortBy === 'date' && 'text-primary-500')}>Date</button>
                <button onClick={() => setSortBy('name')} className={clsx('w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700', sortBy === 'name' && 'text-primary-500')}>Name</button>
                <button onClick={() => setSortBy('unread')} className={clsx('w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700', sortBy === 'unread' && 'text-primary-500')}>Unread</button>
              </div>
            </div>

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
        </div>

        {/* Search Bar with GB Styling */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-10 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 shadow-sm transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <MagnifyingGlassIcon className="w-4 h-4 rotate-45" />
            </button>
          )}
        </div>

        {/* Filter Pills with GB Styling */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 relative z-10">
          <AnimatePresence>
            {filters.map((filterItem, idx) => (
              <motion.button
                key={filterItem.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => setFilter(filterItem.id)}
                className={clsx(
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                  filter === filterItem.id
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-sm'
                )}
              >
                {filterItem.label}
              </motion.button>
            ))}
          </AnimatePresence>
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