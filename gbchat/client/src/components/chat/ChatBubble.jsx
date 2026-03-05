import React, { useState } from 'react'
import { format } from 'date-fns'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import Avatar from '../common/Avatar'
import MessageStatus from './MessageStatus'
import MessageReactions from './MessageReactions'
import MessageActions from './MessageActions'
import useThemeStore from '../../store/useThemeStore'
import useGBFeaturesStore from '../../store/useGBFeaturesStore'
import useAuthStore from '../../store/useAuthStore'
import {
  PhotoIcon,
  DocumentIcon,
  PlayCircleIcon,
  MicrophoneIcon,
  MapPinIcon,
  SignalIcon,
  WifiIcon,
} from '@heroicons/react/24/outline'

// Animation variants for messages
const messageAnimations = {
  slide: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  pop: {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
  },
  none: {
    initial: {},
    animate: {},
  },
}

// Bubble border radius styles
const bubbleRadii = {
  modern: 'rounded-2xl',
  classic: 'rounded-lg',
  minimal: 'rounded-md',
  rounded: 'rounded-3xl',
}

const ChatBubble = ({
  message,
  isMine,
  onReply,
  onSelect,
  onLongPress,
  isSelected,
  showAvatar = true,
  onSchedule,
}) => {
  const [showActions, setShowActions] = useState(false)
  const [pressTimer, setPressTimer] = useState(null)
  const { bubbleStyle, messageAnimation } = useThemeStore()
  const { gbFeatures } = useGBFeaturesStore()
  const { user } = useAuthStore()

  const animVariant = messageAnimations[messageAnimation] || messageAnimations.slide
  const bubbleRadius = bubbleRadii[bubbleStyle] || bubbleRadii.modern

  // GB Features settings
  const hideSecondTick = gbFeatures?.privacy?.hideSecondTick || false
  const hideBlueTicks = gbFeatures?.privacy?.hideBlueTicks || false
  const showNetworkIndicator = gbFeatures?.display?.showNetworkIndicator || false
  const exactTimestamps = gbFeatures?.advanced?.exactTimestamps || false

  // Simulate network strength (in real app, this would come from navigator.connection)
  const [networkStrength] = useState(() => {
    if (typeof navigator !== 'undefined' && navigator.connection) {
      const downlink = navigator.connection.downlink
      if (downlink >= 10) return 4
      if (downlink >= 5) return 3
      if (downlink >= 1) return 2
      return 1
    }
    return 4 // Default to full strength
  })

  // Safely get sender info
  const senderName = message.sender?.fullName || message.sender?.name || 'User'
  const senderAvatar = message.sender?.avatar || ''

  // Debug: Log message status on first render
  if (!window.loggedStatus) {
    console.log('[ChatBubble] Message status debug:', {
      status: message.status,
      isMine,
      hasStatus: !!message.status,
      message: message
    })
    window.loggedStatus = true
  }

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
    // Handle content that might be an object {text: "..."} or string
    const contentText = typeof message.content === 'object' && message.content !== null
      ? message.content.text || JSON.stringify(message.content)
      : message.content || '';

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
            {contentText && (
              <p className="mt-2 text-sm">{contentText}</p>
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
            {contentText && (
              <p className="mt-2 text-sm">{contentText}</p>
            )}
          </div>
        )

      case 'audio':
        return (
          <div className="min-w-[280px] max-w-[320px]">
            <div className="flex items-center gap-3 bg-gradient-to-r from-green-500/10 to-transparent dark:from-green-500/20 rounded-2xl p-3 pr-4">
              <button className="flex-shrink-0 w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors shadow-md">
                <MicrophoneIcon className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <audio
                  src={message.media[0]?.url}
                  controls
                  className="w-full h-8 [&::-webkit-media-controls-panel]:bg-green-500 [&::-webkit-media-controls-current-time-display]:text-gray-700 [&::-webkit-media-controls-time-remaining-display]:text-gray-700"
                  style={{
                    '--media-control-background': '#22c55e',
                    '--media-control-foreground': 'white',
                  }}
                />
                {message.duration && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {Math.floor(message.duration / 60)}:{String(message.duration % 60).padStart(2, '0')}
                  </p>
                )}
              </div>
            </div>
            {contentText && (
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{contentText}</p>
            )}
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
            {/* Reply Box with Enhanced Sender Info */}
            {message.replyTo && (
              <div className="mb-2 p-2 bg-black/10 dark:bg-white/10 rounded-lg border-l-2 border-primary-500">
                <div className="flex items-center gap-1.5 mb-1">
                  {/* Small avatar for reply sender */}
                  {message.replyTo.sender && (
                    <Avatar
                      src={message.replyTo.sender.avatar || message.replyTo.sender?.avatar}
                      alt={message.replyTo.sender?.fullName || message.replyTo.sender?.name || 'User'}
                      size="xs"
                      className="w-4 h-4 flex-shrink-0"
                    />
                  )}
                  <p className="text-xs font-medium text-primary-600 dark:text-primary-400 truncate">
                    {message.replyTo.sender?.fullName || message.replyTo.sender?.name || message.replyTo.sender || 'Unknown'}
                  </p>
                  {/* Badge if replying to own message */}
                  {message.replyTo.sender?._id === user?._id && (
                    <span className="text-[9px] px-1 py-0.5 bg-primary-500/20 text-primary-300 rounded-full font-medium">
                      You
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  {typeof message.replyTo.content === 'object' && message.replyTo.content !== null
                    ? message.replyTo.content.text || JSON.stringify(message.replyTo.content)
                    : message.replyTo.content || `📎 ${message.replyTo.type || 'Media'} message`}
                </p>
              </div>
            )}
            <p className="whitespace-pre-wrap break-words text-sm md:text-base">
              {contentText}
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
          src={senderAvatar}
          alt={senderName}
          size="xs"
          className="mb-1"
        />
      )}

      {/* Message bubble */}
      <motion.div
        initial={animVariant.initial}
        animate={animVariant.animate}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={clsx(
          'relative group',
          'max-w-[75%] md:max-w-[60%]'
        )}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div
          className={clsx(
            'px-3 py-2',
            bubbleRadius,
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
              {senderName}
            </p>
          )}

          {/* Message content */}
          {renderContent()}

          {/* Time and Status with GB Features */}
          <div className={clsx(
            'flex items-center gap-1.5 mt-1',
            'text-xs',
            isMine ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
          )}>
            <span>
              {exactTimestamps
                ? format(new Date(message.createdAt), 'HH:mm:ss')
                : format(new Date(message.createdAt), 'HH:mm')
              }
            </span>
            {isMine && (
              <MessageStatus
                status={message.status || 'sent'}
                showNetwork={showNetworkIndicator}
                networkStrength={networkStrength}
                hideSecondTick={hideSecondTick}
                hideBlueTicks={hideBlueTicks}
                exactTimestamp={exactTimestamps}
              />
            )}
            {message.isEdited && <span className="italic text-[10px]">(edited)</span>}
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
            chatId={message.chat?._id}
            onSchedule={onSchedule}
            className="absolute top-0 right-0 md:block hidden"
          />
        )}
      </motion.div>
    </div>
  )
}

export default ChatBubble