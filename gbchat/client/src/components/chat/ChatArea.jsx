import React, { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useOutletContext } from 'react-router-dom'
import ChatHeader from './ChatHeader'
import ChatBubble from './ChatBubble'
import ChatInput from './ChatInput'
import TypingIndicator from './TypingIndicator'
import ScheduledMessages from './ScheduledMessages'
import useChatStore from '../../store/useChatStore'
import useAuthStore from '../../store/useAuthStore'
import useThemeStore from '../../store/useThemeStore'
import clsx from 'clsx'
import { shallow } from 'zustand/shallow'

const ChatArea = ({ onInfoClick, onBack }) => {
  const { toggleSidePanel } = useOutletContext()

  // Use selector for better reactivity - get user from persisted state
  const {
    activeChat,
    messages,
    typingUsers,
    sendMessage: sendMsg
  } = useChatStore((state) => ({
    activeChat: state.activeChat,
    messages: state.messages,
    typingUsers: state.typingUsers,
    sendMessage: state.sendMessage,
  }), shallow)

  // Get user with proper fallback to persisted data
  const authStore = useAuthStore()
  const user = authStore.user

  // Fallback: Get user from localStorage if store is not ready
  const userId = user?._id || user?.id || (() => {
    try {
      const authData = localStorage.getItem('auth-storage')
      if (authData) {
        const parsed = JSON.parse(authData)
        return parsed.state?.user?._id || parsed.state?.user?.id
      }
    } catch (e) {
      console.error('Failed to parse auth from localStorage:', e)
    }
    return null
  })()

  // Debug: Log user loading
  useEffect(() => {
    console.log('[Auth] User in ChatArea:', user)
    console.log('[Auth] User ID (with fallback):', userId)
    console.log('[Auth] Full auth store:', authStore)
  }, [user, userId, authStore])

  const { chatWallpaper, chatEffect } = useThemeStore()
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const [replyTo, setReplyTo] = useState(null)
  const [selectedMessages, setSelectedMessages] = useState([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Simulate message status updates for testing
  useEffect(() => {
    if (!messages || messages.length === 0) return

    // Find your messages that need status updates
    const currentUserId = user?._id || user?.id
    messages.forEach((msg, idx) => {
      const senderId = msg.sender?._id || msg.sender?.id
      const isMine = senderId === currentUserId

      if (isMine && msg.status === 'sent') {
        // Simulate delivered after 1 second
        setTimeout(() => {
          console.log('[Auto] Marking message as delivered:', msg._id)
        }, 1000)
      }
    })
  }, [messages, user])

  const handleSendMessage = async (content, attachments) => {
    if (!activeChat) return
    try {
      const sentMessage = await sendMsg(activeChat._id, content, attachments, replyTo)
      console.log('[ChatArea] Message sent successfully:', sentMessage)
      console.log('[ChatArea] Messages count after send:', messages?.length)
      // Scroll to bottom after message is sent
      setTimeout(() => scrollToBottom(), 100)
      setReplyTo(null)
    } catch (error) {
      console.error('[ChatArea] Failed to send message:', error)
    }
  }

  const handleSelectMessage = (messageId) => {
    if (!isSelectionMode) return
    
    setSelectedMessages(prev => 
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    )
  }

  const handleLongPress = (messageId) => {
    setIsSelectionMode(true)
    setSelectedMessages([messageId])
  }

  // Group messages by date
  const groupedMessages = (messages || [])
    .filter(message => message && message.createdAt && message._id) // Filter out undefined messages and those without createdAt or _id
    .reduce((groups, message) => {
      const date = new Date(message.createdAt).toDateString()
      if (!groups[date]) groups[date] = []
      groups[date].push(message)
      return groups
    }, {})

  // Debug logging
  useEffect(() => {
    console.log('=== ChatArea Debug ===')
    console.log('Messages count:', messages?.length)
    console.log('Current user:', user)
    console.log('User ID:', user?._id || user?.id)
    console.log('Active chat:', activeChat?._id)
    if (messages?.length > 0) {
      const lastMsg = messages[messages.length - 1]
      console.log('Last message:', {
        id: lastMsg._id,
        sender: lastMsg.sender,
        senderId: lastMsg.sender?._id,
        content: lastMsg.content,
        status: lastMsg.status
      })
    }
    console.log('===================')
  }, [messages, user, activeChat])

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="text-center px-4">
          <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 md:w-12 md:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg md:text-xl font-medium text-gray-900 dark:text-white mb-2">
            Welcome to GBChat
          </h3>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-dark-bg">
      {/* Chat Header - Fixed on mobile */}
      <ChatHeader
        chat={activeChat}
        onInfoClick={onInfoClick || toggleSidePanel}
        onBack={onBack}
        selectedCount={selectedMessages.length}
        onClearSelection={() => {
          setSelectedMessages([])
          setIsSelectionMode(false)
        }}
      />

      {/* Messages Area - Scrollable with mobile optimizations */}
      <div
        ref={chatContainerRef}
        className={clsx(
          'flex-1 overflow-y-auto px-3 md:px-4 py-4 relative',
          'scrollbar-thin scrollbar-thumb-gray-400'
        )}
        style={{
          backgroundImage: chatWallpaper ? `url('${chatWallpaper}')` : `url('/chat-bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Chat Effect Overlay */}
        {chatEffect && chatEffect !== 'none' && (
          <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden opacity-30">
            {chatEffect === 'particles' && (
              <div className="absolute inset-0">
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-primary-400 rounded-full"
                    initial={{ x: Math.random() * 100 + '%', y: '100%', opacity: 0 }}
                    animate={{ y: '-10%', opacity: [0, 1, 0] }}
                    transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5 }}
                  />
                ))}
              </div>
            )}
            {chatEffect === 'snow' && (
              <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full"
                    initial={{ x: Math.random() * 100 + '%', y: '-5%' }}
                    animate={{ y: '105%', x: `${Math.random() * 100}%` }}
                    transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 5 }}
                  />
                ))}
              </div>
            )}
            {chatEffect === 'hearts' && (
              <div className="absolute inset-0">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-lg"
                    initial={{ x: Math.random() * 100 + '%', y: '100%', opacity: 0 }}
                    animate={{ y: '-10%', opacity: [0, 0.8, 0] }}
                    transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 6 }}
                  >
                    💕
                  </motion.div>
                ))}
              </div>
            )}
            {chatEffect === 'stars' && (
              <div className="absolute inset-0">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-sm"
                    style={{ left: Math.random() * 100 + '%', top: Math.random() * 100 + '%' }}
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                    transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 4 }}
                  >
                    ⭐
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
        <AnimatePresence>
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              {/* Date Divider */}
              <div className="flex items-center justify-center my-4">
                <span className="px-3 py-1 text-xs md:text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-full text-gray-600 dark:text-gray-400">
                  {date === new Date().toDateString() ? 'Today' : date}
                </span>
              </div>
              
              {/* Messages */}
              {msgs.map((message, index) => {
                // Skip messages without valid IDs or sender
                if (!message || !message._id) {
                  console.warn('Invalid message:', message)
                  return null;
                }

                // Determine if message is from current user - handle multiple sender formats
                const senderId = message.sender?._id || message.sender?.id || message.sender;

                // Only mark as mine if we have both IDs and they match
                const isMine = !!(userId && senderId && senderId === userId);

                // Debug - log EVERY message to see positioning
                console.log(`Message #${index}:`, {
                  id: message._id,
                  'sender._id': message.sender?._id,
                  'sender.fullName': message.sender?.fullName,
                  senderId,
                  userId,
                  isMine,
                  position: isMine ? 'RIGHT (mine)' : 'LEFT (theirs)',
                  content: message.content,
                  status: message.status
                })

                return (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={clsx(
                    'mb-1 md:mb-2',
                    selectedMessages.includes(message._id) && 'bg-blue-50/50 dark:bg-blue-900/20 -mx-2 px-2 rounded-lg'
                  )}
                >
                  <ChatBubble
                    message={message}
                    isMine={isMine}
                    onReply={() => setReplyTo(message)}
                    onSelect={() => handleSelectMessage(message._id)}
                    onLongPress={() => handleLongPress(message._id)}
                    isSelected={selectedMessages.includes(message._id)}
                    showAvatar={!isMine}
                    onSchedule={() => setShowScheduleModal(true)}
                  />
                </motion.div>
                );
              })}
            </div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {typingUsers[activeChat._id]?.length > 0 && (
          <TypingIndicator users={typingUsers[activeChat._id]} />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview - Mobile optimized */}
      {replyTo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-3 md:px-4 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 flex items-center gap-2">
              {/* Reply indicator bar */}
              <div className="w-1 h-8 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                    Replying to {replyTo.sender?.fullName || replyTo.sender?.name || replyTo.sender || 'Unknown'}
                  </p>
                  {/* Show if replying to your own message */}
                  {(replyTo.sender?._id === user?._id || replyTo.sender === user?._id) && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full font-medium">
                      You
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {typeof replyTo.content === 'object' && replyTo.content !== null
                    ? replyTo.content.text || JSON.stringify(replyTo.content)
                    : replyTo.content || `📎 ${replyTo.type || 'Media'} message`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="ml-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="Cancel reply"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}

      {/* Chat Input - Mobile optimized */}
      <ChatInput
        onSendMessage={handleSendMessage}
        replyTo={replyTo}
        chatId={activeChat._id}
      />

      {/* Scheduled Messages Modal */}
      {showScheduleModal && (
        <ScheduledMessages
          chatId={activeChat._id}
          onClose={() => setShowScheduleModal(false)}
        />
      )}
    </div>
  )
}

export default ChatArea