import React, { useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  PhoneIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  SunIcon,
  ArrowRightOnRectangleIcon,
  PhotoIcon,
  SpeakerWaveIcon,
  SparklesIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import useAuthStore from '../../store/useAuthStore'
import { UsersIcon } from '@heroicons/react/24/outline'
import NotificationCenter from '../notifications/NotificationCenter'
import ThemePicker from '../settings/ThemePicker'
import useThemeStore from '../../store/useThemeStore'
import useChatStore from '../../store/useChatStore'
import Avatar from '../common/Avatar'
import clsx from 'clsx'

const NAV_ITEMS = [
  { name: 'Chats', href: '/chats', icon: ChatBubbleLeftRightIcon },
  { name: 'Stories', href: '/stories', icon: PhotoIcon },
  { name: 'Channels', href: '/channels', icon: SpeakerWaveIcon },
  { name: 'Groups', href: '/groups', icon: UserGroupIcon },
  { name: 'Calls', href: '/calls', icon: PhoneIcon },
  { name: 'Contacts', href: '/contacts', icon: UsersIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
]

/**
 * Sidebar
 * variant: 'desktop' (static column, collapsible) | 'drawer' (mobile slide-over)
 */
const Sidebar = ({ variant = 'desktop', collapsed = false, onToggleCollapse, onClose }) => {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { theme, getAvailableThemes } = useThemeStore()
  const chats = useChatStore((state) => state.chats)

  const isDrawer = variant === 'drawer'
  const isCollapsed = !isDrawer && collapsed

  const unreadTotal = useMemo(
    () =>
      (chats || []).reduce(
        (total, chat) => total + (chat?.unreadCount > 0 ? chat.unreadCount : 0),
        0
      ),
    [chats]
  )

  const isDarkTheme = useMemo(() => {
    const themes = getAvailableThemes ? getAvailableThemes() : {}
    return (themes?.[theme]?.mode || 'light') === 'dark'
  }, [theme, getAvailableThemes])

  // Light/dark quick toggle lives in the header; the full palette picker opens
  // from the footer so all 11 themes are reachable without opening Settings.
  const [showThemePicker, setShowThemePicker] = useState(false)

  const isItemActive = (href) => {
    if (href === '/chats') {
      return location.pathname === '/' || location.pathname === '/chats'
    }
    return location.pathname === href || location.pathname.startsWith(`${href}/`)
  }

  const displayName = user?.fullName || user?.name || 'My Profile'
  const displayStatus = user?.status || 'Available'

  return (
    <aside
      className={clsx(
        'h-full flex flex-col border-r border-gray-200/70 dark:border-gray-800/80',
        'bg-white/80 backdrop-blur-xl dark:bg-gray-900/80',
        isDrawer ? 'w-[280px]' : isCollapsed ? 'w-[76px]' : 'w-72',
        'transition-[width] duration-200 ease-out'
      )}
    >
      {/* ---------- Brand ---------- */}
      <div
        className={clsx(
          'flex-shrink-0 border-b border-gray-200/80 dark:border-gray-800',
          isCollapsed ? 'px-2 py-3' : 'px-4 py-3.5',
          isDrawer && 'safe-area-top'
        )}
      >
        <div className={clsx('flex items-center', isCollapsed ? 'justify-center' : 'justify-between gap-2')}>
          <NavLink to="/chats" className="flex items-center gap-2.5 min-w-0" onClick={onClose}>
            <span className="w-9 h-9 flex-shrink-0 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <SparklesIcon className="w-5 h-5 text-white" />
            </span>
            {!isCollapsed && (
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent truncate">
                GBChat
              </span>
            )}
          </NavLink>

          <div className={clsx('flex items-center gap-0.5', isCollapsed && 'flex-col')}>
            <NotificationCenter className={clsx(isCollapsed && 'mt-1')} />

            {isDrawer ? (
              <button
                onClick={onClose}
                aria-label="Close navigation"
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            ) : (
              !isCollapsed && (
                <ThemePicker compact />
              )
            )}
          </div>
        </div>
      </div>

      {/* ---------- Profile ---------- */}
      <div className={clsx('flex-shrink-0', isCollapsed ? 'p-2' : 'p-3')}>
        <NavLink
          to={`/profile/${user?._id || user?.id || 'me'}`}
          onClick={onClose}
          title={displayName}
          className={clsx(
            'flex items-center gap-3 rounded-xl border border-transparent hover:border-gray-200/80 dark:hover:border-gray-700',
            'hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors',
            isCollapsed ? 'justify-center p-2' : 'p-2.5'
          )}
        >
          <Avatar
            src={user?.avatar}
            alt={displayName}
            status="online"
            size="md"
            className="flex-shrink-0"
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {displayName}
              </p>
              <p className="text-xs text-primary-600 dark:text-primary-400 truncate">
                {displayStatus}
              </p>
            </div>
          )}
        </NavLink>
      </div>

      {/* ---------- Navigation ---------- */}
      {/* Quick search — desktop only, mirrors the ⌘K shortcut. */}
      {!isCollapsed && (
        <div className="flex-shrink-0 px-3 pb-1 pt-2">
          <button
            type="button"
            onClick={() => {
              onClose?.()
              window.dispatchEvent(new CustomEvent('gbchat:focus-search'))
            }}
            className="flex w-full items-center gap-2 rounded-xl border border-gray-200/80 bg-gray-50/80 px-3 py-2 text-left text-sm text-gray-500 transition-colors hover:border-primary-300 hover:bg-white dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400 dark:hover:border-primary-700"
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
            <span className="flex-1 truncate">Search chats</span>
            <kbd className="rounded border border-gray-300/70 bg-white px-1 py-0.5 text-[10px] font-semibold text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      <nav
        className={clsx(
          'flex-1 min-h-0 overflow-y-auto overscroll-contain',
          isCollapsed ? 'px-2 py-1 space-y-1' : 'px-3 py-1 space-y-1'
        )}
        aria-label="Primary"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isItemActive(item.href)
          const showBadge = item.href === '/chats' && unreadTotal > 0

          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              title={isCollapsed ? item.name : undefined}
              aria-current={active ? 'page' : undefined}
              className={clsx(
                'group relative flex items-center rounded-xl transition-all duration-150',
                isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5',
                active
                  ? 'bg-primary-500/12 text-primary-700 shadow-sm ring-1 ring-primary-500/20 dark:text-primary-300 font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 hover:text-gray-900 dark:hover:bg-gray-800/70 dark:hover:text-white'
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary-500" />
              )}
              <Icon
                className={clsx(
                  'w-5 h-5 flex-shrink-0 transition-transform duration-150',
                  !active && 'group-hover:scale-110'
                )}
              />
              {!isCollapsed && <span className="text-sm truncate">{item.name}</span>}
              {showBadge && (
                <span
                  className={clsx(
                    'flex items-center justify-center text-[10px] font-bold rounded-full bg-primary-500 text-white',
                    isCollapsed
                      ? 'absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1'
                      : 'ml-auto min-w-[20px] h-5 px-1.5'
                  )}
                >
                  {unreadTotal > 99 ? '99+' : unreadTotal}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* ---------- Footer ---------- */}
      <div className={clsx('flex-shrink-0 border-t border-gray-200/80 dark:border-gray-800', isCollapsed ? 'p-2' : 'p-3')}>
        <AnimatePresence>
          {showThemePicker && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mb-2 rounded-xl border border-gray-200/80 p-2.5 dark:border-gray-800">
                <ThemePicker />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isCollapsed && (
          <div className="flex items-center gap-3 px-2 pb-2 text-[11px] text-gray-400 dark:text-gray-500">
            <NavLink to="/terms" className="hover:text-primary-500 transition-colors">Terms</NavLink>
            <span aria-hidden="true">•</span>
            <NavLink to="/privacy" className="hover:text-primary-500 transition-colors">Privacy</NavLink>
          </div>
        )}

        <div className={clsx('flex items-center', isCollapsed ? 'flex-col gap-1' : 'gap-1')}>
          <button
            onClick={() => setShowThemePicker((open) => !open)}
            title="Change theme"
            aria-label="Change theme"
            aria-expanded={showThemePicker}
            className={clsx(
              'flex items-center rounded-xl text-gray-600 dark:text-gray-300',
              'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
              isCollapsed ? 'justify-center p-3' : 'justify-center px-3 py-2.5'
            )}
          >
            {isDarkTheme ? (
              <MoonIcon className="w-5 h-5 flex-shrink-0" />
            ) : (
              <SunIcon className="w-5 h-5 flex-shrink-0" />
            )}
          </button>

          <button
            onClick={logout}
            title="Log out"
            className={clsx(
              'flex items-center rounded-xl text-red-600 dark:text-red-400',
              'hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors',
              isCollapsed ? 'justify-center p-3' : 'gap-3 flex-1 px-3 py-2.5'
            )}
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Log out</span>}
          </button>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden lg:flex items-center justify-center p-2.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isCollapsed ? (
                <ChevronDoubleRightIcon className="w-5 h-5" />
              ) : (
                <ChevronDoubleLeftIcon className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
