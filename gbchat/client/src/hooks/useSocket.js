import { useCallback, useRef } from 'react'
import io from 'socket.io-client'
import useAuthStore from '../store/useAuthStore'
import useChatStore from '../store/useChatStore'
import useNotificationStore from '../store/useNotificationStore'
import useCallStore from '../store/useCallStore'
import { toast } from 'react-hot-toast'

/**
 * Socket connection
 * -----------------
 * A single shared socket per browser tab. Previously every `useSocket()`
 * call created its own connection (`forceNew: true`), which made the server's
 * `onlineUsers` map point at the most recently created socket and broke
 * delivery of messages, calls and WebRTC signaling to the "wrong" instance.
 * Now handlers are attached once and every consumer talks to the same socket.
 */
const getSocketUrl = () => {
  const configured = import.meta.env.VITE_SOCKET_URL
  if (configured) return configured
  // Same-origin by default: vite proxies /socket.io to the API server
  if (typeof window !== 'undefined') return window.location.origin
  return 'http://localhost:5000'
}

let sharedSocket = null
let sharedUserId = null
let handlersAttached = false
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 8

const getToken = () => {
  try {
    const direct = localStorage.getItem('token')
    if (direct) return direct
    const stored = JSON.parse(localStorage.getItem('auth-storage') || 'null')
    return stored?.state?.token || null
  } catch {
    return null
  }
}

const attachHandlers = (socket) => {
  if (handlersAttached) return
  handlersAttached = true

  socket.on('connect', () => {
    reconnectAttempts = 0
    console.log('[Socket] connected', socket.id)
  })

  socket.on('disconnect', (reason) => {
    console.log('[Socket] disconnected:', reason)
    if (reason === 'io server disconnect') socket.connect()
  })

  socket.on('connect_error', (error) => {
    console.warn('[Socket] connection error:', error.message)
    reconnectAttempts += 1
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      toast.error('Realtime connection lost — some features may be delayed', {
        id: 'socket-connection',
      })
    }
  })

  // ---- Profile ----
  socket.on('user:profileUpdated', (profileData) => {
    const { user, updateUserData } = useAuthStore.getState()
    if (profileData?.userId === user?._id) updateUserData(profileData)
    useChatStore.getState().updateContact?.(profileData?.userId, profileData)
  })

  const handleNewMessage = (message) => {
    useChatStore.getState().receiveMessage?.(message)
    if (!document.hasFocus()) {
      useNotificationStore.getState().addNotification?.({
        title: message?.sender?.fullName || message?.sender?.name || 'New message',
        body: message?.content?.text || 'Sent you a message',
        icon: message?.sender?.avatar,
        tag: message?.chat,
      })
    }
  }

  // Server names (socket/handlers/chatHandler.js) + legacy aliases
  socket.on('newMessage', ({ message }) => handleNewMessage(message))
  socket.on('message:new', handleNewMessage)

  socket.on('message:update', ({ messageId, updates }) => {
    useChatStore.getState().updateMessageStatus?.(messageId, updates?.status)
  })
  socket.on('messagesDelivered', ({ messageIds }) => {
    messageIds?.forEach((id) => useChatStore.getState().updateMessageStatus?.(id, 'delivered'))
  })
  socket.on('messagesRead', ({ messageIds }) => {
    messageIds?.forEach((id) => useChatStore.getState().updateMessageStatus?.(id, 'read'))
  })

  // ---- Typing ----
  socket.on('userTyping', ({ chatId, userId }) => {
    useChatStore.getState().setTyping?.(chatId, userId, true)
  })
  socket.on('userStopTyping', ({ chatId, userId }) => {
    useChatStore.getState().setTyping?.(chatId, userId, false)
  })
  socket.on('typing:start', ({ chatId, userId }) => {
    useChatStore.getState().setTyping?.(chatId, userId, true)
  })
  socket.on('typing:stop', ({ chatId, userId }) => {
    useChatStore.getState().setTyping?.(chatId, userId, false)
  })

  // ---- Presence ----
  socket.on('onlineUsers', (users) => {
    useChatStore.getState().setOnlineUsers?.(Array.isArray(users) ? users : [])
  })
  socket.on('users:online', (users) => {
    useChatStore.getState().setOnlineUsers?.(Array.isArray(users) ? users : [])
  })

  const markOnline = (userId) => {
    if (!userId) return
    const store = useChatStore.getState()
    const list = Array.isArray(store.onlineUsers) ? store.onlineUsers : []
    store.setOnlineUsers?.([...new Set([...list, userId])])
  }
  const markOffline = (userId) => {
    if (!userId) return
    const store = useChatStore.getState()
    const list = Array.isArray(store.onlineUsers) ? store.onlineUsers : []
    store.setOnlineUsers?.(list.filter((id) => id !== userId))
  }

  socket.on('userOnline', (payload) => markOnline(payload?.userId || payload))
  socket.on('user:online', (payload) => markOnline(payload?.userId || payload))
  socket.on('userOffline', (payload) => markOffline(payload?.userId || payload))
  socket.on('user:offline', (payload) => markOffline(payload?.userId || payload))

  // ---- Calls ----
  const callStore = () => useCallStore.getState()

  const handleIncomingCall = (payload) => {
    const call = payload?.call || payload
    const normalized = {
      ...call,
      _id: call?._id || payload?.callId,
      type: call?.type || payload?.type,
      caller: call?.caller || payload?.caller,
      isIncoming: true,
    }
    callStore().setIncomingCall?.(normalized)
  }

  socket.on('incomingCall', handleIncomingCall)
  socket.on('call:incoming', handleIncomingCall)

  socket.on('callAccepted', ({ callId }) => {
    callStore().markAccepted?.(callId)
  })

  socket.on('callDeclined', () => {
    callStore().clearActiveCall?.()
    toast('Call declined')
  })

  socket.on('callEnded', () => {
    callStore().clearActiveCall?.()
    toast('Call ended')
  })

  socket.on('callFailed', ({ reason }) => {
    callStore().clearActiveCall?.()
    toast.error(reason || 'Call could not be connected')
  })

  // WebRTC signaling is consumed by hooks/usePeerConnection via
  // `socket.on('webrtc:*')`; nothing to do here.
}

