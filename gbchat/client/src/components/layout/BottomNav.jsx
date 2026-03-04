import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 z-50 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16 pb-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const checkActive = location.pathname === item.href || (item.href === '/chats' && location.pathname === '/')

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className="flex flex-col items-center justify-center min-w-[56px] h-full py-1 transition-all duration-300 relative"
            >
              {checkActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${
                checkActive
                  ? 'bg-primary-500/10 dark:bg-primary-500/20 scale-110'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
                <Icon className={`w-5 h-5 transition-colors ${
                  checkActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`} />
              </div>
              <span className={`text-[10px] mt-0.5 font-semibold transition-colors ${
                checkActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>{item.name}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
