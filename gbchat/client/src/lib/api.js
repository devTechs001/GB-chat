import axios from 'axios'
import toast from 'react-hot-toast'

/**
 * Default to a same-origin relative URL.
 * - Production/CDN: served next to the API (or behind a proxy)
 * - Dev: `vite.config.js` proxies `/api` to the Express server
 * - Override with VITE_API_URL when the API lives on another host.
 */
const API_URL = import.meta.env.VITE_API_URL || '/api'

export const isDemoMode = () => {
  try {
    return localStorage.getItem('demo-mode') === 'true'
  } catch {
    return false
  }
}

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    config.headers['X-Request-ID'] = generateRequestId()

    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data)
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('[API Response]', response.data)
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config || {}
    const demo = isDemoMode()

    // Handle token refresh (once per request, never in demo mode)
    if (error.response?.status === 401 && !originalRequest._retry && !demo) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })

          localStorage.setItem('token', data.token)
          if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)

          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${data.token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/auth'
        return Promise.reject(refreshError)
      }
    }

    // Demo mode runs entirely on local sample data — stay quiet
    if (demo) {
      return Promise.reject(error)
    }

    if (!error.response) {
      if (error.code !== 'ERR_CANCELED') {
        toast.error('Network error. Please check your connection.')
      }
      return Promise.reject(error)
    }

    const message = error.response?.data?.message || 'Something went wrong'

    if (error.code !== 'ERR_CANCELED' && [400, 403, 404, 500].includes(error.response.status)) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

/**
 * apiService — 1:1 mirror of the Express routes mounted in `server/index.js`.
 * Keep this in sync with `docs/UI_AND_API_REVIEW.md`.
 */
