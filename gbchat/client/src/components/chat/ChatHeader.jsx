import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeftIcon,
  PhoneIcon,
  VideoCameraIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  BellIcon,
  BellSlashIcon,
  EyeIcon,
  LockClosedIcon,
  ArchiveBoxIcon,
  StarIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import Avatar from '../common/Avatar'
import Dropdown from '../common/Dropdown'
import clsx from 'clsx'
import useChatStore from '../../store/useChatStore'
import useGBFeaturesStore from '../../store/useGBFeaturesStore'
import ChatDisplaySettings from '../settings/ChatDisplaySettings'
import WallpaperSelector from './WallpaperSelector'
import MediaGallery from './MediaGallery'
import StarredMessagesModal from './StarredMessagesModal'
import ChatLockSettings from './ChatLockSettings'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const GhostIconCustom = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C7.58 2 4 5.58 4 10v14c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2V10c0-4.42-3.58-8-8-8z"/>
  </svg>
)

const AirplaneIconCustom = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
  </svg>
)

const ChatHeader = ({ chat, onInfoClick, selectedCount, onClearSelection, onBack }) => {
  const navigate = useNavigate()
  const { onlineUsers } = useChatStore()
  const { gbFeatures, toggleQuickSetting } = useGBFeaturesStore()
  const [showSearch, setShowSearch] = useState(false)
  const [showQuickSettings, setShowQuickSettings] = useState(false)
  const [showDisplaySettings, setShowDisplaySettings] = useState(false)
  const [showWallpaperSelector, setShowWallpaperSelector] = useState(false)
  const [showMediaGallery, setShowMediaGallery] = useState(false)
  const [showStarredModal, setShowStarredModal] = useState(false)
  const [showLockSettings, setShowLockSettings] = useState(false)
  const isOnline = chat.isGroup ? false : onlineUsers.includes(chat.userId)

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      // Fallback: navigate to chat list
      navigate('/chats')
    }
  }

  const handleWallpaperChange = (wallpaperUrl) => {
    // Store wallpaper per chat in localStorage
    const chatWallpapers = JSON.parse(localStorage.getItem('chat-wallpapers') || '{}')
    if (wallpaperUrl) {
      chatWallpapers[chat._id] = wallpaperUrl
    } else {
      delete chatWallpapers[chat._id]
    }
    localStorage.setItem('chat-wallpapers', JSON.stringify(chatWallpapers))

    // Dispatch custom event to update ChatArea
    window.dispatchEvent(new CustomEvent('wallpaper-change', {
      detail: { chatId: chat._id, wallpaper: wallpaperUrl }
    }))
  }

  const quickSettings = [
    {
      id: 'dndMode',
      label: 'DND Mode',
      icon: BellSlashIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      id: 'ghostMode',
      label: 'Ghost Mode',
      icon: GhostIconCustom,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      id: 'airplaneMode',
      label: 'Airplane Mode',
      icon: AirplaneIconCustom,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30'
    },
    {
      id: 'readReceipts',
      label: 'Read Receipts',
      icon: EyeIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
  ]

  const menuOptions = chat.isGroup ? [
    { label: 'Group Info', action: 'group_info' },
    { label: 'Wallpaper', action: 'wallpaper' },
    { label: 'Media, Links, Docs', action: 'media' },
    { label: 'Search', action: 'search' },
    { label: 'Mute Notifications', action: 'mute' },
    { label: 'Star Messages', action: 'starred' },
    { label: 'Chat Lock', action: 'lock_settings' },
    { label: 'Clear Chat', action: 'clear', danger: true },
    { label: 'Report Group', action: 'report', danger: true },
  ] : [
    { label: 'Contact Info', action: 'view_contact' },
    { label: 'Wallpaper', action: 'wallpaper' },
    { label: 'Media, Links, Docs', action: 'media' },
    { label: 'Search', action: 'search' },
    { label: 'Mute Notifications', action: 'mute' },
    { label: 'Star Messages', action: 'starred' },
    { label: 'Chat Lock', action: 'lock_settings' },
    { label: 'Clear Chat', action: 'clear', danger: true },
    { label: 'Block Contact', action: 'block', danger: true },
    { label: 'Report Contact', action: 'report', danger: true },
  ]

  const handleMenuAction = async (action) => {
    switch (action) {
      case 'view_contact':
      case 'group_info':
        onInfoClick()
        break

      case 'wallpaper':
        setShowWallpaperSelector(true)
        break

      case 'search':
        setShowSearch(!showSearch)
        break

      case 'media':
        // Open media gallery
        setShowMediaGallery(true)
        break

      case 'mute':
        // Toggle mute for this chat
        try {
          const response = await api.post(`/chats/${chat._id}/mute`)
          toast.success(chat.isMuted ? 'Chat unmuted' : 'Chat muted')
        } catch (error) {
          toast.error('Failed to update mute status')
        }
        break

      case 'starred':
        // Show starred messages for this chat
        setShowStarredModal(true)
        break

      case 'lock_settings':
        setShowLockSettings(true)
        break

      case 'clear':
        if (confirm('Clear all messages in this chat? This cannot be undone.')) {
          try {
            await api.delete(`/chats/${chat._id}/messages`)
            toast.success('Chat cleared')
            // Reload messages or navigate back
            window.location.reload()
          } catch (error) {
            toast.error('Failed to clear chat')
          }
        }
        break

      case 'block':
        if (confirm('Block this contact? They won\'t be able to message you.')) {
          try {
            await api.post(`/users/block/${chat.userId}`)
            toast.success('Contact blocked')
            // Navigate back to chat list
            setTimeout(() => onBack?.(), 1000)
          } catch (error) {
            toast.error('Failed to block contact')
          }
        }
        break

      case 'report':
        if (confirm('Report this chat? This will send the chat history to moderators.')) {
          try {
            await api.post(`/chats/${chat._id}/report`)
            toast.success('Chat reported')
          } catch (error) {
            toast.error('Failed to report chat')
          }
        }
        break

      default:
        break
    }
  }

  const handleQuickSetting = (settingId) => {
    toggleQuickSetting(settingId)
  }

  if (selectedCount > 0) {
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
          <button className="p-2 hover:bg-white/10 rounded-full">
            <StarIcon className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full">
            <ArchiveBoxIcon className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full">
            <TrashIcon className="w-5 h-5" />
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
          <button
            onClick={handleBack}
            className="p-1 -ml-1 md:hidden hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            title="Back to chats"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>

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

        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => setShowDisplaySettings(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full relative"
            title="Display Settings"
          >
            <Cog6ToothIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          <button
            onClick={() => setShowQuickSettings(!showQuickSettings)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full relative"
            title="Quick Settings"
          >
            <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {gbFeatures?.messaging?.dndMode?.enabled && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-purple-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setShowSearch(!showSearch)}
            className="hidden md:block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {!chat.isGroup && (
            <>
              <button
                onClick={() => {}}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <PhoneIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => {}}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <VideoCameraIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </>
          )}

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

      <AnimatePresence>
        {showQuickSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="px-3 py-3 md:px-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                  Quick Settings
                </span>
                <button
                  onClick={() => setShowQuickSettings(false)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <XMarkIcon className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {quickSettings.map((setting) => {
                  const Icon = setting.icon
                  const isEnabled = setting.id === 'dndMode' 
                    ? gbFeatures?.messaging?.dndMode?.enabled
                    : setting.id === 'readReceipts'
                    ? !gbFeatures?.privacy?.hideBlueTicks
                    : gbFeatures?.privacy?.[setting.id] || false
                  
                  return (
                    <button
                      key={setting.id}
                      onClick={() => handleQuickSetting(setting.id)}
                      className={clsx(
                        'flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
                        isEnabled
                          ? `${setting.bgColor} ${setting.color}`
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] font-medium">{setting.label}</span>
                      {isEnabled && (
                        <div className="w-1.5 h-1.5 bg-current rounded-full mt-0.5" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Display Settings Modal */}
      <AnimatePresence>
        {showDisplaySettings && (
          <ChatDisplaySettings onClose={() => setShowDisplaySettings(false)} />
        )}
      </AnimatePresence>

      {/* Wallpaper Selector Modal */}
      <WallpaperSelector
        isOpen={showWallpaperSelector}
        onClose={() => setShowWallpaperSelector(false)}
        onSelect={handleWallpaperChange}
        currentWallpaper={null}
      />

      {/* Media Gallery Modal */}
      <MediaGallery
        isOpen={showMediaGallery}
        onClose={() => setShowMediaGallery(false)}
        chatId={chat._id}
      />

      {/* Starred Messages Modal */}
      <StarredMessagesModal
        isOpen={showStarredModal}
        onClose={() => setShowStarredModal(false)}
        chatId={chat._id}
      />

      {/* Chat Lock Settings Modal */}
      <ChatLockSettings
        isOpen={showLockSettings}
        onClose={() => setShowLockSettings(false)}
        chat={chat}
      />
    </>
  )
}

export default ChatHeader
