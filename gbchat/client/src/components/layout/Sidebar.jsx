import React, { useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  PhoneIcon,
  Cog6ToothIcon,
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
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
]

/**
 * Sidebar
 * variant: 'desktop' (static column, collapsible) | 'drawer' (mobile slide-over)
 */
const Sidebar = ({ variant = 'desktop', collapsed = false, onToggleCollapse, onClose }) => {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { theme, setTheme, getAvailableThemes } = useThemeStore()
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
    const themeClass = themes?.[theme]?.class || ''
    if (themeClass) return themeClass.includes('dark')
    return theme ? !theme.includes('light') : false
  }, [theme, getAvailableThemes])

  const toggleTheme = () => {
    setTheme(isDarkTheme ? 'light' : 'dark')
  }

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
        'h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200/80 dark:border-gray-800',
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
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isDarkTheme ? (
                  <SunIcon className="w-5 h-5 text-yellow-500" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </button>
            )
          )}
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
                'relative flex items-center rounded-xl transition-colors',
                isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5',
                active
                  ? 'bg-primary-500/10 text-primary-700 dark:text-primary-300 font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary-500" />
              )}
              <Icon className={clsx('flex-shrink-0', active ? 'w-5 h-5' : 'w-5 h-5')} />
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
        {!isCollapsed && (
          <div className="flex items-center gap-3 px-2 pb-2 text-[11px] text-gray-400 dark:text-gray-500">
            <NavLink to="/terms" className="hover:text-primary-500 transition-colors">Terms</NavLink>
            <span aria-hidden="true">•</span>
            <NavLink to="/privacy" className="hover:text-primary-500 transition-colors">Privacy</NavLink>
          </div>
        )}

        <div className={clsx('flex items-center', isCollapsed ? 'flex-col gap-1' : 'gap-1')}>
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
