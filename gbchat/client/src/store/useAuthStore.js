import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/api'
import toast from 'react-hot-toast'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      privacySettings: {
        ghostMode: false,
        readReceipts: true,
        showOnlineStatus: true,
        showLastSeen: true,
        showProfilePhoto: true,
        showStatus: true,
        // GB WhatsApp Advanced Privacy
        freezeLastSeen: false,       // Freeze last seen at a specific time
        antiDeleteMessages: false,   // See deleted messages
        hideBlueTicksFor: 'nobody',  // 'nobody', 'contacts', 'everyone'
        hideSecondTick: false,       // Hide delivery receipts
        dndMode: false,              // Do Not Disturb - no notifications
        whoCanCallMe: 'everyone',    // 'everyone', 'contacts', 'nobody'
        antiViewOnce: false,         // Disable view once media auto-delete
        hideTyping: false,           // Don't show typing indicator
        hideRecording: false,        // Don't show recording indicator
      },

      login: async (credentials) => {
        set({ isLoading: true })
        try {
          console.log('Attempting login with credentials:', credentials) // Debug log
          const { data } = await api.post('/auth/login', credentials)
          console.log('Login response received:', data) // Debug log

          // Backend returns user data directly (not wrapped in 'user' property)
          let user = data.user || data
          let token = data.token

          // Persist tokens to localStorage for other parts of the app
          if (token) localStorage.setItem('token', token)

          // If backend returned only token, fetch user profile
          if (!user && token) {
            try {
              const res = await api.get('/auth/me')
              // /auth/me returns user directly (not wrapped)
              user = res.data
            } catch (err) {
              console.error('Failed to fetch user after login:', err)
            }
          }

          set({
            user,
            token,
            isAuthenticated: !!token,
            isLoading: false,
          })

          // Set token in axios defaults
          if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`

          toast.success('Welcome back!')
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          console.error('Login error:', error) // Debug log
          console.error('Error response:', error.response) // Debug log

          const errorMessage = error.response?.data?.message || error.message || 'Login failed'
          toast.error(errorMessage)
          return { success: false, error: errorMessage }
        }
      },

      phoneLogin: async (phone, code) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/phone-login', { phone, code })
          let { user, token, refreshToken } = data

          if (token) localStorage.setItem('token', token)
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken)

          if (!user && token) {
            try {
              const res = await api.get('/auth/me')
              user = res.data.user
            } catch (err) {
              console.error('Failed to fetch user after phone login:', err)
            }
          }

          set({
            user,
            token,
            isAuthenticated: !!token,
            isLoading: false,
          })

          if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`

          toast.success('Welcome back!')
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          toast.error(error.response?.data?.message || 'Phone login failed')
          return { success: false, error: error.response?.data?.message }
        }
      },

      initiatePhoneVerification: async (phone) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/phone-verify', { phone })
          set({ isLoading: false })
          toast.success(data.message || 'Verification code sent')
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          toast.error(error.response?.data?.message || 'Failed to send verification code')
          return { success: false, error: error.response?.data?.message }
        }
      },

      resendVerificationCode: async (phone) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/phone-verify/resend', { phone })
          set({ isLoading: false })
          toast.success(data.message || 'New verification code sent')
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          toast.error(error.response?.data?.message || 'Failed to resend verification code')
          return { success: false, error: error.response?.data?.message }
        }
      },

      register: async (userData) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/register', userData)
          let { user, token, refreshToken } = data

          if (token) localStorage.setItem('token', token)
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken)

          if (!user && token) {
            try {
              const res = await api.get('/auth/me')
              user = res.data.user
            } catch (err) {
              console.error('Failed to fetch user after register:', err)
            }
          }

          set({
            user,
            token,
            isAuthenticated: !!token,
            isLoading: false,
          })

          if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`

          toast.success('Registration successful!')
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          toast.error(error.response?.data?.message || 'Registration failed')
          return { success: false, error: error.response?.data?.message }
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
        delete api.defaults.headers.common['Authorization']
        toast.success('Logged out successfully')
      },

      checkAuth: async () => {
        const token = get().token
        if (!token) {
          set({ isLoading: false })
          return
        }

        set({ isLoading: true })
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`

        try {
          const { data } = await api.get('/auth/me')
          console.log('[Auth] checkAuth response:', data)

          // /auth/me returns user directly (not wrapped)
          const userData = data

          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          })
          console.log('[Auth] User set:', userData)
        } catch (error) {
          console.error('[Auth] checkAuth error:', error)
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
          delete api.defaults.headers.common['Authorization']
        }
      },

      updateProfile: async (updates) => {
        try {
          // Map frontend fields to backend fields
          const backendUpdates = {}
          if (updates.name) backendUpdates.fullName = updates.name
          if (updates.about) backendUpdates.about = updates.about
          if (updates.phone) backendUpdates.phone = updates.phone

          const { data } = await api.put('/auth/profile', backendUpdates)
          // Backend returns user directly
          set({ user: data })
          toast.success('Profile updated successfully')
          return { success: true }
        } catch (error) {
          console.error('Profile update error:', error)
          toast.error(error.response?.data?.message || 'Update failed')
          return { success: false, error: error.response?.data?.message }
        }
      },

      updateAvatar: async (file) => {
        const formData = new FormData()
        formData.append('avatar', file)

        try {
          // Use /users/avatar endpoint
          const { data } = await api.post('/users/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          // Backend returns user directly
          set({ user: data })
          toast.success('Avatar updated successfully')
          return { success: true }
        } catch (error) {
          console.error('Avatar upload error:', error)
          toast.error(error.response?.data?.message || 'Upload failed')
          return { success: false, error: error.response?.data?.message }
        }
      },

      updatePrivacySettings: async (newSettings) => {
        try {
          const { data } = await api.patch('/users/privacy-settings', newSettings)
          set({ privacySettings: data.privacySettings || newSettings })
          toast.success('Privacy settings updated')
          return { success: true }
        } catch (error) {
          // If API fails, still update locally for better UX
          set({ privacySettings: { ...get().privacySettings, ...newSettings } })
          toast.success('Privacy settings updated')
          return { success: true }
        }
      },

      toggleGhostMode: async () => {
        const currentGhostMode = get().privacySettings.ghostMode
        const newGhostMode = !currentGhostMode

        // Ghost mode affects other settings
        const newSettings = {
          ghostMode: newGhostMode,
          readReceipts: newGhostMode ? false : true,
          showOnlineStatus: newGhostMode ? false : true,
          showLastSeen: newGhostMode ? false : true,
        }

        return get().updatePrivacySettings(newSettings)
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        privacySettings: state.privacySettings,
      }),
    }
  )
)

export default useAuthStore