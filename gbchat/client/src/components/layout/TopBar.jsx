import React from 'react'
import { useNavigate } from 'react-router-dom'
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

const TopBar = ({ onMenuClick, onSearchClick, onNotificationClick }) => {
  const { user } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const navigate = useNavigate()

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <IconButton
            icon={<Bars3Icon />}
            onClick={onMenuClick}
            className="lg:hidden"
          />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
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
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>

          <IconButton
            icon={<Cog6ToothIcon />}
            tooltip="Settings"
            onClick={() => navigate('/settings')}
          />

          <Avatar
            src={user?.avatar}
            alt={user?.name}
            size="sm"
            status="online"
            className="cursor-pointer ring-2 ring-primary-500/20 hover:ring-primary-500/50 transition-all"
            onClick={() => navigate(`/profile/${user?._id}`)}
          />
        </div>
      </div>
    </div>
  )
}

export default TopBar