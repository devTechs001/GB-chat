import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

      // Add notification
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

      // Update settings
      updateSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }))
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