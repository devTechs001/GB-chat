import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'
import useChatStore from '../../store/useChatStore'
import ChatListItem from './ChatListItem'
import Button from '../common/Button'
import NewChatModal from './NewChatModal'
import PageHeader from '../layout/PageHeader'
import EmptyState from '../layout/EmptyState'
import clsx from 'clsx'

const ChatList = ({ onChatSelect, className }) => {
  const { chats, searchQuery, setSearchQuery, isLoading } = useChatStore()
  const [filter, setFilter] = useState('all') // all, unread, groups, archived
  const [sortBy, setSortBy] = useState('date') // date, name, unread
  const [showNewChatModal, setShowNewChatModal] = useState(false)

  const filteredChats = useMemo(() => {
    let filtered = [...chats].filter(chat => chat && chat._id) // Filter out undefined/null chats

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
      filtered = filtered.filter(chat => {
        const name = (chat.name || chat.title || '').toLowerCase()
        const lastMessage = typeof chat.lastMessage?.content === 'string'
          ? chat.lastMessage.content
          : chat.lastMessage?.content?.text || ''
        return name.includes(searchQuery.toLowerCase()) ||
          lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      })
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
      'flex flex-col h-full min-h-0 bg-white dark:bg-gray-900',
      'w-full',
      className
    )}>
      <PageHeader
        title="Chats"
        subtitle={`${filteredChats.length} conversation${filteredChats.length === 1 ? '' : 's'}`}
        badge={totalUnread}
        icon={ChatBubbleLeftRightIcon}
        actions={
          <>
            {/* Sort dropdown */}
            <div className="relative group">
              <button
                aria-label="Sort conversations"
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <FunnelIcon className="w-5 h-5" />
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 w-36 opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible transition-all z-50">
                {[
                  { id: 'date', label: 'Newest' },
                  { id: 'name', label: 'Name' },
                  { id: 'unread', label: 'Unread first' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSortBy(option.id)}
                    className={clsx(
                      'w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700',
                      sortBy === option.id && 'text-primary-600 dark:text-primary-400 font-medium'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={<PlusIcon className="w-4 h-4" />}
              aria-label="New chat"
              onClick={() => setShowNewChatModal(true)}
            >
              <span className="hidden sm:inline">New chat</span>
            </Button>
          </>
        }
      >
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            aria-label="Search conversations"
            className="w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-gray-900 text-sm focus:ring-2 focus:ring-primary-500/40 focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {filters.map((filterItem) => (
            <button
              key={filterItem.id}
              onClick={() => setFilter(filterItem.id)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                filter === filterItem.id
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/30'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {filterItem.label}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* Chat List - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {isLoading ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {[0, 1, 2, 3, 4].map((row) => (
              <div key={row} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-3 w-2/3 rounded bg-gray-100 dark:bg-gray-800/70" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <EmptyState
            icon={ChatBubbleLeftRightIcon}
            title={searchQuery ? 'No chats found' : 'No conversations yet'}
            description={
              searchQuery
                ? `Nothing matches “${searchQuery}”. Try a different name or keyword.`
                : 'Start chatting by creating a new conversation.'
            }
            action={
              !searchQuery && (
                <Button variant="primary" size="sm" onClick={() => setShowNewChatModal(true)}>
                  New chat
                </Button>
              )
            }
          />
        ) : (
          <AnimatePresence>
            {filteredChats.map((chat, index) => (
              <motion.div
                key={chat._id || `chat-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.2) }}
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

      {/* New Chat Modal */}
      <NewChatModal isOpen={showNewChatModal} onClose={() => setShowNewChatModal(false)} />
    </div>
  )
}

export default ChatList