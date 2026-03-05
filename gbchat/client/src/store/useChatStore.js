import { create } from 'zustand'
import api from '../lib/api'
import toast from 'react-hot-toast'

// Sample data for development/demo
const sampleChats = [
  {
    _id: '1',
    name: 'John Doe',
    avatar: null,
    isGroup: false,
    isPinned: true,
    unreadCount: 2,
    lastMessage: {
      content: { text: 'Hey! How are you doing?' },
      type: 'text',
      createdAt: new Date().toISOString(),
      sender: { _id: 'user2', name: 'John Doe' }
    },
    lastMessageAt: new Date().toISOString(),
    participants: [{ user: { _id: 'user2', name: 'John Doe' } }]
  },
  {
    _id: '2',
    name: 'Jane Smith',
    avatar: null,
    isGroup: false,
    isPinned: false,
    unreadCount: 0,
    lastMessage: {
      content: { text: 'The project looks great! 🎉' },
      type: 'text',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      sender: { _id: 'user3', name: 'Jane Smith' }
    },
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    participants: [{ user: { _id: 'user3', name: 'Jane Smith' } }]
  },
  {
    _id: '3',
    name: 'Development Team',
    avatar: null,
    isGroup: true,
    isPinned: true,
    unreadCount: 5,
    lastMessage: {
      content: { text: 'Meeting at 3 PM today' },
      type: 'text',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      sender: { _id: 'user4', name: 'Mike Johnson' }
    },
    lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
    participants: [
      { user: { _id: 'user4', name: 'Mike Johnson' } },
      { user: { _id: 'user5', name: 'Sarah Wilson' } }
    ],
    groupMembers: 8
  },
  {
    _id: '4',
    name: 'Family',
    avatar: null,
    isGroup: true,
    isPinned: false,
    unreadCount: 0,
    lastMessage: {
      content: { text: 'Don\'t forget dinner tonight!' },
      type: 'text',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      sender: { _id: 'user6', name: 'Mom' }
    },
    lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
    participants: [{ user: { _id: 'user6', name: 'Mom' } }],
    groupMembers: 5
  },
  {
    _id: '5',
    name: 'Alex Chen',
    avatar: null,
    isGroup: false,
    isPinned: false,
    unreadCount: 0,
    lastMessage: {
      content: { text: 'Check out this photo!' },
      type: 'image',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      sender: { _id: 'user7', name: 'Alex Chen' }
    },
    lastMessageAt: new Date(Date.now() - 172800000).toISOString(),
    participants: [{ user: { _id: 'user7', name: 'Alex Chen' } }]
  }
]

const sampleMessages = [
  {
    _id: 'm1',
    chat: '1',
    content: { text: 'Hey! How are you doing?' },
    type: 'text',
    sender: { _id: 'user2', name: 'John Doe' },
    status: 'read',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'm2',
    chat: '1',
    content: { text: 'I\'m doing great, thanks for asking!' },
    type: 'text',
    sender: { _id: 'user1', name: 'You' },
    status: 'read',
    createdAt: new Date(Date.now() - 60000).toISOString()
  }
]

const sampleGroups = [
  {
    _id: 'g1',
    name: 'Development Team',
    description: 'Team collaboration and updates',
    avatar: null,
    members: [
      { _id: 'user1', name: 'You', role: 'admin', avatar: null },
      { _id: 'user4', name: 'Mike Johnson', role: 'admin', avatar: null },
      { _id: 'user5', name: 'Sarah Wilson', role: 'member', avatar: null },
      { _id: 'user6', name: 'Emily Brown', role: 'member', avatar: null },
      { _id: 'user7', name: 'Alex Chen', role: 'member', avatar: null }
    ],
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    createdBy: { _id: 'user4', name: 'Mike Johnson' },
    memberCount: 8,
    unreadCount: 5,
    lastMessage: {
      content: { text: 'Meeting at 3 PM today' },
      type: 'text',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      sender: { _id: 'user4', name: 'Mike Johnson' }
    }
  },
  {
    _id: 'g2',
    name: 'Family',
    description: 'Family group chat',
    avatar: null,
    members: [
      { _id: 'user1', name: 'You', role: 'member', avatar: null },
      { _id: 'user6', name: 'Mom', role: 'admin', avatar: null },
      { _id: 'user7', name: 'Dad', role: 'member', avatar: null },
      { _id: 'user8', name: 'Sister', role: 'member', avatar: null }
    ],
    createdAt: new Date(Date.now() - 86400000 * 365).toISOString(),
    createdBy: { _id: 'user6', name: 'Mom' },
    memberCount: 5,
    unreadCount: 0,
    lastMessage: {
      content: { text: 'Don\'t forget dinner tonight!' },
      type: 'text',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      sender: { _id: 'user6', name: 'Mom' }
    }
  },
  {
    _id: 'g3',
    name: 'Weekend Trip Planning',
    description: 'Planning our next adventure',
    avatar: null,
    members: [
      { _id: 'user1', name: 'You', role: 'admin', avatar: null },
      { _id: 'user2', name: 'John Doe', role: 'member', avatar: null },
      { _id: 'user3', name: 'Jane Smith', role: 'member', avatar: null }
    ],
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    createdBy: { _id: 'user1', name: 'You' },
    memberCount: 3,
    unreadCount: 12,
    lastMessage: {
      content: { text: 'I found a great cabin!' },
      type: 'text',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      sender: { _id: 'user3', name: 'Jane Smith' }
    }
  }
]

