import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/api'
import toast from 'react-hot-toast'

const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      permission: 'default',
      settings: {
        enabled: true,
        sound: true,
        vibration: true,
        desktop: true,
        messagePreview: true,
        groupMessages: true,
        callNotifications: true,
      },

      // Request permission
      requestPermission: async () => {
        if (!('Notification' in window)) {
          console.log('This browser does not support notifications')
          return false
        }

        const permission = await Notification.requestPermission()
        set({ permission })
        return permission === 'granted'
      },

      /* ---------------- Server-backed feed ---------------- */
      isLoading: false,
      feedError: null,

      fetchNotifications: async ({ silent = false } = {}) => {
        if (!silent) set({ isLoading: true, feedError: null })
        try {
          const { data } = await api.get('/notifications', { params: { limit: 40 } })
          set({
            notifications: data?.notifications || [],
            unreadCount: data?.unreadCount ?? 0,
            hasMore: Boolean(data?.pagination?.hasMore),
            isLoading: false,
          })
          return { success: true }
        } catch (error) {
          set({
            isLoading: false,
            feedError:
              error?.response?.status === 401
                ? 'Sign in to see notifications'
                : 'Could not load notifications',
          })
          return { success: false }
        }
      },

      fetchUnreadCount: async () => {
        try {
          const { data } = await api.get('/notifications/unread-count')
          set({ unreadCount: data?.unreadCount ?? 0 })
        } catch {
          /* badge is best-effort */
        }
      },

      markAsReadRemote: async (notificationId) => {
        const previous = get().notifications
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n._id === notificationId ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(
            0,
            state.unreadCount - (previous.find((n) => n._id === notificationId && !n.isRead) ? 1 : 0)
          ),
        }))
        try {
          await api.patch(`/notifications/${notificationId}/read`)
        } catch {
          set({ notifications: previous })
        }
      },

      markAllReadRemote: async () => {
        const previous = get().notifications
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        }))
        try {
          await api.patch('/notifications/read-all')
        } catch {
          set({ notifications: previous })
        }
      },

      removeNotification: async (notificationId) => {
        const previous = get().notifications
        set((state) => ({
          notifications: state.notifications.filter((n) => n._id !== notificationId),
        }))
        try {
          await api.delete(`/notifications/${notificationId}`)
        } catch {
          set({ notifications: previous })
        }
      },

      clearAllRemote: async () => {
        try {
          await api.delete('/notifications')
        } catch {
          /* clear locally regardless */
        }
        set({ notifications: [], unreadCount: 0 })
      },

      // Add notification (local echo, e.g. from a socket event)
      addNotification: (notification) => {
        const newNotification = {
          id: Date.now() + Math.random(),
          ...notification,
          read: false,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }))

        // Show system notification
        get().showSystemNotification(newNotification)
      },

      // Show system notification
      showSystemNotification: (notification) => {
        const { permission, settings } = get()

        if (permission !== 'granted' || !settings.enabled || !settings.desktop) {
          return
        }

        const systemNotification = new Notification(notification.title, {
          body: notification.body,
          icon: notification.icon || '/logo.png',
          badge: '/badge.png',
          tag: notification.tag,
          requireInteraction: false,
          silent: !settings.sound,
        })

        // Vibrate if enabled
        if (settings.vibration && navigator.vibrate) {
          navigator.vibrate([200, 100, 200])
        }

        // Play sound if enabled
        if (settings.sound) {
          get().playNotificationSound()
        }

        systemNotification.onclick = () => {
          window.focus()
          if (notification.onClick) {
            notification.onClick()
          }
          systemNotification.close()
        }
      },

      // Play notification sound
      playNotificationSound: () => {
        try {
          const audio = new Audio('/notification.mp3')
          audio.volume = 0.5
          audio.play().catch(console.error)
        } catch (error) {
          console.error('Failed to play notification sound:', error)
        }
      },

      // Mark as read
      markAsRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }))
      },

      // Mark all as read
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }))
      },

      // Delete notification
      deleteNotification: (notificationId) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === notificationId)
          return {
            notifications: state.notifications.filter((n) => n.id !== notificationId),
            unreadCount: notification && !notification.read
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount,
          }
        })
      },

      // Clear all notifications
      clearAll: () => {
        set({
          notifications: [],
          unreadCount: 0,
        })
      },

      // Update settings (persisted to the account via PUT /notifications/settings)
      updateSettings: async (settings) => {
        const previous = get().settings
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }))
        try {
          const { data } = await api.put('/notifications/settings', {
            ...get().settings,
            ...settings,
          })
          if (data?.data) {
            set((state) => ({ settings: { ...state.settings, ...data.data } }))
          }
        } catch (error) {
          set({ settings: previous })
          toast.error('Could not save notification settings')
        }
      },

      /** Load the account's saved notification settings */
      loadSettings: async () => {
        try {
          const { data } = await api.get('/notifications/settings')
          if (data?.data) {
            set((state) => ({ settings: { ...state.settings, ...data.data } }))
          }
          return { success: true }
        } catch {
          return { success: false }
        }
      },

      // Get unread notifications
      getUnreadNotifications: () => {
        return get().notifications.filter((n) => !n.read)
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        settings: state.settings,
        permission: state.permission,
      }),
    }
  )
)

export default useNotificationStore