import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  PhotoIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  DocumentIcon,
  BellSlashIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  StarIcon,
  UsersIcon,
  EyeIcon,
  BellIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import Avatar from '../common/Avatar'
import clsx from 'clsx'

const EnhancedChatList = ({ chats = [], onChatSelect, className, onCustomFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [viewMode, setViewMode] = useState('comfortable')
  const [sortBy, setSortBy] = useState('date')
  const [showFilters, setShowFilters] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [customFilters, setCustomFilters] = useState([])
  const [showFilterManager, setShowFilterManager] = useState(false)
  const [newFilterName, setNewFilterName] = useState('')
  const [editingFilter, setEditingFilter] = useState(null)
  const [chatListStyle, setChatListStyle] = useState('default') // default, rounded, minimal, card

  // GB WhatsApp predefined filters
  const gbFilters = [
    { id: 'all', label: 'All', icon: ChatBubbleLeftIcon },
    { id: 'unread', label: 'Unread', icon: EyeIcon },
    { id: 'pinned', label: 'Pinned', icon: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg> },
    { id: 'groups', label: 'Groups', icon: UsersIcon },
    { id: 'muted', label: 'Muted', icon: BellSlashIcon },
    { id: 'starred', label: 'Starred', icon: StarIcon },
  ]

  // Merge custom filters with predefined
  const allFilters = useMemo(() => {
    const custom = customFilters.map(f => ({
      id: `custom_${f.id}`,
      label: f.name,
      icon: ChatBubbleLeftIcon,
      isCustom: true,
      color: f.color,
    }))
    return [...gbFilters, ...custom]
  }, [customFilters])

  const filteredChats = useMemo(() => {
    let result = [...chats]

    // Apply filter
    if (filter.startsWith('custom_')) {
      const customFilter = customFilters.find(f => `custom_${f.id}` === filter)
      if (customFilter) {
        result = result.filter(c => customFilter.chatIds?.includes(c._id))
      }
    } else {
      if (filter === 'unread') result = result.filter(c => c.unreadCount > 0)
      else if (filter === 'pinned') result = result.filter(c => c.isPinned)
      else if (filter === 'groups') result = result.filter(c => c.isGroup)
      else if (filter === 'muted') result = result.filter(c => c.isMuted)
      else if (filter === 'starred') result = result.filter(c => c.isStarred)
    }

    // Apply search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        (typeof c.lastMessage?.content === 'string'
          ? c.lastMessage.content
          : c.lastMessage?.content?.text
        )?.toLowerCase()?.includes(q)
      )
    }

    // Separate pinned and unpinned
    const pinned = result.filter(c => c.isPinned)
    const unpinned = result.filter(c => !c.isPinned)

    // Sort
    if (sortBy === 'name') {
      unpinned.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    } else if (sortBy === 'unread') {
      unpinned.sort((a, b) => (b.unreadCount || 0) - (a.unreadCount || 0))
    } else {
      unpinned.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0))
    }

    return [...pinned, ...unpinned]
  }, [chats, filter, searchQuery, sortBy, customFilters])

  const formatTime = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const now = new Date()
    const diff = now - d
    if (diff < 86400000 && d.getDate() === now.getDate()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    if (diff < 172800000) return 'Yesterday'
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const getMessagePreview = (msg) => {
    if (!msg) return 'No messages yet'
    if (msg.type === 'image') return <span className="flex items-center gap-1"><PhotoIcon className="w-3.5 h-3.5" /> Photo</span>
    if (msg.type === 'video') return <span className="flex items-center gap-1"><VideoCameraIcon className="w-3.5 h-3.5" /> Video</span>
    if (msg.type === 'audio' || msg.type === 'voice') return <span className="flex items-center gap-1"><MicrophoneIcon className="w-3.5 h-3.5" /> Voice</span>
    if (msg.type === 'document') return <span className="flex items-center gap-1"><DocumentIcon className="w-3.5 h-3.5" /> Document</span>
    return typeof msg.content === 'string' ? msg.content : msg.content?.text || 'Message'
  }

  const totalUnread = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0)

  // View mode configurations
  const viewModeConfig = {
    compact: { padding: 'py-2 px-3', avatarSize: 'sm', gap: 'gap-2', textSizes: { name: 'text-sm', preview: 'text-xs' } },
    comfortable: { padding: 'py-3 px-4', avatarSize: 'md', gap: 'gap-3', textSizes: { name: 'text-base', preview: 'text-sm' } },
    spacious: { padding: 'py-4 px-5', avatarSize: 'lg', gap: 'gap-4', textSizes: { name: 'text-lg', preview: 'text-base' } },
  }

  // Chat list style configurations
  const chatListStyles = {
    default: {
      container: 'bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800',
      item: 'hover:bg-gradient-to-r hover:from-primary-50 hover:to-transparent dark:hover:from-primary-900/20 dark:hover:to-transparent border-b border-gray-100 dark:border-gray-800',
      pinned: 'bg-primary-50/50 dark:bg-primary-900/10',
    },
    rounded: {
      container: 'bg-gray-50 dark:bg-gray-900',
      item: 'mx-2 my-1 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:shadow-md transition-all',
      pinned: 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-200 dark:ring-primary-800',
    },
    minimal: {
      container: 'bg-white dark:bg-gray-950',
      item: 'px-4 hover:bg-gray-50 dark:hover:bg-gray-900 border-b border-gray-50 dark:border-gray-900',
      pinned: 'bg-gray-50 dark:bg-gray-900',
    },
    card: {
      container: 'bg-gray-100 dark:bg-gray-950',
      item: 'm-2 p-3 rounded-lg bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all',
      pinned: 'ring-2 ring-primary-500 dark:ring-primary-400',
    },
  }

  const currentStyle = chatListStyles[chatListStyle]
  const currentViewMode = viewModeConfig[viewMode]

  // Filter management
  const handleCreateFilter = () => {
    if (!newFilterName.trim()) return
    const newFilter = {
      id: Date.now().toString(),
      name: newFilterName,
      chatIds: [],
      color: '#3B82F6',
    }
    setCustomFilters([...customFilters, newFilter])
    setNewFilterName('')
    setShowFilterManager(false)
  }

  const handleDeleteFilter = (filterId) => {
    setCustomFilters(customFilters.filter(f => f.id !== filterId))
    if (filter === `custom_${filterId}`) {
      setFilter('all')
    }
  }

  const handleFilterClick = (filterId) => {
    setFilter(filterId)
    if (onCustomFilterChange && filterId.startsWith('custom_')) {
      const customFilter = customFilters.find(f => `custom_${f.id}` === filterId)
      if (customFilter) {
        onCustomFilterChange(customFilter)
      }
    }
  }

  return (
    <div className={clsx(
      'w-full md:w-80 lg:w-96 h-full flex flex-col relative',
      currentStyle.container,
      'border-r border-gray-200 dark:border-gray-700',
      'transition-all duration-300',
      className
    )}>
      {/* GB WhatsApp Header with Gradient */}
      <div className="p-4 space-y-3 relative overflow-hidden">
        {/* Decorative gradient blob */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-primary-400/20 to-primary-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 bg-clip-text text-transparent">
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
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 w-36 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button onClick={() => setSortBy('date')} className={clsx('w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700', sortBy === 'date' && 'text-primary-500')}>Date</button>
                <button onClick={() => setSortBy('name')} className={clsx('w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700', sortBy === 'name' && 'text-primary-500')}>Name</button>
                <button onClick={() => setSortBy('unread')} className={clsx('w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700', sortBy === 'unread' && 'text-primary-500')}>Unread</button>
              </div>
            </div>

            {/* View mode toggle */}
            <button onClick={() => setViewMode(v => v === 'compact' ? 'comfortable' : v === 'comfortable' ? 'spacious' : 'compact')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
              title={`View: ${viewMode}`}>
              {viewMode === 'compact' ? <ListBulletIcon className="w-4 h-4" /> : viewMode === 'comfortable' ? <Squares2X2Icon className="w-4 h-4" /> : <Squares2X2Icon className="w-5 h-5" />}
            </button>

            {/* Style toggle */}
            <button onClick={() => setChatListStyle(s => s === 'default' ? 'rounded' : s === 'rounded' ? 'card' : s === 'card' ? 'minimal' : 'default')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
              title={`Style: ${chatListStyle}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12.5M7 21h12.5a2 2 0 002-2V5a2 2 0 00-2-2h-4" />
              </svg>
            </button>

            {/* Settings button */}
            <button onClick={() => setShowSettings(!showSettings)}
              className={clsx('p-2 rounded-lg transition-colors', showSettings ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500')}>
              <Cog6ToothIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar with GB Styling */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 shadow-sm transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills with GB Styling */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 relative z-10">
          <AnimatePresence>
            {allFilters.slice(0, showFilters ? allFilters.length : 5).map((f, idx) => (
              <motion.button
                key={f.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => handleFilterClick(f.id)}
                className={clsx(
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5',
                  filter === f.id
                    ? f.isCustom
                      ? 'text-white shadow-lg'
                      : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-sm'
                )}
                style={f.isCustom && filter === f.id ? { backgroundColor: f.color, backgroundImage: `linear-gradient(135deg, ${f.color}, ${f.color}dd)` } : {}}
              >
                {f.icon && <f.icon className="w-3 h-3" />}
                {f.label}
              </motion.button>
            ))}
          </AnimatePresence>

          {/* Show more/less button */}
          {allFilters.length > 5 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-2 py-1.5 rounded-full text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1"
            >
              {showFilters ? <XMarkIcon className="w-3 h-3" /> : <PlusIcon className="w-3 h-3" />}
            </button>
          )}

          {/* Manage filters button */}
          <button
            onClick={() => setShowFilterManager(true)}
            className="px-2 py-1.5 rounded-full text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Manage Filters"
          >
            <PencilIcon className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-3 border-b border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* View Mode */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <ListBulletIcon className="w-3 h-3" /> View Mode
                </label>
                <div className="flex gap-1">
                  {['compact', 'comfortable', 'spacious'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={clsx(
                        'flex-1 py-1.5 text-xs font-medium rounded-lg transition-all capitalize',
                        viewMode === mode
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* List Style */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12.5M7 21h12.5a2 2 0 002-2V5a2 2 0 00-2-2h-4" />
                  </svg> List Style
                </label>
                <div className="flex gap-1">
                  {['default', 'rounded', 'minimal', 'card'].map(style => (
                    <button
                      key={style}
                      onClick={() => setChatListStyle(style)}
                      className={clsx(
                        'flex-1 py-1.5 text-xs font-medium rounded-lg transition-all capitalize',
                        chatListStyle === style
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      )}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <FunnelIcon className="w-3 h-3" /> Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full py-1.5 px-2 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg border-0 focus:ring-2 focus:ring-primary-500 text-gray-700 dark:text-gray-300"
                >
                  <option value="date">Date</option>
                  <option value="name">Name</option>
                  <option value="unread">Unread</option>
                </select>
              </div>

              {/* Quick Stats Toggle */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <EyeIcon className="w-3 h-3" /> Display
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-500 focus:ring-primary-500" defaultChecked />
                    Online
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <ChatBubbleLeftIcon className="w-12 h-12 mb-3 opacity-30" />
            </motion.div>
            <p className="text-sm font-medium">{searchQuery ? 'No chats found' : 'No conversations yet'}</p>
            <p className="text-xs mt-1 text-gray-500">Start a new conversation</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredChats.map((chat, i) => (
              <motion.div
                key={chat._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onChatSelect?.(chat)}
                className={clsx(
                  'flex items-center gap-3 cursor-pointer transition-all relative overflow-hidden',
                  currentViewMode.padding,
                  currentViewMode.gap,
                  currentStyle.item,
                  chat.isPinned && currentStyle.pinned,
                  chat.isStarred && 'bg-yellow-50/30 dark:bg-yellow-900/10'
                )}
              >
                {/* Pinned indicator */}
                {chat.isPinned && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-primary-600" />
                )}

                {/* Avatar with GB styling */}
                <div className="relative flex-shrink-0">
                  <Avatar
                    src={chat.avatar}
                    alt={chat.name}
                    size={currentViewMode.avatarSize}
                    status={chat.isOnline ? 'online' : 'offline'}
                    className="transition-transform hover:scale-105"
                  />
                  {chat.isGroup && (
                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-lg">
                      <UsersIcon className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className={clsx(
                        'font-semibold text-gray-900 dark:text-white truncate',
                        currentViewMode.textSizes.name,
                        chat.isPinned && 'text-primary-600 dark:text-primary-400',
                        chat.isStarred && 'flex items-center gap-1'
                      )}>
                        {chat.name}
                        {chat.isStarred && <StarIconSolid className="w-3.5 h-3.5 text-yellow-500" />}
                      </h3>
                    </div>
                    <span className={clsx(
                      'text-xs flex-shrink-0 font-medium',
                      chat.unreadCount > 0 ? 'text-primary-500' : 'text-gray-400'
                    )}>
                      {formatTime(chat.lastMessageAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-0.5">
                    <p className={clsx(
                      'text-gray-500 dark:text-gray-400 truncate pr-2 flex items-center gap-1',
                      currentViewMode.textSizes.preview
                    )}>
                      {getMessagePreview(chat.lastMessage)}
                    </p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {chat.isMuted && (
                        <BellSlashIcon className="w-3.5 h-3.5 text-gray-400" title="Muted" />
                      )}
                      {chat.unreadCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={clsx(
                            'inline-flex items-center justify-center min-w-[20px] h-5 text-xs font-bold text-white rounded-full px-1.5 shadow-lg',
                            chat.unreadCount > 99
                              ? 'bg-gradient-to-r from-red-500 to-red-600'
                              : 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-primary-500/30'
                          )}
                        >
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </motion.span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer Stats with GB Styling */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 dark:text-gray-400">
              <span className="font-bold text-gray-700 dark:text-gray-300">{chats.length}</span> chats
            </span>
            {totalUnread > 0 && (
              <span className="flex items-center gap-1 text-primary-500">
                <EyeIcon className="w-3 h-3" />
                <span className="font-bold">{totalUnread}</span> unread
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">{filteredChats.length} shown</span>
          </div>
        </div>
      </div>

      {/* Filter Manager Modal */}
      <AnimatePresence>
        {showFilterManager && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowFilterManager(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-primary-500 to-primary-600">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FunnelIcon className="w-5 h-5" />
                  Manage Filters
                </h3>
                <button onClick={() => setShowFilterManager(false)} className="text-white/80 hover:text-white">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {/* Create new filter */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFilterName}
                    onChange={(e) => setNewFilterName(e.target.value)}
                    placeholder="Filter name..."
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border-0 text-sm focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateFilter()}
                  />
                  <button
                    onClick={handleCreateFilter}
                    className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                  >
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Filter list */}
                {customFilters.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Custom Filters</p>
                    {customFilters.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: f.color }}
                          />
                          <span className="font-medium text-gray-900 dark:text-white text-sm">{f.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {f.chatIds?.length || 0} chats
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteFilter(f.id)}
                          className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <FunnelIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No custom filters yet</p>
                    <p className="text-xs mt-1">Create your first filter above</p>
                  </div>
                )}

                {/* Predefined filters info */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Built-in Filters</p>
                  <div className="flex flex-wrap gap-2">
                    {gbFilters.map((f) => (
                      <span
                        key={f.id}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1"
                      >
                        <f.icon className="w-3 h-3" />
                        {f.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EnhancedChatList