const sampleChannels = [
  {
    _id: 'c1',
    name: 'Tech News',
    description: 'Latest technology updates and news',
    avatar: null,
    subscribers: 1250,
    isVerified: true,
    isSubscribed: true,
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
    createdBy: { _id: 'admin1', name: 'Tech Admin' },
    posts: [
      {
        _id: 'p1',
        content: { text: 'New AI breakthrough announced today! Scientists have developed a new model that can understand context better than ever before.' },
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        views: 523,
        reactions: { likes: 45, loves: 12, wow: 8 }
      },
      {
        _id: 'p2',
        content: { text: 'Breaking: Major tech company announces revolutionary product' },
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        views: 892,
        reactions: { likes: 78, loves: 23 }
      }
    ]
  },
  {
    _id: 'c2',
    name: 'GBChat Updates',
    description: 'Official GBChat announcements and feature releases',
    avatar: null,
    subscribers: 5420,
    isVerified: true,
    isSubscribed: true,
    createdAt: new Date(Date.now() - 86400000 * 180).toISOString(),
    createdBy: { _id: 'admin2', name: 'GBChat Team' },
    posts: [
      {
        _id: 'p3',
        content: { text: '🎉 New Feature Alert! Introducing voice messages with transcription. Now available in beta.' },
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        views: 2341,
        reactions: { likes: 234, loves: 89, fire: 45 }
      }
    ]
  },
  {
    _id: 'c3',
    name: 'Daily Motivation',
    description: 'Start your day with inspiration',
    avatar: null,
    subscribers: 3200,
    isVerified: false,
    isSubscribed: false,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    createdBy: { _id: 'admin3', name: 'Motivation Hub' },
    posts: []
  },
  {
    _id: 'c4',
    name: 'Crypto Insights',
    description: 'Market analysis and crypto news',
    avatar: null,
    subscribers: 8900,
    isVerified: true,
    isSubscribed: false,
    createdAt: new Date(Date.now() - 86400000 * 120).toISOString(),
    createdBy: { _id: 'admin4', name: 'Crypto Expert' },
    posts: []
  }
]

const sampleStories = [
  {
    _id: 's1',
    userId: { _id: 'user2', name: 'John Doe', avatar: null },
    media: [{ url: 'https://via.placeholder.com/400x600', type: 'image' }],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 82800000).toISOString(),
    views: []
  },
  {
    _id: 's2',
    userId: { _id: 'user3', name: 'Jane Smith', avatar: null },
    media: [{ url: 'https://via.placeholder.com/400x600', type: 'image' }],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    expiresAt: new Date(Date.now() + 79200000).toISOString(),
    views: []
  }
]

const sampleCalls = [
  {
    _id: 'call1',
    userId: { _id: 'user2', name: 'John Doe', avatar: null },
    type: 'voice',
    status: 'missed',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    duration: 0
  },
  {
    _id: 'call2',
    userId: { _id: 'user3', name: 'Jane Smith', avatar: null },
    type: 'video',
    status: 'completed',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    duration: 325
  }
]

const useChatStore = create((set, get) => ({
  chats: [],
  activeChat: null,
  messages: [],
  typingUsers: {},
  onlineUsers: [],
  unreadCounts: {},
  isLoading: false,
  searchQuery: '',
  groups: [],
  channels: [],
  stories: [],
  calls: [],

  // Chat actions
  fetchChats: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get('/chats')
      // Handle both array response and object with chats property
      const chatsArray = Array.isArray(data) ? data : (data.chats || [])
      set({ chats: chatsArray.length > 0 ? chatsArray : sampleChats, isLoading: false })
    } catch (error) {
      // Use sample data on error
      set({ chats: sampleChats, isLoading: false })
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