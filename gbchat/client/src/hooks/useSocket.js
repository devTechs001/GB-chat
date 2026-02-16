import { useEffect, useRef, useCallback } from 'react'
import io from 'socket.io-client'
import useAuthStore from '../store/useAuthStore'
import useChatStore from '../store/useChatStore'
import useNotificationStore from '../store/useNotificationStore'
import { toast } from 'react-hot-toast'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

const useSocket = () => {
  const socketRef = useRef(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const { user, token } = useAuthStore()
  const {
    receiveMessage,
    setTyping,
    setOnlineUsers,
    updateMessageStatus,
  } = useChatStore()
  const { addNotification } = useNotificationStore()

  const connect = useCallback((userId) => {
    if (socketRef.current?.connected) return

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      query: { userId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
    })

    // Connection events
    socketRef.current.on('connect', () => {
      console.log('Socket connected')
      reconnectAttempts.current = 0
      toast.success('Connected', { id: 'socket-connection' })
    })

    socketRef.current.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      if (reason === 'io server disconnect') {
        socketRef.current.connect()
      }
      toast.error('Connection lost', { id: 'socket-connection' })
    })

    socketRef.current.on('connect_error', (error) => {
      console.error('Connection error:', error)
      reconnectAttempts.current++
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        toast.error('Failed to connect. Please refresh the page.')
        socketRef.current.disconnect()
      }
    })

    // Chat events
    socketRef.current.on('message:new', (message) => {
      receiveMessage(message)
      
      // Show notification if not in focus
      if (!document.hasFocus()) {
        addNotification({
          title: message.sender.name,
          body: message.content,
          icon: message.sender.avatar,
          tag: message.chat,
        })
      }
    })

    socketRef.current.on('message:update', ({ messageId, updates }) => {
      updateMessageStatus(messageId, updates.status)
    })

    socketRef.current.on('message:delete', ({ messageId }) => {
      // Handle message deletion
    })

    // Typing events
    socketRef.current.on('typing:start', ({ chatId, userId }) => {
      setTyping(chatId, userId, true)
    })

    socketRef.current.on('typing:stop', ({ chatId, userId }) => {
      setTyping(chatId, userId, false)
    })

    // Presence events
    socketRef.current.on('users:online', (users) => {
      setOnlineUsers(users)
    })

    socketRef.current.on('user:online', (userId) => {
      setOnlineUsers((prev) => [...prev, userId])
    })

    socketRef.current.on('user:offline', (userId) => {
      setOnlineUsers((prev) => prev.filter(id => id !== userId))
    })

    // Call events
    socketRef.current.on('call:incoming', (callData) => {
      // Handle incoming call
      addNotification({
        title: `Incoming ${callData.type} call`,
        body: `${callData.caller.name} is calling...`,
        actions: [
          { action: 'answer', title: 'Answer' },
          { action: 'decline', title: 'Decline' },
        ],
      })
    })

    // Group events
    socketRef.current.on('group:update', (groupData) => {
      // Handle group updates
    })

    socketRef.current.on('group:memberAdded', ({ groupId, member }) => {
      // Handle new member
    })

    socketRef.current.on('group:memberRemoved', ({ groupId, memberId }) => {
      // Handle member removal
    })

  }, [token, user])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }, [])

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    }
  }, [])

  const emitTyping = useCallback((chatId, isTyping) => {
    emit('typing', { chatId, isTyping })
  }, [emit])

  const emitMessageRead = useCallback((messageIds) => {
    emit('message:read', { messageIds })
  }, [emit])

  const joinRoom = useCallback((roomId) => {
    emit('room:join', roomId)
  }, [emit])

  const leaveRoom = useCallback((roomId) => {
    emit('room:leave', roomId)
  }, [emit])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    socket: socketRef.current,
    connect,
    disconnect,
    emit,
    emitTyping,
    emitMessageRead,
    joinRoom,
    leaveRoom,
    isConnected: socketRef.current?.connected || false,
  }
}

export default useSocket