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
} from '@heroicons/react/24/outline'
import useAuthStore from '../../store/useAuthStore'
import useThemeStore from '../../store/useThemeStore'
import Avatar from '../common/Avatar'
import clsx from 'clsx'

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useThemeStore()

  const navigation = [
    { name: 'Home', href: '/', icon: ChatBubbleLeftRightIcon },
    { name: 'Chats', href: '/chats', icon: ChatBubbleLeftRightIcon },
    { name: 'Stories', href: '/stories', icon: PhotoIcon },
    { name: 'Channels', href: '/channels', icon: SpeakerWaveIcon },
    { name: 'Groups', href: '/groups', icon: UserGroupIcon },
    { name: 'Calls', href: '/calls', icon: PhoneIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ]

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <aside className="w-72 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-primary-600">GBChat</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === 'dark' ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* User Profile */}
        <div className="flex items-center gap-3">
          <Avatar
            src={user?.avatar}
            alt={user?.name}
            status="online"
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {user?.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user?.status || 'Available'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={clsx(
                isActive ? 'sidebar-item-active' : 'sidebar-item',
                'group'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.name}</span>
              {item.badge && (
                <span className="ml-auto bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
          <a href="/terms" className="hover:text-primary-600 dark:hover:text-primary-400" target="_blank" rel="noopener noreferrer">
            Terms
          </a>
          <a href="/privacy" className="hover:text-primary-600 dark:hover:text-primary-400" target="_blank" rel="noopener noreferrer">
            Privacy
          </a>
        </div>
        <button
          onClick={logout}
          className="sidebar-item w-full text-red-600 dark:text-red-400"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar