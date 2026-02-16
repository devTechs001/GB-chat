import { useEffect, useCallback } from 'react'
import useNotificationStore from '../store/useNotificationStore'
import soundManager from '../lib/soundManager'

const useNotification = () => {
  const {
    notifications,
    unreadCount,
    permission,
    settings,
    requestPermission,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    updateSettings,
  } = useNotificationStore()

  useEffect(() => {
    // Request permission on mount if not already granted
    if (permission === 'default' && settings.enabled) {
      requestPermission()
    }
  }, [])

  const showNotification = useCallback(
    (notification) => {
      if (!settings.enabled) return

      addNotification(notification)

      // Play sound
      if (settings.sound) {
        soundManager.playNotification()
      }

      // Show browser notification
      if (permission === 'granted' && settings.desktop) {
        new Notification(notification.title, {
          body: notification.body,
          icon: notification.icon || '/favicon.svg',
          badge: '/favicon.svg',
          tag: notification.tag,
          silent: !settings.sound,
        })
      }
    },
    [permission, settings, addNotification]
  )

  const showMessageNotification = useCallback(
    (message, sender) => {
      showNotification({
        title: sender.name,
        body: settings.messagePreview ? message.content : 'New message',
        icon: sender.avatar,
        tag: `message-${message._id}`,
        data: {
          type: 'message',
          chatId: message.chat,
          messageId: message._id,
        },
      })
    },
    [showNotification, settings.messagePreview]
  )

  const showCallNotification = useCallback(
    (caller, callType) => {
      showNotification({
        title: `Incoming ${callType} call`,
        body: `${caller.name} is calling...`,
        icon: caller.avatar,
        tag: `call-${caller._id}`,
        data: {
          type: 'call',
          callerId: caller._id,
          callType,
        },
      })
    },
    [showNotification]
  )

  return {
    notifications,
    unreadCount,
    permission,
    settings,
    requestPermission,
    showNotification,
    showMessageNotification,
    showCallNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    updateSettings,
  }
}

export default useNotification