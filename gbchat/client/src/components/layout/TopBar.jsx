import React from 'react'
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import Avatar from '../common/Avatar'
import IconButton from '../common/IconButton'
import useAuthStore from '../../store/useAuthStore'
import useNotificationStore from '../../store/useNotificationStore'
import Badge from '../common/Badge'

const TopBar = ({ onMenuClick, onSearchClick, onNotificationClick }) => {
  const { user } = useAuthStore()
  const { unreadCount } = useNotificationStore()

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <IconButton
            icon={<Bars3Icon />}
            onClick={onMenuClick}
            className="lg:hidden"
          />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            GBChat
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <IconButton
            icon={<MagnifyingGlassIcon />}
            onClick={onSearchClick}
            tooltip="Search"
          />
          
          <div className="relative">
            <IconButton
              icon={<BellIcon />}
              onClick={onNotificationClick}
              tooltip="Notifications"
            />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>

          <IconButton
            icon={<Cog6ToothIcon />}
            tooltip="Settings"
            onClick={() => window.location.href = '/settings'}
          />

          <Avatar
            src={user?.avatar}
            alt={user?.name}
            size="sm"
            status="online"
            className="cursor-pointer"
            onClick={() => window.location.href = '/profile'}
          />
        </div>
      </div>
    </div>
  )
}

export default TopBar