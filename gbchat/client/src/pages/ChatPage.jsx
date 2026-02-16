import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import ChatList from '../components/chat/ChatList'
import ChatArea from '../components/chat/ChatArea'
import StoryBar from '../components/stories/StoryBar'
import useChatStore from '../store/useChatStore'
import useMediaQuery from '../hooks/useMediaQuery'
import clsx from 'clsx'

const ChatPage = () => {
  const { toggleSidebar, isSidebarOpen } = useOutletContext()
  const { activeChat, setActiveChat, fetchChats } = useChatStore()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [showChatList, setShowChatList] = useState(!isMobile)

  useEffect(() => {
    fetchChats()
  }, [])

  useEffect(() => {
    // On mobile, hide chat list when a chat is selected
    if (isMobile && activeChat) {
      setShowChatList(false)
    }
  }, [activeChat, isMobile])

  const handleChatSelect = (chat) => {
    setActiveChat(chat)
    if (isMobile) {
      setShowChatList(false)
    }
  }

  const handleBackToList = () => {
    if (isMobile) {
      setActiveChat(null)
      setShowChatList(true)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Header with Menu Button */}
      {isMobile && showChatList && (
        <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-30 flex items-center justify-between px-4">
          <button
            onClick={toggleSidebar}
            className="p-2 -ml-2 text-gray-600 dark:text-gray-400"
          >
            {isSidebarOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">GBChat</h1>
          <div className="w-8" /> {/* Spacer for balance */}
        </div>
      )}

      {/* Story Bar - Always visible on top */}
      <div className={clsx(
        'hidden md:block',
        isMobile && showChatList && 'mt-14'
      )}>
        <StoryBar />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat List - Conditional rendering on mobile */}
        <motion.div
          initial={false}
          animate={{
            x: isMobile && !showChatList ? '-100%' : 0,
            display: isMobile && !showChatList ? 'none' : 'flex',
          }}
          className={clsx(
            'flex-shrink-0',
            isMobile ? 'absolute inset-0 z-10' : 'relative'
          )}
        >
          <ChatList onChatSelect={handleChatSelect} />
        </motion.div>

        {/* Chat Area - Full screen on mobile when chat selected */}
        <div className={clsx(
          'flex-1 flex flex-col',
          isMobile && showChatList && 'hidden'
        )}>
          {!activeChat && !isMobile ? (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
              <div className="text-center px-4">
                <div className="w-32 h-32 mx-auto mb-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  GBChat Web
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                  Send and receive messages without keeping your phone online.
                  Use GBChat on up to 4 linked devices and 1 phone at the same time.
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    End-to-end encrypted
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <ChatArea onBack={handleBackToList} />
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatPage