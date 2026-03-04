import { create } from 'zustand'
import api from '../lib/api'
import toast from 'react-hot-toast'

const useChatStore = create((set, get) => ({
  chats: [],
  activeChat: null,
  messages: [],
  typingUsers: {},
  onlineUsers: [],
  unreadCounts: {},
  isLoading: false,
  searchQuery: '',
  
  // Chat actions
  fetchChats: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get('/chats')
      // Handle both array response and object with chats property
      const chatsArray = Array.isArray(data) ? data : (data.chats || [])
      set({ chats: chatsArray, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      console.error('Failed to fetch chats:', error)
    }
  },
  
  setActiveChat: (chat) => {
    set({ activeChat: chat })
    if (chat) {
      get().fetchMessages(chat._id)
      get().markAsRead(chat._id)
    }
  },
  
  createChat: async (userId) => {
    try {
      const { data } = await api.post('/chats', { userId })
      set((state) => ({
        chats: [data.chat, ...state.chats.filter(c => c._id !== data.chat._id)]
      }))
      return data.chat
    } catch (error) {
      toast.error('Failed to create chat')
      console.error(error)
    }
  },
  
  // Message actions
  fetchMessages: async (chatId) => {
    try {
      const { data } = await api.get(`/messages/${chatId}`)
      // Handle both array response and object with messages property
      const messagesArray = Array.isArray(data) ? data : (data.messages || [])
      set({ messages: messagesArray })
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      set({ messages: [] })
    }
  },
  
  sendMessage: async (chatId, content, attachments = [], replyTo = null) => {
    try {
      const formData = new FormData()
      formData.append('text', typeof content === 'object' ? content.text : content)
      formData.append('chatId', chatId)
      formData.append('type', 'text')

      // Add reply information if replying to a message
      if (replyTo) {
        formData.append('replyTo', JSON.stringify({
          messageId: replyTo._id,
          content: replyTo.content,
          sender: replyTo.sender
        }))
      }

      attachments.forEach((file) => {
        formData.append('attachments', file)
      })

      const { data } = await api.post(`/messages/${chatId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const newMessage = data.message || data

      // Optimistically add message to store
      set((state) => ({
        messages: [...state.messages, newMessage],
        chats: state.chats.map(chat =>
          chat._id === chatId
            ? { ...chat, lastMessage: newMessage, updatedAt: new Date() }
            : chat
        ),
      }))

      console.log('[Store] Message added successfully:', newMessage._id)

      return newMessage
    } catch (error) {
      toast.error('Failed to send message')
      console.error('Send message error:', error)
      throw error
    }
  },
  
  receiveMessage: (message) => {
    const { activeChat } = get()

    // Add message to messages if it's for the active chat
    if (activeChat?._id === message.chat) {
      set((state) => ({
        messages: [...state.messages, message],
      }))
    }

    // Update chat list
    set((state) => ({
      chats: state.chats.map(chat =>
        chat._id === message.chat
          ? { ...chat, lastMessage: message, updatedAt: new Date() }
          : chat
      ),
      unreadCounts: {
        ...state.unreadCounts,
        [message.chat]: (state.unreadCounts[message.chat] || 0) +
          (activeChat?._id !== message.chat ? 1 : 0),
      },
    }))
  },

  // Update message status (for when messages are delivered/read)
  updateMessageStatus: (messageId, status) => {
    set((state) => ({
      messages: state.messages.map(msg =>
        msg._id === messageId ? { ...msg, status } : msg
      ),
    }))
    console.log('[Store] Message status updated:', messageId, status)
  },

  // Mark messages as delivered in a chat
  markMessagesAsDelivered: (chatId, messageIds) => {
    set((state) => ({
      messages: state.messages.map(msg =>
        messageIds.includes(msg._id) && msg.chat === chatId
          ? { ...msg, status: 'delivered' }
          : msg
      ),
    }))
  },

  // Mark messages as read in a chat
  markMessagesAsRead: (chatId, messageIds) => {
    set((state) => ({
      messages: state.messages.map(msg =>
        messageIds.includes(msg._id) && msg.chat === chatId
          ? { ...msg, status: 'read' }
          : msg
      ),
      chats: state.chats.map(chat =>
        chat._id === chatId
          ? { ...chat, unreadCount: 0 }
          : chat
      ),
    }))
    console.log('[Store] Messages marked as read:', chatId, messageIds?.length)
  },
  
  deleteMessage: async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`)
      set((state) => ({
        messages: state.messages.filter(msg => msg._id !== messageId),
      }))
      toast.success('Message deleted')
    } catch (error) {
      toast.error('Failed to delete message')
    }
  },
  
  editMessage: async (messageId, newContent) => {
    try {
      const { data } = await api.patch(`/messages/${messageId}`, {
        content: newContent,
      })
      set((state) => ({
        messages: state.messages.map(msg =>
          msg._id === messageId ? data.message : msg
        ),
      }))
    } catch (error) {
      toast.error('Failed to edit message')
    }
  },
  
  // Typing indicators
  setTyping: (chatId, userId, isTyping) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: isTyping
          ? [...(state.typingUsers[chatId] || []), userId].filter(
              (id, index, self) => self.indexOf(id) === index
            )
          : (state.typingUsers[chatId] || []).filter(id => id !== userId),
      },
    }))
  },
  
  // Online status
  setOnlineUsers: (users) => {
    set({ onlineUsers: users })
  },
  
  // Mark as read
  markAsRead: async (chatId) => {
    try {
      await api.post(`/chats/${chatId}/read`)
      set((state) => ({
        unreadCounts: {
          ...state.unreadCounts,
          [chatId]: 0,
        },
      }))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  },
  
  // Search
  setSearchQuery: (query) => {
    set({ searchQuery: query })
  },

  // Update contact information (for real-time profile updates)
  updateContact: (userId, userData) => {
    set((state) => ({
      chats: state.chats.map(chat => {
        // Check if the user is a participant in this chat
        const participant = chat.participants?.find(p =>
          (p.user?._id || p.user) === userId
        )

        if (participant) {
          // Update the participant's user data
          return {
            ...chat,
            participants: chat.participants.map(p =>
              (p.user?._id || p.user) === userId
                ? { ...p, user: { ...p.user, ...userData } }
                : p
            ),
          }
        }
        return chat
      }),
    }))
  },

  // Clear store
  clearChat: () => {
    set({
      activeChat: null,
      messages: [],
      typingUsers: {},
    })
  },
}))

export default useChatStore