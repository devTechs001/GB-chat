import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  SpeakerWaveIcon,
  UserGroupIcon,
  PhoneIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

const BottomNav = () => {
  const location = useLocation()

  const navigation = [
    { name: 'Chats', href: '/chats', icon: ChatBubbleLeftRightIcon },
    { name: 'Stories', href: '/stories', icon: PhotoIcon },
    { name: 'Channels', href: '/channels', icon: SpeakerWaveIcon },
    { name: 'Groups', href: '/groups', icon: UserGroupIcon },
    { name: 'Calls', href: '/calls', icon: PhoneIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 pb-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href || (item.href === '/chats' && location.pathname === '/')

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[64px] h-full py-1 transition-colors duration-200 ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-lg ${isActive ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] mt-0.5 font-medium">{item.name}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
