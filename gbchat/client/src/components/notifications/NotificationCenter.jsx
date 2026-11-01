import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  BellIcon,
  BellAlertIcon,
  HeartIcon,
  ChatBubbleLeftEllipsisIcon,
  UserPlusIcon,
  PhoneXMarkIcon,
  ShieldCheckIcon,
  UsersIcon,
  EyeIcon,
  CheckIcon,
  TrashIcon,
  XMarkIcon,
  InboxIcon,
} from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'
import useNotificationStore from '../../store/useNotificationStore'
import useAuthStore from '../../store/useAuthStore'
import { ListSkeleton } from '../common/Skeleton'
import EmptyState from '../layout/EmptyState'

const TYPE_ICON = {
  story_reaction: HeartIcon,
  story_reply: ChatBubbleLeftEllipsisIcon,
  story_view: EyeIcon,
  group_invite: UsersIcon,
  group_mention: UsersIcon,
  contact_request: UserPlusIcon,
  contact_accepted: UserPlusIcon,
  missed_call: PhoneXMarkIcon,
  security: ShieldCheckIcon,
  message: ChatBubbleLeftEllipsisIcon,
  system: BellIcon,
}

const TYPE_TONE = {
  story_reaction: 'text-rose-500 bg-rose-500/10',
  story_reply: 'text-sky-500 bg-sky-500/10',
  story_view: 'text-violet-500 bg-violet-500/10',
  group_invite: 'text-emerald-500 bg-emerald-500/10',
  group_mention: 'text-emerald-500 bg-emerald-500/10',
  contact_request: 'text-amber-500 bg-amber-500/10',
  contact_accepted: 'text-amber-500 bg-amber-500/10',
  missed_call: 'text-red-500 bg-red-500/10',
  security: 'text-indigo-500 bg-indigo-500/10',
  message: 'text-primary-500 bg-primary-500/10',
  system: 'text-gray-500 bg-gray-500/10',
}

const notificationTarget = (notification) => {
  if (notification.actionUrl) return notification.actionUrl
  if (notification.storyId) return '/stories'
  if (notification.groupId) return '/groups'
  if (notification.callId) return '/calls'
  if (notification.chatId) return `/?chat=${notification.chatId}`
  return null
}

/**
 * NotificationCenter — bell trigger + slide-over feed.
 * Backed by GET/PATCH/DELETE /api/notifications.
 */
const NotificationCenter = ({ variant = 'icon', className }) => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    notifications,
    unreadCount,
    isLoading,
    feedError,
    fetchNotifications,
    fetchUnreadCount,
    markAsReadRemote,
    markAllReadRemote,
    removeNotification,
    clearAllRemote,
    requestPermission,
    permission,
  } = useNotificationStore()

  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const panelRef = useRef(null)

  useEffect(() => {
    if (!user) return
    fetchNotifications({ silent: true })
    fetchUnreadCount()
    const interval = setInterval(() => fetchUnreadCount(), 60000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id])

  useEffect(() => {
    if (!open) return undefined
    fetchNotifications({ silent: notifications.length > 0 })

    const onKeyDown = (event) => event.key === 'Escape' && setOpen(false)
    const onClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onClickOutside)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onClickOutside)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const visible = useMemo(() => {
    if (filter === 'unread') return notifications.filter((n) => !n.isRead)
    return notifications
  }, [notifications, filter])

  const handleOpenNotification = async (notification) => {
    if (!notification.isRead) await markAsReadRemote(notification._id)
    const target = notificationTarget(notification)
    if (target) {
      setOpen(false)
      navigate(target)
    }
  }

  const badge = unreadCount > 99 ? '99+' : unreadCount

  return (
    <div className={clsx('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={open}
        className={clsx(
          'relative flex items-center rounded-xl transition-colors',
          variant === 'full'
            ? 'w-full gap-3 px-3 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            : 'p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        )}
      >
        {unreadCount > 0 ? (
          <BellAlertIcon className="w-5 h-5" />
        ) : (
          <BellIcon className="w-5 h-5" />
        )}
        {variant === 'full' && <span className="text-sm font-medium">Notifications</span>}
        {unreadCount > 0 && (
          <span
            className={clsx(
              'flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold',
              variant === 'full'
                ? 'ml-auto min-w-[20px] h-5 px-1.5'
                : 'absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1'
            )}
          >
            {badge}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            role="dialog"
            aria-label="Notifications"
            className="absolute left-0 top-full mt-2 w-[min(24rem,calc(100vw-2rem))] z-[90] rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close notifications"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 dark:border-gray-800">
              {['all', 'unread'].map((value) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={clsx(
                    'px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors',
                    filter === value
                      ? 'bg-primary-500/10 text-primary-600 dark:text-primary-300'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  {value}
                </button>
              ))}
              <div className="flex-1" />
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadRemote()}
                  className="flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <CheckIcon className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[26rem] overflow-y-auto scrollbar-thin">
              {isLoading && notifications.length === 0 ? (
                <ListSkeleton rows={4} />
              ) : feedError ? (
                <div className="p-6 text-center text-sm text-gray-500">
                  <p>{feedError}</p>
                  <button
                    onClick={() => fetchNotifications()}
                    className="mt-3 text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : visible.length === 0 ? (
                <EmptyState
                  icon={InboxIcon}
                  compact
                  title={filter === 'unread' ? 'Nothing unread' : 'No notifications yet'}
                  description={
                    filter === 'unread'
                      ? 'You are all caught up.'
                      : 'Reactions, replies, invites and security alerts will show up here.'
                  }
                />
              ) : (
                visible.map((notification) => {
                  const Icon = TYPE_ICON[notification.type] || BellIcon
                  const tone = TYPE_TONE[notification.type] || TYPE_TONE.system
                  return (
                    <div
                      key={notification._id}
                      className={clsx(
                        'group flex items-start gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800/60 last:border-0 transition-colors',
                        notification.isRead
                          ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          : 'bg-primary-500/[0.04] hover:bg-primary-500/[0.07]'
                      )}
                    >
                      <button
                        onClick={() => handleOpenNotification(notification)}
                        className="flex items-start gap-3 flex-1 min-w-0 text-left"
                      >
                        <span
                          className={clsx(
                            'w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center',
                            tone
                          )}
                        >
                          <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium text-gray-900 dark:text-white truncate">
                            {notification.title}
                          </span>
                          {notification.body && (
                            <span className="block text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                              {notification.body}
                            </span>
                          )}
                          <span className="block text-[11px] text-gray-400 mt-0.5">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </span>
                      </button>
                      <button
                        onClick={() => removeNotification(notification._id)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label="Dismiss notification"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => {
                  setOpen(false)
                  navigate('/settings/notifications')
                }}
                className="text-xs font-medium text-gray-500 hover:text-primary-600 dark:hover:text-primary-400"
              >
                Notification settings
              </button>
              <div className="flex items-center gap-3">
                {permission !== 'granted' && (
                  <button
                    onClick={() => requestPermission()}
                    className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Enable desktop alerts
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={() => clearAllRemote()}
                    className="text-xs font-medium text-gray-400 hover:text-red-500"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationCenter
