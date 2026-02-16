import { useEffect, useCallback } from 'react'
import useChatStore from '../store/useChatStore'
import useSocket from './useSocket'
import soundManager from '../lib/soundManager'

const useChat = (chatId) => {
  const {
    messages,
    activeChat,
    typingUsers,
    fetchMessages,
    sendMessage,
    receiveMessage,
    setTyping,
    markAsRead,
  } = useChatStore()

  const { socket, emit, emitTyping } = useSocket()

  useEffect(() => {
    if (chatId) {
      fetchMessages(chatId)
      markAsRead(chatId)
    }
  }, [chatId])

  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (message) => {
      if (message.chat === chatId) {
        receiveMessage(message)
        soundManager.playMessageReceived()
        markAsRead(chatId)
      }
    }

    const handleTypingStart = ({ chatId: typingChatId, userId }) => {
      if (typingChatId === chatId) {
        setTyping(chatId, userId, true)
      }
    }

    const handleTypingStop = ({ chatId: typingChatId, userId }) => {
      if (typingChatId === chatId) {
        setTyping(chatId, userId, false)
      }
    }

    socket.on('message:receive', handleNewMessage)
    socket.on('typing:start', handleTypingStart)
    socket.on('typing:stop', handleTypingStop)

    return () => {
      socket.off('message:receive', handleNewMessage)
      socket.off('typing:start', handleTypingStart)
      socket.off('typing:stop', handleTypingStop)
    }
  }, [socket, chatId])

  const handleSendMessage = useCallback(
    async (content, attachments = []) => {
      const message = await sendMessage(chatId, content, attachments)
      if (message) {
        soundManager.playMessageSent()
      }
      return message
    },
    [chatId, sendMessage]
  )

  const handleTyping = useCallback(
    (isTyping) => {
      emitTyping(chatId, isTyping)
    },
    [chatId, emitTyping]
  )

  return {
    messages,
    activeChat,
    typingUsers: typingUsers[chatId] || [],
    sendMessage: handleSendMessage,
    setTyping: handleTyping,
  }
}

export default useChat