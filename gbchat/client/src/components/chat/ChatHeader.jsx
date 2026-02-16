import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeftIcon,
  PhoneIcon,
  VideoCameraIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline'
import Avatar from '../common/Avatar'
import Dropdown from '../common/Dropdown'
import clsx from 'clsx'
import useChatStore from '../../store/useChatStore'

const ChatHeader = ({ chat, onInfoClick, selectedCount, onClearSelection }) => {
  const navigate = useNavigate()
  const { onlineUsers } = useChatStore()
  const [showSearch, setShowSearch] = useState(false)
  const isOnline = chat.isGroup ? false : onlineUsers.includes(chat.userId)

  const menuOptions = [
    { label: 'View Contact', action: 'view_contact' },
    { label: 'Media, Links, Docs', action: 'media' },
    { label: 'Search', action: 'search' },
    { label: 'Mute Notifications', action: 'mute' },
    { label: 'Wallpaper', action: 'wallpaper' },
    { label: 'Clear Chat', action: 'clear', danger: true },
    { label: 'Block', action: 'block', danger: true },
  ]

  const handleMenuAction = (action) => {
    switch (action) {
      case 'view_contact':
        onInfoClick()
        break
      case 'search':
        setShowSearch(!showSearch)
        break
      case 'mute':
        // Handle mute
        break
      case 'clear':
        if (confirm('Clear all messages in this chat?')) {
          // Handle clear chat
        }
        break
      case 'block':
        if (confirm('Block this contact?')) {
          // Handle block
        }
        break
      default:
        break
    }
  }

  const handleCall = (isVideo = false) => {
    // Handle call initiation
    console.log(`Starting ${isVideo ? 'video' : 'audio'} call with ${chat.name}`)
  }

  if (selectedCount > 0) {
    // Selection mode header
    return (
      <div className="flex items-center justify-between px-3 py-2 md:px-4 md:py-3 bg-primary-600 text-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onClearSelection}
            className="p-1 hover:bg-white/10 rounded-full"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          <span className="font-medium">{selectedCount} selected</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Selection actions */}
          <button className="p-2 hover:bg-white/10 rounded-full">
            <TrashIcon className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full">
            <StarIcon className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full">
            <ArrowUturnRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={clsx(
        'flex items-center justify-between',
        'px-3 py-2 md:px-4 md:py-3',
        'bg-white dark:bg-gray-900',
        'border-b border-gray-200 dark:border-gray-700'
      )}>
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          {/* Back button - visible on mobile */}
          <button
            onClick={() => navigate(-1)}
            className="p-1 -ml-1 md:hidden hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>

          {/* Avatar and info */}
          <div
            onClick={onInfoClick}
            className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 cursor-pointer"
          >
            <Avatar
              src={chat.avatar}
              alt={chat.name}
              size="sm"
              status={isOnline ? 'online' : 'offline'}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm md:text-base">
                {chat.name}
              </h3>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                {chat.isGroup ? (
                  `${chat.memberCount} members`
                ) : isOnline ? (
                  'Online'
                ) : (
                  'Last seen recently'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Search - Hidden on mobile, shown in menu */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="hidden md:block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Call buttons */}
          {!chat.isGroup && (
            <>
              <button
                onClick={() => handleCall(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <PhoneIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => handleCall(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <VideoCameraIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </>
          )}

          {/* Menu */}
          <Dropdown
            trigger={
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <EllipsisVerticalIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            }
            items={menuOptions}
            onSelect={handleMenuAction}
          />
        </div>
      </div>

      {/* Search bar - Animated */}
      {showSearch && (
        <div className="px-3 py-2 md:px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search in conversation..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>
        </div>
      )}
    </>
  )
}

export default ChatHeader