const apiService = {
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
    phoneLogin: (data) => api.post('/auth/phone-login', data),
    requestPhoneVerification: (phone) => api.post('/auth/phone-verify', { phone }),
    resendPhoneVerification: (phone) => api.post('/auth/phone-verify/resend', { phone }),
    confirmPhoneVerification: (data) => api.post('/auth/phone-verify/confirm', data),
    verifyOTP: (data) => api.post('/auth/verify-otp', data),
    resendOTP: (email) => api.post('/auth/resend-otp', { email }),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    forgotPasswordPhone: (phone) => api.post('/auth/forgot-password/phone', { phone }),
    resetPasswordPhone: (data) => api.post('/auth/reset-password/phone', data),
    getProfile: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
  },

  users: {
    search: (query) => api.get('/users/search', { params: { q: query } }),
    getOnline: () => api.get('/users/online'),
    getProfile: (userId) => api.get(`/users/${userId}`),
    updateProfile: (data) => api.patch('/users/profile', data),
    updateAvatar: (formData) => api.post('/users/avatar', formData),
    getPrivacySettings: () => api.get('/users/privacy-settings'),
    updatePrivacySettings: (data) => api.patch('/users/privacy-settings', data),
    blockUser: (userId) => api.post(`/users/${userId}/block`),
    unblockUser: (userId) => api.post(`/users/${userId}/unblock`),
    getBlockedUsers: () => api.get('/users/blocked'),
  },

  chats: {
    getAll: () => api.get('/chats'),
    getArchived: () => api.get('/chats/archived'),
    create: (payload) => api.post('/chats', payload),
    get: (chatId) => api.get(`/chats/${chatId}`),
    delete: (chatId) => api.delete(`/chats/${chatId}`),
    clear: (chatId) => api.delete(`/chats/${chatId}/clear`),
    markAsRead: (chatId) => api.post(`/chats/${chatId}/read`),
    archive: (chatId) => api.put(`/chats/${chatId}/archive`),
    unarchive: (chatId) => api.put(`/chats/${chatId}/unarchive`),
    pin: (chatId) => api.put(`/chats/${chatId}/pin`),
    unpin: (chatId) => api.put(`/chats/${chatId}/unpin`),
    mute: (chatId, duration) => api.put(`/chats/${chatId}/mute`, { duration }),
    unmute: (chatId) => api.put(`/chats/${chatId}/unmute`),
    search: (chatId, query) => api.get(`/chats/${chatId}/search`, { params: { q: query } }),
    getMedia: (chatId) => api.get(`/chats/${chatId}/media`),
    report: (chatId, reason) => api.post(`/chats/${chatId}/report`, { reason }),
  },

  messages: {
    getAll: (chatId, params) => api.get(`/messages/${chatId}`, { params }),
    send: (chatId, formData) => api.post(`/messages/${chatId}`, formData),
    sendVoice: (chatId, formData) => api.post(`/messages/${chatId}/voice`, formData),
    search: (params) => api.get('/messages/search', { params }),
    edit: (messageId, content) => api.put(`/messages/${messageId}/edit`, { content }),
    delete: (messageId, forEveryone) => api.delete(`/messages/${messageId}`, { data: { forEveryone } }),
    react: (messageId, emoji) => api.post(`/messages/${messageId}/react`, { emoji }),
    removeReaction: (messageId, emoji) => api.delete(`/messages/${messageId}/react/${encodeURIComponent(emoji)}`),
    getReactions: (messageId) => api.get(`/messages/${messageId}/reactions`),
    star: (messageId) => api.post(`/messages/${messageId}/star`),
    unstar: (messageId) => api.post(`/messages/${messageId}/unstar`),
    getStarred: () => api.get('/messages/starred'),
    forward: (messageId, chatIds) => api.post(`/messages/${messageId}/forward`, { chatIds }),
    schedule: (data) => api.post('/messages/schedule', data),
    getScheduled: () => api.get('/messages/scheduled'),
    cancelScheduled: (messageId) => api.post('/messages/cancel-schedule', { messageId }),
  },

  groups: {
    create: (formData) => api.post('/groups', formData),
    get: (groupId) => api.get(`/groups/${groupId}`),
    update: (groupId, data) => api.put(`/groups/${groupId}`, data),
    delete: (groupId) => api.delete(`/groups/${groupId}`),
    addMembers: (groupId, memberIds) => api.post(`/groups/${groupId}/members`, { memberIds }),
    removeMember: (groupId, memberId) => api.delete(`/groups/${groupId}/members/${memberId}`),
    makeAdmin: (groupId, memberId) => api.put(`/groups/${groupId}/members/${memberId}/admin`),
    removeAdmin: (groupId, memberId) => api.delete(`/groups/${groupId}/members/${memberId}/admin`),
    updateSettings: (groupId, settings) => api.put(`/groups/${groupId}/settings`, settings),
    leave: (groupId) => api.post(`/groups/${groupId}/leave`),
    getPolls: (groupId) => api.get(`/groups/${groupId}/polls`),
    createPoll: (groupId, data) => api.post(`/groups/${groupId}/polls`, data),
    votePoll: (groupId, pollId, optionId) => api.post(`/groups/${groupId}/polls/${pollId}/vote`, { optionId }),
    endPoll: (groupId, pollId) => api.post(`/groups/${groupId}/polls/${pollId}/end`),
    getEvents: (groupId) => api.get(`/groups/${groupId}/events`),
    createEvent: (groupId, data) => api.post(`/groups/${groupId}/events`, data),
    rsvpEvent: (groupId, eventId, status) => api.post(`/groups/${groupId}/events/${eventId}/rsvp`, { status }),
    deleteEvent: (groupId, eventId) => api.delete(`/groups/${groupId}/events/${eventId}`),
    archive: (groupId) => api.patch(`/groups/${groupId}/archive`),
    star: (groupId) => api.patch(`/groups/${groupId}/star`),
    mute: (groupId) => api.patch(`/groups/${groupId}/mute`),
    bulkInvite: (groupIds, memberIds) => api.post('/groups/bulk-invite', { groupIds, memberIds }),
    exportGroups: (groupIds) => api.post('/groups/export', { groups: groupIds }),
    getAnnouncements: (groupId) => api.get(`/groups/${groupId}/announcements`),
    createAnnouncement: (groupId, data) => api.post(`/groups/${groupId}/announcements`, data),
    pinAnnouncement: (groupId, announcementId) =>
      api.post(`/groups/${groupId}/announcements/${announcementId}/pin`),
    deleteAnnouncement: (groupId, announcementId) =>
      api.delete(`/groups/${groupId}/announcements/${announcementId}`),
  },

  stories: {
    getAll: () => api.get('/stories'),
    getMine: () => api.get('/stories/mine'),
    create: (formData) => api.post('/stories', formData),
    get: (storyId) => api.get(`/stories/${storyId}`),
    delete: (storyId) => api.delete(`/stories/${storyId}`),
    view: (storyId) => api.post(`/stories/${storyId}/view`),
    getViewers: (storyId) => api.get(`/stories/${storyId}/viewers`),
    react: (storyId, reaction) => api.post(`/stories/${storyId}/react`, { reaction }),
    reply: (storyId, message) => api.post(`/stories/${storyId}/reply`, { message }),
    save: (storyId) => api.post(`/stories/${storyId}/save`),
  },

  channels: {
    getAll: () => api.get('/channels'),
    getMine: () => api.get('/channels/mine'),
    create: (data) => api.post('/channels', data),
    get: (channelId) => api.get(`/channels/${channelId}`),
    update: (channelId, data) => api.patch(`/channels/${channelId}`, data),
    delete: (channelId) => api.delete(`/channels/${channelId}`),
    subscribe: (channelId) => api.post(`/channels/${channelId}/subscribe`),
    unsubscribe: (channelId) => api.post(`/channels/${channelId}/unsubscribe`),
    getPosts: (channelId) => api.get(`/channels/${channelId}/posts`),
    createPost: (channelId, formData) => api.post(`/channels/${channelId}/posts`, formData),
    getStats: (channelId) => api.get(`/channels/${channelId}/stats`),
    likePost: (postId) => api.post(`/channels/posts/${postId}/like`),
  },

  calls: {
    initiate: (data) => api.post('/calls/initiate', data),
    accept: (callId) => api.post(`/calls/${callId}/accept`),
    reject: (callId) => api.post(`/calls/${callId}/reject`),
    end: (callId) => api.post(`/calls/${callId}/end`),
    cancel: (callId) => api.post(`/calls/${callId}/cancel`),
    getHistory: () => api.get('/calls/history'),
    getActive: () => api.get('/calls/active'),
    getStats: () => api.get('/calls/stats'),
    get: (callId) => api.get(`/calls/${callId}`),
  },

  contacts: {
    getAll: () => api.get('/contacts'),
    get: (contactId) => api.get(`/contacts/${contactId}`),
    add: (data) => api.post('/contacts', data),
    update: (contactId, data) => api.patch(`/contacts/${contactId}`, data),
    remove: (contactId) => api.delete(`/contacts/${contactId}`),
    toggleFavorite: (contactId) => api.patch(`/contacts/${contactId}/favorite`),
    toggleBlock: (contactId) => api.patch(`/contacts/${contactId}/block`),
    import: (contacts) => api.post('/contacts/import', { contacts }),
    export: () => api.get('/contacts/export'),
    getStats: () => api.get('/contacts/stats'),
  },

  notifications: {
    getSettings: () => api.get('/notifications/settings'),
    updateSettings: (settings) => api.put('/notifications/settings', settings),
    toggle: (setting) => api.post(`/notifications/toggle/${setting}`),
    getSounds: () => api.get('/notifications/sounds'),
    setSound: (sound) => api.post('/notifications/sound', { sound }),
    toggleDND: () => api.post('/notifications/dnd'),
    setDNDSchedule: (schedule) => api.post('/notifications/dnd/schedule', schedule),
    requestPermission: () => api.post('/notifications/permission'),
    sendTest: () => api.post('/notifications/test'),
  },

  chatLock: {
    getLocked: () => api.get('/chat-lock/locked'),
    unlockBiometric: (data) => api.post('/chat-lock/unlock-biometric', data),
    getStatus: (chatId) => api.get(`/chat-lock/status/${chatId}`),
    lock: (data) => api.post('/chat-lock/lock', data),
    unlock: (data) => api.post('/chat-lock/unlock', data),
    toggle: (data) => api.post('/chat-lock/toggle', data),
    quickToggle: (chatId) => api.post(`/chat-lock/${chatId}/toggle`),
    updateSettings: (chatId, settings) => api.put(`/chat-lock/${chatId}/settings`, settings),
    remove: (chatId) => api.delete('/chat-lock/remove', { data: { chatId } }),
  },

  devices: {
    generateQR: () => api.post('/devices/generate-qr'),
    verifyQR: (data) => api.post('/devices/verify-qr', data),
    getQRStatus: (deviceId) => api.get(`/devices/qr-status/${deviceId}`),
    generateLinkCode: () => api.post('/devices/generate-code'),
    verifyLinkCode: (code) => api.post('/devices/verify-code', { code }),
    getLinked: () => api.get('/devices/linked'),
    unlink: (deviceId) => api.delete(`/devices/${deviceId}`),
    refresh: (deviceId) => api.post(`/devices/${deviceId}/refresh`),
    heartbeat: (deviceId) => api.post(`/devices/${deviceId}/heartbeat`),
    linkPhone: (data) => api.post('/devices/link-phone', data),
  },

  privacy: {
    getSettings: () => api.get('/privacy/settings'),
    updateSettings: (settings) => api.put('/privacy/settings', settings),
    getBlocked: () => api.get('/privacy/blocked'),
    block: (userId) => api.post(`/privacy/block/${userId}`),
    unblock: (userId) => api.post(`/privacy/unblock/${userId}`),
    isBlocked: (userId) => api.get(`/privacy/is-blocked/${userId}`),
    toggleDisappearing: (data) => api.post('/privacy/disappearing-messages', data),
    updateLastSeen: (data) => api.post('/privacy/last-seen', data),
    updateGroupPrivacy: (data) => api.post('/privacy/groups', data),
  },

  settings: {
    // privacy + security live under /api/privacy and /api/account
    getPrivacy: () => api.get('/privacy/settings'),
    updatePrivacy: (settings) => api.put('/privacy/settings', settings),
    getAccount: () => api.get('/account/settings'),
    changePassword: (data) => api.post('/account/change-password', data),
    updateAccount: (settings) => api.put('/account/settings', settings),
    getSessions: () => api.get('/account/sessions'),
    logoutSession: (sessionId) => api.post(`/account/sessions/logout/${sessionId}`),
    logoutAllSessions: () => api.post('/account/sessions/logout-all'),
    enable2FA: () => api.post('/account/2fa/enable'),
    disable2FA: (code) => api.post('/account/2fa/disable', { code }),
    verify2FA: (code) => api.post('/account/2fa/verify', { code }),
    getDevices: () => api.get('/devices/linked'),
    removeDevice: (deviceId) => api.delete(`/devices/${deviceId}`),
    exportData: () => api.get('/account/export'),
  },

  appearance: {
    getSettings: () => api.get('/appearance/settings'),
    updateSettings: (data) => api.put('/appearance/settings', data),
    getThemes: () => api.get('/appearance/themes'),
    setTheme: (theme) => api.post('/appearance/theme', { theme }),
    getWallpapers: () => api.get('/appearance/wallpapers'),
    setWallpaper: (data) => api.post('/appearance/wallpaper', data),
    reset: () => api.post('/appearance/reset'),
  },

  chatSettings: {
    get: () => api.get('/chat-settings'),
    update: (data) => api.put('/chat-settings', data),
    toggle: (setting) => api.post(`/chat-settings/toggle/${setting}`),
    getFolders: () => api.get('/chat-settings/folders'),
    createFolder: (data) => api.post('/chat-settings/folders', data),
    updateFolder: (folderId, data) => api.put(`/chat-settings/folders/${folderId}`, data),
    deleteFolder: (folderId) => api.delete(`/chat-settings/folders/${folderId}`),
  },

  storage: {
    getUsage: () => api.get('/storage/usage'),
    clear: (type) => api.delete(`/storage/clear/${type}`),
    clearCache: () => api.post('/storage/clear-cache'),
    clearTemp: () => api.post('/storage/clear-temp'),
    getNetworkUsage: () => api.get('/storage/network-usage'),
    getByChat: () => api.get('/storage/by-chat'),
  },

  translations: {
    getLanguages: () => api.get('/translations/languages'),
    detect: (text) => api.post('/translations/detect', { text }),
    translateText: (text, targetLang, sourceLang) =>
      api.post('/translations/translate-text', { text, targetLang, sourceLang }),
    translateMessage: (messageId, targetLang) =>
      api.post('/translations/translate', { messageId, targetLang }),
  },

  gbFeatures: {
    get: () => api.get('/gb-features'),
    update: (data) => api.put('/gb-features', data),
    toggle: (feature) => api.post('/gb-features/toggle', { feature }),
    getPinned: () => api.get('/gb-features/pinned'),
    pin: (messageId) => api.post('/gb-features/pin', { messageId }),
    unpin: (messageId) => api.post('/gb-features/unpin', { messageId }),
    getStarred: () => api.get('/gb-features/starred'),
    star: (messageId) => api.post('/gb-features/star', { messageId }),
    unstar: (messageId) => api.post('/gb-features/unstar', { messageId }),
    getScheduled: () => api.get('/gb-features/scheduled'),
    schedule: (data) => api.post('/gb-features/schedule', data),
    cancelScheduled: (messageId) => api.post('/gb-features/cancel-schedule', { messageId }),
  },

  gbSettings: {
    getAll: () => api.get('/gb-settings'),
    updateAll: (data) => api.put('/gb-settings', data),
    reset: () => api.post('/gb-settings/reset'),
    getPrivacy: () => api.get('/gb-settings/privacy'),
    updatePrivacy: (data) => api.put('/gb-settings/privacy', data),
    getMessaging: () => api.get('/gb-settings/messaging'),
    updateMessaging: (data) => api.put('/gb-settings/messaging', data),
    getMedia: () => api.get('/gb-settings/media'),
    updateMedia: (data) => api.put('/gb-settings/media', data),
  },

  emoji: {
    getAll: () => api.get('/emoji/all'),
    getCategories: () => api.get('/emoji/categories'),
    getCategory: (categoryId) => api.get(`/emoji/category/${categoryId}`),
    search: (query) => api.get('/emoji/search', { params: { q: query } }),
    getFrequent: () => api.get('/emoji/frequent'),
    addFrequent: (emoji) => api.post('/emoji/frequent', { emoji }),
  },
}

export { apiService, API_URL }
export default api
