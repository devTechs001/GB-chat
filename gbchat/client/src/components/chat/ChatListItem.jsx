import React from 'react'
import { format, isToday, isYesterday, subDays } from 'date-fns'
import clsx from 'clsx'
import Avatar from '../common/Avatar'
import useChatStore from '../../store/useChatStore'
import useAuthStore from '../../store/useAuthStore'
import {
  CheckIcon,
  CheckCircleIcon,
  VideoCameraIcon,
  PhoneIcon,
  PhotoIcon,
  DocumentIcon,
  MicrophoneIcon,
  ClockIcon,
  LockClosedIcon,
  BellSlashIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

const ChatListItem = ({ chat, onClick }) => {
  const { activeChat, unreadCounts, onlineUsers, typingUsers } = useChatStore()
  const { user } = useAuthStore()
  const isActive = activeChat?._id === chat._id
  const unreadCount = unreadCounts[chat._id] || 0
  const isOnline = onlineUsers.includes(chat.userId)
  const isTyping = typingUsers[chat._id]?.length > 0

  // Format time with seconds for today, otherwise show days ago
  const formatMessageTime = (date) => {
    if (!date) return ''
    const msgDate = new Date(date)
    const now = new Date()

    if (isToday(msgDate)) {
      // Show HH:MM:SS for today
      return format(msgDate, 'HH:mm:ss')
    } else if (isYesterday(msgDate)) {
      return 'Yesterday'
    } else if (subDays(now, 7) < msgDate) {
      // Within last 7 days: show day name
      return format(msgDate, 'EEEE')
    } else {
      // Older: show date
      return format(msgDate, 'dd/MM/yy')
    }
  }

  // Format last seen time
  const formatLastSeen = (lastSeenAt) => {
    if (!lastSeenAt) return ''
    const lastSeen = new Date(lastSeenAt)
    const now = new Date()
    const diffMs = now - lastSeen
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return format(lastSeen, 'dd/MM')
  }

  const renderMessagePreview = () => {
    if (isTyping) {
      return (
        <span className="text-primary-600 dark:text-primary-400 animate-pulse flex items-center gap-1">
          <ClockIcon className="w-3.5 h-3.5" />
          typing...
        </span>
      )
    }

    if (!chat.lastMessage) {
      return <span className="text-gray-500">Start a conversation</span>
    }

    const { content, type, sender, status } = chat.lastMessage
    // Handle sender as object or string ID
    const senderId = sender?._id || sender
    const currentUserId = user?._id || user?.id
    const isMe = senderId === currentUserId

    // Icon for different message types
    const getTypeIcon = () => {
      switch (type) {
        case 'image':
          return <PhotoIcon className="w-4 h-4 inline mr-1" />
        case 'video':
          return <VideoCameraIcon className="w-4 h-4 inline mr-1" />
        case 'audio':
          return <MicrophoneIcon className="w-4 h-4 inline mr-1" />
        case 'document':
          return <DocumentIcon className="w-4 h-4 inline mr-1" />
        case 'voice':
          return <MicrophoneIcon className="w-4 h-4 inline mr-1" />
        default:
          return null
      }
    }

    // Render status ticks
    const renderStatus = () => {
      if (!isMe) return null

      switch (status) {
        case 'sending':
          return <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin ml-1" />
        case 'sent':
          return <CheckIcon key="sent" className="w-3.5 h-3.5 ml-1 text-gray-400" />
        case 'delivered':
          return (
            <div key="delivered" className="flex -space-x-1 ml-1">
              <CheckIcon className="w-3.5 h-3.5 text-gray-400" />
              <CheckIcon className="w-3.5 h-3.5 text-gray-400" />
            </div>
          )
        case 'read':
          return <CheckCircleIcon key="read" className="w-3.5 h-3.5 ml-1 text-blue-500" />
        default:
          return null
      }
    }

    return (
      <span className="flex items-center gap-1">
        {getTypeIcon()}
        <span className="truncate">
          {type === 'text'
            ? (typeof content === 'string' ? content : content?.text || 'Message')
            : type}
        </span>
        {renderStatus()}
      </span>
    )
  }

  return (
    <div
      onClick={onClick}
      className={clsx(
        'flex items-center gap-3 px-4 py-3',
        'hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-transparent',
        'dark:hover:from-primary-900/20 dark:hover:to-transparent',
        'cursor-pointer transition-all duration-200',
        'border-b border-gray-50 dark:border-gray-800/50',
        isActive && 'bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20',
        'relative overflow-hidden group',
        'hover:shadow-sm'
      )}
    >
      {/* Pinned indicator bar */}
      {chat.isPinned && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-primary-600" />
      )}

      {/* Avatar with online status */}
      <div className="relative flex-shrink-0">
        <Avatar
          src={chat.avatar}
          alt={chat.name}
          size="md"
          status={isOnline ? 'online' : 'offline'}
          className="transition-transform group-hover:scale-105"
        />
        {chat.isGroup && (
          <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-lg">
            {chat.memberCount}
          </div>
        )}
      </div>

      {/* Chat Info - Main content */}
      <div className="flex-1 min-w-0">
        {/* Top row: Name + Timestamp */}
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h3 className={clsx(
              'font-semibold truncate text-sm md:text-base',
              'text-gray-900 dark:text-white',
              chat.isPinned && 'text-primary-600 dark:text-primary-400',
              chat.isStarred && 'flex items-center gap-1'
            )}>
              {chat.name}
              {chat.isStarred && <StarIconSolid className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />}
            </h3>

            {/* Lock indicator - styled */}
            {chat.isLocked && (
              <div className="flex-shrink-0" title="Locked chat">
                <LockClosedIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 hover:text-primary-500 transition-colors" />
              </div>
            )}
          </div>

          {/* Timestamp on far right */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={clsx(
              'text-[10px] md:text-xs flex-shrink-0 font-medium',
              unreadCount > 0
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-400 dark:text-gray-500'
            )}>
              {chat.lastMessage && formatMessageTime(chat.lastMessage.createdAt)}
            </span>
          </div>
        </div>

        {/* Bottom row: Message preview + Unread count + Icons */}
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={clsx(
            'text-xs md:text-sm truncate flex-1 pr-2',
            'text-gray-500 dark:text-gray-400',
            unreadCount > 0 && 'font-medium text-gray-700 dark:text-gray-300'
          )}>
            {renderMessagePreview()}
          </p>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Muted indicator */}
            {chat.isMuted && (
              <BellSlashIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" title="Muted" />
            )}

            {/* Unread badge with gradient */}
            {unreadCount > 0 && (
              <span className={clsx(
                'inline-flex items-center justify-center min-w-[20px] h-5 text-xs font-bold text-white rounded-full px-1.5 shadow-lg',
                'bg-gradient-to-r from-primary-500 to-primary-600',
                'shadow-primary-500/30',
                unreadCount > 99 && 'from-red-500 to-red-600 shadow-red-500/30'
              )}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Online/Last seen indicator - Desktop only */}
      {!chat.isGroup && (
        <div className="hidden md:flex flex-col items-end gap-1 text-[10px] flex-shrink-0">
          {isOnline ? (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Online
            </span>
          ) : chat.lastSeen ? (
            <span className="text-gray-400 dark:text-gray-500" title={`Last seen: ${new Date(chat.lastSeen).toLocaleString()}`}>
              {formatLastSeen(chat.lastSeen)}
            </span>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default ChatListItem