const useSocket = () => {
  const socketRef = useRef(sharedSocket)

  const connect = useCallback((userId) => {
    if (!userId) return
    if (sharedSocket && sharedUserId === userId && sharedSocket.connected) {
      socketRef.current = sharedSocket
      return
    }

    if (sharedSocket && sharedUserId !== userId) {
      sharedSocket.removeAllListeners()
      sharedSocket.disconnect()
      sharedSocket = null
      handlersAttached = false
    }

    if (sharedSocket) {
      socketRef.current = sharedSocket
      return
    }

    sharedUserId = userId
    sharedSocket = io(getSocketUrl(), {
      auth: { token: getToken() },
      query: { userId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      withCredentials: true,
    })

    attachHandlers(sharedSocket)
    socketRef.current = sharedSocket
  }, [])

  const disconnect = useCallback(() => {
    if (sharedSocket) {
      sharedSocket.removeAllListeners()
      sharedSocket.disconnect()
      sharedSocket = null
      sharedUserId = null
      handlersAttached = false
      socketRef.current = null
    }
  }, [])

  const emit = useCallback((event, data) => {
    if (sharedSocket?.connected) sharedSocket.emit(event, data)
    else console.warn('[Socket] emit skipped (not connected):', event)
  }, [])

  const emitTyping = useCallback(
    (chatId, isTyping) => {
      emit(isTyping ? 'typing' : 'stopTyping', { chatId })
    },
    [emit]
  )

  const sendMessage = useCallback(
    (payload) => emit('sendMessage', payload),
    [emit]
  )

  const emitMessageRead = useCallback(
    ({ chatId, messageIds }) => emit('messageRead', { chatId, messageIds }),
    [emit]
  )

  const joinRoom = useCallback((roomId) => emit('joinChat', roomId), [emit])
  const leaveRoom = useCallback((roomId) => emit('leaveChat', roomId), [emit])

  return {
    socket: sharedSocket,
    connect,
    disconnect,
    emit,
    emitTyping,
    sendMessage,
    emitMessageRead,
    joinRoom,
    leaveRoom,
    isConnected: Boolean(sharedSocket?.connected),
  }
}

export default useSocket
