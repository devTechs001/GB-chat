import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if exists
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add request ID for tracking
    config.headers['X-Request-ID'] = generateRequestId()

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data)
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`[API Response]`, response.data)
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          })

          localStorage.setItem('token', data.token)
          localStorage.setItem('refreshToken', data.refreshToken)
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${data.token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.clear()
        window.location.href = '/auth'
        return Promise.reject(refreshError)
      }
    }

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.')
      return Promise.reject(error)
    }

    // Handle other errors
    const message = error.response?.data?.message || 'Something went wrong'
    
    // Don't show toast for cancelled requests
    if (error.code !== 'ERR_CANCELED') {
      // Only show toast for certain error codes
      if ([400, 403, 404, 500].includes(error.response?.status)) {
        toast.error(message)
      }
    }

    return Promise.reject(error)
  }
)

// Helper function to generate request ID
function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// API service methods
const apiService = {
  // Auth
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
    verifyOTP: (data) => api.post('/auth/verify-otp', data),
    resendOTP: (email) => api.post('/auth/resend-otp', { email }),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    changePassword: (data) => api.post('/auth/change-password', data),
    getProfile: () => api.get('/auth/me'),
  },

  // Users
  users: {
    search: (query) => api.get(`/users/search?q=${query}`),
    getProfile: (userId) => api.get(`/users/${userId}`),
    updateProfile: (data) => api.patch('/users/profile', data),
    updateAvatar: (formData) => api.post('/users/avatar', formData),
    updateStatus: (status) => api.patch('/users/status', { status }),
    blockUser: (userId) => api.post(`/users/${userId}/block`),
    unblockUser: (userId) => api.post(`/users/${userId}/unblock`),
    getBlockedUsers: () => api.get('/users/blocked'),
  },

  // Chats
  chats: {
    getAll: () => api.get('/chats'),
    create: (userId) => api.post('/chats', { userId }),
    get: (chatId) => api.get(`/chats/${chatId}`),
    delete: (chatId) => api.delete(`/chats/${chatId}`),
    clear: (chatId) => api.post(`/chats/${chatId}/clear`),
    archive: (chatId) => api.post(`/chats/${chatId}/archive`),
    unarchive: (chatId) => api.post(`/chats/${chatId}/unarchive`),
    pin: (chatId) => api.post(`/chats/${chatId}/pin`),
    unpin: (chatId) => api.post(`/chats/${chatId}/unpin`),
    mute: (chatId, duration) => api.post(`/chats/${chatId}/mute`, { duration }),
    unmute: (chatId) => api.post(`/chats/${chatId}/unmute`),
    markAsRead: (chatId) => api.post(`/chats/${chatId}/read`),
    search: (chatId, query) => api.get(`/chats/${chatId}/search?q=${query}`),
  },

  // Messages
  messages: {
    getAll: (chatId, params) => api.get(`/messages/${chatId}`, { params }),
    send: (formData) => api.post('/messages', formData),
    forward: (messageId, chatIds) => api.post(`/messages/${messageId}/forward`, { chatIds }),
    reply: (messageId, content) => api.post(`/messages/${messageId}/reply`, { content }),
    edit: (messageId, content) => api.patch(`/messages/${messageId}`, { content }),
    delete: (messageId, forEveryone) => api.delete(`/messages/${messageId}`, { data: { forEveryone } }),
    react: (messageId, emoji) => api.post(`/messages/${messageId}/react`, { emoji }),
    star: (messageId) => api.post(`/messages/${messageId}/star`),
    unstar: (messageId) => api.post(`/messages/${messageId}/unstar`),
    getStarred: () => api.get('/messages/starred'),
    schedule: (data) => api.post('/messages/schedule', data),
    getScheduled: () => api.get('/messages/scheduled'),
  },

  // Groups
  groups: {
    create: (formData) => api.post('/groups/create', formData),
    get: (groupId) => api.get(`/groups/${groupId}`),
    update: (groupId, data) => api.patch(`/groups/${groupId}`, data),
    delete: (groupId) => api.delete(`/groups/${groupId}`),
    addMembers: (groupId, memberIds) => api.post(`/groups/${groupId}/members`, { memberIds }),
    removeMember: (groupId, memberId) => api.delete(`/groups/${groupId}/members/${memberId}`),
    makeAdmin: (groupId, memberId) => api.post(`/groups/${groupId}/admins/${memberId}`),
    removeAdmin: (groupId, memberId) => api.delete(`/groups/${groupId}/admins/${memberId}`),
    leave: (groupId) => api.post(`/groups/${groupId}/leave`),
    join: (groupId) => api.post(`/groups/${groupId}/join`),
    getInviteLink: (groupId) => api.get(`/groups/${groupId}/invite-link`),
    resetInviteLink: (groupId) => api.post(`/groups/${groupId}/reset-invite-link`),
  },

  // Stories
  stories: {
    getAll: () => api.get('/stories'),
    create: (formData) => api.post('/stories', formData),
    get: (storyId) => api.get(`/stories/${storyId}`),
    delete: (storyId) => api.delete(`/stories/${storyId}`),
    view: (storyId) => api.post(`/stories/${storyId}/view`),
    getViewers: (storyId) => api.get(`/stories/${storyId}/viewers`),
    reply: (storyId, message) => api.post(`/stories/${storyId}/reply`, { message }),
    mute: (userId) => api.post(`/stories/mute/${userId}`),
    unmute: (userId) => api.post(`/stories/unmute/${userId}`),
  },

  // Channels
  channels: {
    getAll: () => api.get('/channels'),
    create: (data) => api.post('/channels', data),
    get: (channelId) => api.get(`/channels/${channelId}`),
    update: (channelId, data) => api.patch(`/channels/${channelId}`, data),
    delete: (channelId) => api.delete(`/channels/${channelId}`),
    subscribe: (channelId) => api.post(`/channels/${channelId}/subscribe`),
    unsubscribe: (channelId) => api.post(`/channels/${channelId}/unsubscribe`),
    post: (channelId, formData) => api.post(`/channels/${channelId}/posts`, formData),
    getStats: (channelId) => api.get(`/channels/${channelId}/stats`),
  },

  // Calls
  calls: {
    initiate: (data) => api.post('/calls/initiate', data),
    accept: (callId) => api.post(`/calls/${callId}/accept`),
    reject: (callId) => api.post(`/calls/${callId}/reject`),
    end: (callId) => api.post(`/calls/${callId}/end`),
    getHistory: () => api.get('/calls/history'),
    getActive: () => api.get('/calls/active'),
  },

  // Notifications
  notifications: {
    getAll: () => api.get('/notifications'),
    markAsRead: (notificationId) => api.post(`/notifications/${notificationId}/read`),
    markAllAsRead: () => api.post('/notifications/read-all'),
    delete: (notificationId) => api.delete(`/notifications/${notificationId}`),
    updateSettings: (settings) => api.patch('/notifications/settings', settings),
    getSettings: () => api.get('/notifications/settings'),
  },

  // File upload
  upload: {
    file: (formData, onProgress) => 
      api.post('/upload/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: onProgress,
      }),
    image: (formData, onProgress) =>
      api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: onProgress,
      }),
    getSignedUrl: (fileName, fileType) =>
      api.post('/upload/signed-url', { fileName, fileType }),
  },

  // Settings
  settings: {
    getPrivacy: () => api.get('/settings/privacy'),
    updatePrivacy: (settings) => api.patch('/settings/privacy', settings),
    getSecurity: () => api.get('/settings/security'),
    updateSecurity: (settings) => api.patch('/settings/security', settings),
    enable2FA: () => api.post('/settings/2fa/enable'),
    disable2FA: (code) => api.post('/settings/2fa/disable', { code }),
    verify2FA: (code) => api.post('/settings/2fa/verify', { code }),
    getDevices: () => api.get('/settings/devices'),
    removeDevice: (deviceId) => api.delete(`/settings/devices/${deviceId}`),
  },
}

// Export both the instance and service methods
export { apiService }
export default api