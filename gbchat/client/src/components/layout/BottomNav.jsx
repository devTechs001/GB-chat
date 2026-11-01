import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  PhoneIcon,
  Cog6ToothIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import useChatStore from '../../store/useChatStore'
import clsx from 'clsx'

const NAV_ITEMS = [
  // Five is the most a phone tab bar can show legibly; groups, channels and
  // the profile stay one tap away via the home shortcut strip / sidebar.
  { name: 'Chats', href: '/chats', icon: ChatBubbleLeftRightIcon },
  { name: 'Stories', href: '/stories', icon: PhotoIcon },
  { name: 'Calls', href: '/calls', icon: PhoneIcon },
  { name: 'Contacts', href: '/contacts', icon: UsersIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
]

/**
 * BottomNav — mobile/tablet tab bar. Rendered in the layout flow (not fixed),
 * so routed pages never need compensating padding.
 */
const BottomNav = () => {
  const location = useLocation()
  const chats = useChatStore((state) => state.chats)

  const unreadTotal = (chats || []).reduce(
    (total, chat) => total + (chat?.unreadCount > 0 ? chat.unreadCount : 0),
    0
  )

  const isActive = (href) =>
    href === '/chats'
      ? location.pathname === '/' || location.pathname === '/chats'
      : location.pathname === href || location.pathname.startsWith(`${href}/`)

  return (
    <nav
      aria-label="Primary"
      className={clsx(
        'lg:hidden flex-shrink-0 z-40',
        'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl',
        'border-t border-gray-200/80 dark:border-gray-800',
        'shadow-[0_-2px_12px_rgba(0,0,0,0.04)] safe-area-bottom'
      )}
    >
      <div className="flex items-stretch justify-around px-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          const showBadge = item.href === '/chats' && unreadTotal > 0

          return (
            <NavLink
              key={item.name}
              to={item.href}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-w-0 tap-target"
            >
              <span
                className={clsx(
                  'relative flex items-center justify-center w-9 h-7 rounded-lg transition-colors',
                  active
                    ? 'bg-primary-500/12 text-primary-600 dark:text-primary-400'
                    : 'text-gray-400 dark:text-gray-500'
                )}
              >
                <Icon className="w-[22px] h-[22px]" />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadTotal > 9 ? '9+' : unreadTotal}
                  </span>
                )}
              </span>
              <span
                className={clsx(
                  'text-[10px] leading-none font-semibold transition-colors truncate max-w-full',
                  active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-500'
                )}
              >
                {item.name}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
