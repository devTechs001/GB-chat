import React, { useState } from 'react'
import { format } from 'date-fns'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import Avatar from '../common/Avatar'
import MessageStatus from './MessageStatus'
import MessageReactions from './MessageReactions'
import MessageActions from './MessageActions'
import {
  PhotoIcon,
  DocumentIcon,
  PlayCircleIcon,
  MicrophoneIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline'

const ChatBubble = ({
  message,
  isMine,
  onReply,
  onSelect,
  onLongPress,
  isSelected,
  showAvatar = true,
}) => {
  const [showActions, setShowActions] = useState(false)
  const [pressTimer, setPressTimer] = useState(null)

  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      onLongPress && onLongPress()
      // Haptic feedback for mobile
      if (navigator.vibrate) navigator.vibrate(50)
    }, 500)
    setPressTimer(timer)
  }

  const handleMouseUp = () => {
    if (pressTimer) clearTimeout(pressTimer)
  }

  const renderContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="relative">
            <img
              src={message.media[0]?.url}
              alt="Image"
              className="rounded-lg max-w-[200px] md:max-w-[300px] cursor-pointer"
              onClick={() => window.open(message.media[0]?.url, '_blank')}
            />
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        )
      
      case 'video':
        return (
          <div className="relative">
            <video
              src={message.media[0]?.url}
              controls
              className="rounded-lg max-w-[200px] md:max-w-[300px]"
            />
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        )
      
      case 'audio':
        return (
          <div className="flex items-center gap-2">
            <MicrophoneIcon className="w-5 h-5" />
            <audio src={message.media[0]?.url} controls className="max-w-[200px]" />
          </div>
        )
      
      case 'document':
        return (
          <a
            href={message.media[0]?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
          >
            <DocumentIcon className="w-5 h-5" />
            <div>
              <p className="text-sm font-medium truncate max-w-[150px]">
                {message.media[0]?.name}
              </p>
              <p className="text-xs text-gray-500">
                {message.media[0]?.size}
              </p>
            </div>
          </a>
        )
      
      case 'location':
        return (
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-5 h-5" />
            <div>
              <p className="text-sm font-medium">Location</p>
              <p className="text-xs text-gray-500">
                {message.location?.address}
              </p>
            </div>
          </div>
        )
      
      default:
        return (
          <div>
            {message.replyTo && (
              <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg border-l-2 border-primary-500">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {message.replyTo.sender.name}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  {message.replyTo.content}
                </p>
              </div>
            )}
            <p className="whitespace-pre-wrap break-words text-sm md:text-base">
              {message.content}
            </p>
          </div>
        )
    }
  }

  return (
    <div
      className={clsx(
        'flex items-end gap-2 mb-1',
        isMine ? 'justify-end' : 'justify-start'
      )}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      {/* Avatar for received messages */}
      {!isMine && showAvatar && (
        <Avatar
          src={message.sender.avatar}
          alt={message.sender.name}
          size="xs"
          className="mb-1"
        />
      )}

      {/* Message bubble */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={clsx(
          'relative group',
          'max-w-[75%] md:max-w-[60%]'
        )}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div
          className={clsx(
            'px-3 py-2 rounded-2xl',
            isMine
              ? 'bg-primary-600 text-white rounded-br-sm'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm',
            'shadow-sm',
            isSelected && 'ring-2 ring-primary-400'
          )}
        >
          {/* Sender name for group chats */}
          {!isMine && message.chat?.isGroup && (
            <p className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-1">
              {message.sender.name}
            </p>
          )}

          {/* Message content */}
          {renderContent()}

          {/* Time and status */}
          <div className={clsx(
            'flex items-center gap-1 mt-1',
            'text-xs',
            isMine ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
          )}>
            <span>{format(new Date(message.createdAt), 'HH:mm')}</span>
            {isMine && <MessageStatus status={message.status} />}
            {message.isEdited && <span className="italic">(edited)</span>}
          </div>
        </div>

        {/* Message reactions */}
        {message.reactions?.length > 0 && (
          <MessageReactions
            reactions={message.reactions}
            messageId={message._id}
            className="absolute -bottom-3 left-0"
          />
        )}

        {/* Message actions - Hidden on mobile, visible on hover for desktop */}
        {showActions && (
          <MessageActions
            message={message}
            isMine={isMine}
            onReply={onReply}
            className="absolute top-0 right-0 md:block hidden"
          />
        )}
      </motion.div>
    </div>
  )
}

export default ChatBubble