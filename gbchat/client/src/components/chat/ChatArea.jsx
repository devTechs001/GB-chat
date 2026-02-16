import React, { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useOutletContext } from 'react-router-dom'
import ChatHeader from './ChatHeader'
import ChatBubble from './ChatBubble'
import ChatInput from './ChatInput'
import TypingIndicator from './TypingIndicator'
import useChatStore from '../../store/useChatStore'
import useAuthStore from '../../store/useAuthStore'
import clsx from 'clsx'

const ChatArea = () => {
  const { toggleSidePanel } = useOutletContext()
  const { activeChat, messages, typingUsers, sendMessage } = useChatStore()
  const { user } = useAuthStore()
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const [replyTo, setReplyTo] = useState(null)
  const [selectedMessages, setSelectedMessages] = useState([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content, attachments) => {
    if (!activeChat) return
    await sendMessage(activeChat._id, content, attachments)
    setReplyTo(null)
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
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(message)
    return groups
  }, {})

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
        onInfoClick={toggleSidePanel}
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
          'flex-1 overflow-y-auto px-3 md:px-4 py-4',
          'bg-chat-pattern', // Custom background pattern
          'scrollbar-thin scrollbar-thumb-gray-400'
        )}
        style={{
          backgroundImage: `url('/chat-bg.png')`,
          backgroundSize: 'cover',
        }}
      >
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
              {msgs.map((message, index) => (
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
                    isMine={message.sender._id === user._id}
                    onReply={() => setReplyTo(message)}
                    onSelect={() => handleSelectMessage(message._id)}
                    onLongPress={() => handleLongPress(message._id)}
                    isSelected={selectedMessages.includes(message._id)}
                    showAvatar={!message.sender._id === user._id}
                  />
                </motion.div>
              ))}
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
            <div className="flex-1 min-w-0">
              <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                Replying to {replyTo.sender.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {replyTo.content}
              </p>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </div>
  )
}

export default ChatArea