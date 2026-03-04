import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'

const defaultFeatures = {
  privacy: {
    hideOnlineStatus: false,
    freezeLastSeen: false,
    hideBlueTicks: false,
    hideSecondTick: false,
    hideForwardLabel: false,
    antiStatusView: false,
    antiDeleteStatus: false,
    antiRevoke: false,
    viewOnceBypass: false,
    incognitoMode: false,
    ghostMode: false,
    airplaneMode: false,
  },
  messaging: {
    dndMode: {
      enabled: false,
      startTime: '22:00',
      endTime: '07:00',
    },
    autoDeleteMessages: false,
    chatFilters: [],
  },
  display: {
    showNetworkIndicator: false,
    showConnectionQuality: false,
    showTypingIndicator: true,
    showOnlineStatus: true,
  },
  advanced: {
    exactTimestamps: false,
    showLastSeenExact: false,
    showDeliveryTime: false,
    copySentMessages: false,
    extendedStatusLimit: false,
    confirmClearChats: true,
    archiveOnSwipe: false,
    enterToSend: true,
    doubleTapToReply: false,
    maximumCallQuality: 'HD',
  },
  theme: {
    bubbleStyle: 'modern',
    fontSize: 14,
    theme: 'default',
    messageAnimation: 'slide',
  },
}

const useGBFeaturesStore = create((set, get) => ({
  gbFeatures: null,
  chatSpecificFeatures: {},
  isLoading: false,

  // Fetch GB features from API
  fetchGBFeatures: async () => {
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.get('/api/gb-features', {
        headers: { Authorization: `Bearer ${token}` }
      })
      set({ gbFeatures: data.data })
    } catch (error) {
      console.error('Failed to fetch GB features:', error)
    }
  },

  // Toggle a feature
  toggleFeature: async (section, feature) => {
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.post(
        '/api/gb-features/toggle',
        { section, feature },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      set({ gbFeatures: data.data })
      return data.data
    } catch (error) {
      toast.error('Failed to toggle feature')
      return null
    }
  },

  // Update GB features
  updateGBFeatures: async (section, data) => {
    try {
      const token = localStorage.getItem('token')
      const { response } = await axios.put(
        '/api/gb-features',
        { section, data },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      set({ gbFeatures: response.data.data })
      toast.success('Settings updated')
    } catch (error) {
      toast.error('Failed to update settings')
    }
  },

  // Quick setting toggle (for header quick settings)
  toggleQuickSetting: async (settingId) => {
    const { gbFeatures } = get()

    try {
      const token = localStorage.getItem('token')

      if (settingId === 'dndMode') {
        const newData = {
          messaging: {
            dndMode: {
              ...gbFeatures?.messaging?.dndMode,
              enabled: !gbFeatures?.messaging?.dndMode?.enabled
            }
          }
        }
        const { data } = await axios.put(
          '/api/gb-features',
          newData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        set({ gbFeatures: data.data })
        toast.success(`DND Mode ${data.data.messaging.dndMode.enabled ? 'enabled' : 'disabled'}`)
      } else if (settingId === 'readReceipts') {
        // Toggle hideBlueTicks (inverse of read receipts)
        const { data } = await axios.post(
          '/api/gb-features/toggle',
          { section: 'privacy', feature: 'hideBlueTicks' },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        set({ gbFeatures: data.data })
        toast.success(`Read Receipts ${data.data.privacy.hideBlueTicks ? 'disabled' : 'enabled'}`)
      } else if (defaultFeatures.display[settingId] !== undefined) {
        // Handle display settings
        const currentVal = gbFeatures?.display?.[settingId] || defaultFeatures.display[settingId]
        const { data } = await axios.put(
          '/api/gb-features',
          { display: { [settingId]: !currentVal } },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        set({ gbFeatures: data.data })
        toast.success(`${settingId} ${!currentVal ? 'enabled' : 'disabled'}`)
      } else {
        // Generic toggle for privacy features
        const { data } = await axios.post(
          '/api/gb-features/toggle',
          { section: 'privacy', feature: settingId },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        set({ gbFeatures: data.data })
        toast.success(`${settingId} ${data.data.privacy[settingId] ? 'enabled' : 'disabled'}`)
      }
    } catch (error) {
      toast.error('Failed to update setting')
    }
  },

  // Update chat-specific features
  updateChatSpecificFeatures: (chatId, features) => {
    set((state) => ({
      chatSpecificFeatures: {
        ...state.chatSpecificFeatures,
        [chatId]: {
          ...state.chatSpecificFeatures[chatId],
          ...features
        }
      }
    }))
  },

  // Get chat-specific features
  getChatFeatures: (chatId) => {
    const { chatSpecificFeatures } = get()
    return chatSpecificFeatures[chatId] || {}
  },

  // Initialize GB features on app start
  initGBFeatures: async () => {
    await get().fetchGBFeatures()
  },
}))

export default useGBFeaturesStore
