import React from 'react'
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
} from '@heroicons/react/24/outline'
import useAuthStore from '../../store/useAuthStore'
import useThemeStore from '../../store/useThemeStore'
import useMediaQuery from '../../hooks/useMediaQuery'
import Avatar from '../common/Avatar'
import clsx from 'clsx'

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useThemeStore()
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const navigation = [
    { name: 'Chats', href: '/chats', icon: ChatBubbleLeftRightIcon, emoji: '💬' },
    { name: 'Stories', href: '/stories', icon: PhotoIcon, emoji: '📸' },
    { name: 'Channels', href: '/channels', icon: SpeakerWaveIcon, emoji: '📢' },
    { name: 'Groups', href: '/groups', icon: UserGroupIcon, emoji: '👥' },
    { name: 'Calls', href: '/calls', icon: PhoneIcon, emoji: '📞' },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, emoji: '⚙️' },
  ]

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleNavClick = () => {
    if (!isDesktop) {
      onClose()
    }
  }

  return (
    <aside className="w-72 h-full bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col shadow-xl">
      {/* Header with Gradient */}
      <div className="p-4 bg-gradient-to-br from-primary-500/10 via-transparent to-primary-600/5 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <SparklesIcon className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              GBChat
            </h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110"
          >
            {theme === 'dark' ? (
              <SunIcon className="w-5 h-5 text-yellow-400" />
            ) : (
              <MoonIcon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* User Profile Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30">
          <Avatar
            src={user?.avatar}
            alt={user?.name}
            status="online"
            size="md"
            className="ring-2 ring-primary-500/30"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-primary-500 dark:text-primary-400 truncate font-medium">
              {user?.status || '🟢 Available'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href || (item.href === '/chats' && location.pathname === '/')

          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={handleNavClick}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                isActive
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:translate-x-1'
              )}
            >
              <Icon className={clsx('w-5 h-5 flex-shrink-0 transition-transform', isActive ? 'text-white' : 'group-hover:scale-110')} />
              <span className="font-medium">{item.name}</span>
              {item.badge && (
                <span className={clsx(
                  'ml-auto text-xs px-2 py-0.5 rounded-full font-bold',
                  isActive ? 'bg-white/20 text-white' : 'bg-primary-500 text-white'
                )}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50 space-y-2">
        <div className="flex flex-wrap gap-3 text-xs text-gray-400 px-2">
          <NavLink to="/terms" className="hover:text-primary-500 transition-colors">Terms</NavLink>
          <NavLink to="/privacy" className="hover:text-primary-500 transition-colors">Privacy</NavLink>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar