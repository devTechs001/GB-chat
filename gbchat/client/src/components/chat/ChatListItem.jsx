import React from 'react'
import { format, isToday, isYesterday } from 'date-fns'
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
} from '@heroicons/react/24/outline'

const ChatListItem = ({ chat, onClick }) => {
  const { activeChat, unreadCounts, onlineUsers, typingUsers } = useChatStore()
  const { user } = useAuthStore()
  const isActive = activeChat?._id === chat._id
  const unreadCount = unreadCounts[chat._id] || 0
  const isOnline = onlineUsers.includes(chat.userId)
  const isTyping = typingUsers[chat._id]?.length > 0

  const formatTime = (date) => {
    const msgDate = new Date(date)
    if (isToday(msgDate)) return format(msgDate, 'HH:mm')
    if (isYesterday(msgDate)) return 'Yesterday'
    return format(msgDate, 'dd/MM/yy')
  }

  const renderMessagePreview = () => {
    if (isTyping) {
      return (
        <span className="text-primary-600 dark:text-primary-400 animate-pulse">
          typing...
        </span>
      )
    }

    if (!chat.lastMessage) {
      return <span className="text-gray-500">Start a conversation</span>
    }

    const { content, type, sender } = chat.lastMessage
    const isMe = sender === user._id

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

    return (
      <span className="flex items-center gap-1">
        {isMe && (
          <span className="flex-shrink-0">
            {chat.lastMessage.status === 'sent' && <CheckIcon className="w-3 h-3" />}
            {chat.lastMessage.status === 'delivered' && (
              <div className="flex -space-x-1">
                <CheckIcon className="w-3 h-3" />
                <CheckIcon className="w-3 h-3" />
              </div>
            )}
            {chat.lastMessage.status === 'read' && (
              <CheckCircleIcon className="w-3 h-3 text-blue-500" />
            )}
          </span>
        )}
        <span className="truncate">
          {getTypeIcon()}
          {type === 'text' ? content : type}
        </span>
      </span>
    )
  }

  return (
    <div
      onClick={onClick}
      className={clsx(
        'flex items-center gap-3 px-3 py-3 md:px-4 md:py-3',
        'hover:bg-gray-50 dark:hover:bg-gray-800',
        'cursor-pointer transition-colors duration-150',
        'border-b border-gray-100 dark:border-gray-800',
        isActive && 'bg-primary-50 dark:bg-primary-900/20',
        'relative'
      )}
    >
      {/* Avatar with online status */}
      <div className="relative flex-shrink-0">
        <Avatar
          src={chat.avatar}
          alt={chat.name}
          size="md"
          status={isOnline ? 'online' : 'offline'}
        />
        {chat.isGroup && (
          <div className="absolute -bottom-1 -right-1 bg-gray-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {chat.memberCount}
          </div>
        )}
      </div>

      {/* Chat Info - Responsive text sizing */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className={clsx(
            'font-medium truncate text-sm md:text-base',
            'text-gray-900 dark:text-white',
            unreadCount > 0 && 'font-semibold'
          )}>
            {chat.name}
          </h3>
          <span className={clsx(
            'text-xs flex-shrink-0',
            unreadCount > 0
              ? 'text-primary-600 dark:text-primary-400 font-medium'
              : 'text-gray-500 dark:text-gray-400'
          )}>
            {chat.lastMessage && formatTime(chat.lastMessage.createdAt)}
          </span>
        </div>
        
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={clsx(
            'text-xs md:text-sm truncate',
            unreadCount > 0
              ? 'text-gray-700 dark:text-gray-300 font-medium'
              : 'text-gray-500 dark:text-gray-400'
          )}>
            {renderMessagePreview()}
          </p>
          {unreadCount > 0 && (
            <span className="flex-shrink-0 bg-primary-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Swipe indicator for mobile */}
      {chat.isPinned && (
        <div className="absolute top-2 right-2 md:static">
          <div className="w-2 h-2 bg-primary-600 rounded-full" />
        </div>
      )}
    </div>
  )
}

export default ChatListItem