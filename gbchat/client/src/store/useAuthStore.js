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

      login: async (credentials) => {
        set({ isLoading: true })
        try {
          console.log('Attempting login with credentials:', credentials) // Debug log
          const { data } = await api.post('/auth/login', credentials)
          console.log('Login response received:', data) // Debug log

          let { user, token, refreshToken } = data

          // Persist tokens to localStorage for other parts of the app
          if (token) localStorage.setItem('token', token)
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken)

          // If backend returned only token, fetch user profile
          if (!user && token) {
            try {
              const res = await api.get('/auth/me')
              user = res.data.user
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
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
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
          const { data } = await api.patch('/users/profile', updates)
          set({ user: data.user })
          toast.success('Profile updated successfully')
          return { success: true }
        } catch (error) {
          toast.error(error.response?.data?.message || 'Update failed')
          return { success: false, error: error.response?.data?.message }
        }
      },

      updateAvatar: async (file) => {
        const formData = new FormData()
        formData.append('avatar', file)
        
        try {
          const { data } = await api.post('/users/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          set({ user: data.user })
          toast.success('Avatar updated successfully')
          return { success: true }
        } catch (error) {
          toast.error(error.response?.data?.message || 'Upload failed')
          return { success: false, error: error.response?.data?.message }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore