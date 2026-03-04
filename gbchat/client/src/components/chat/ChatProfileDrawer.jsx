import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  XMarkIcon,
  PhoneIcon,
  VideoCameraIcon,
  StarIcon,
  BellIcon,
  BellSlashIcon,
  LockClosedIcon,
  EyeIcon,
  ArchiveBoxIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleLeftIcon,
  ShieldCheckIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  SwatchIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import Avatar from '../common/Avatar'
import clsx from 'clsx'
import useGBFeaturesStore from '../../store/useGBFeaturesStore'
import useAuthStore from '../../store/useAuthStore'
import toast from 'react-hot-toast'
import { format, formatDistanceToNow } from 'date-fns'

const ChatProfileDrawer = ({ isOpen, onClose, chat }) => {
  const { user } = useAuthStore()
  const { gbFeatures, updateChatSpecificFeatures } = useGBFeaturesStore()
  const [activeTab, setActiveTab] = useState('overview')

  if (!chat) return null

  // Get the other participant's info (not the current user)
  const participants = chat.participants || []
  const otherParticipant = participants.find(p => {
    const pId = p.user?._id || p.user
    return pId !== user?._id
  })

  // Use participant data if available, fallback to chat data
  const displayName = otherParticipant?.user?.fullName || chat.name || 'Unknown'
  const displayAvatar = otherParticipant?.user?.avatar || chat.avatar
  const phoneNumber = otherParticipant?.user?.phone || chat.phoneNumber
  const about = otherParticipant?.user?.about || chat.about
  const bio = otherParticipant?.user?.bio
  const status = otherParticipant?.user?.status
  const lastSeen = otherParticipant?.user?.lastSeen
  const email = otherParticipant?.user?.email
  const username = otherParticipant?.user?.username
  const location = otherParticipant?.user?.location
  const createdAt = otherParticipant?.user?.createdAt
  const isVerified = otherParticipant?.user?.isVerified
  const isOnline = status === 'online'

  // Format last seen
  const formatLastSeen = (lastSeenAt) => {
    if (!lastSeenAt) return ''
    const date = new Date(lastSeenAt)
    if (format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
      return 'Today at ' + format(date, 'HH:mm:ss')
    }
    return format(date, 'MMM dd, yyyy HH:mm:ss')
  }

  // Chat-specific settings
  const chatSettings = [
    {
      id: 'customNotifications',
      label: 'Custom Notifications',
      icon: BellIcon,
      enabled: chat.customNotifications,
    },
    {
      id: 'customWallpaper',
      label: 'Custom Wallpaper',
      icon: SwatchIcon,
      enabled: chat.customWallpaper,
    },
    {
      id: 'muteChat',
      label: 'Mute Notifications',
      icon: BellSlashIcon,
      enabled: chat.isMuted,
    },
    {
      id: 'archiveChat',
      label: 'Archive Chat',
      icon: ArchiveBoxIcon,
      enabled: chat.isArchived,
    },
  ]

  // Privacy settings for this chat
  const privacySettings = [
    {
      id: 'hideOnlineStatus',
      label: 'Hide Online Status',
      icon: EyeIcon,
      description: 'Appear offline in this chat',
    },
    {
      id: 'hideReadReceipts',
      label: 'Hide Read Receipts',
      icon: LockClosedIcon,
      description: "Don't show blue ticks",
    },
    {
      id: 'ghostMode',
      label: 'Ghost Mode',
      icon: ShieldCheckIcon,
      description: 'View without leaving traces',
    },
  ]

  // Media settings
  const mediaSettings = [
    {
      id: 'autoDownload',
      label: 'Auto-Download Media',
      icon: DocumentArrowDownIcon,
      enabled: chat.autoDownload !== false,
    },
    {
      id: 'hdQuality',
      label: 'HD Quality Upload',
      icon: ChatBubbleLeftRightIcon,
      enabled: chat.hdUpload,
    },
  ]

  const handleToggleSetting = (settingId) => {
    updateChatSpecificFeatures(chat._id, { [settingId]: !chat[settingId] })
    toast.success('Setting updated')
  }

  const handleCall = (isVideo = false) => {
    console.log(`Starting ${isVideo ? 'video' : 'audio'} call with ${chat.name}`)
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'media', label: 'Media' },
  ]

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className={clsx(
          'fixed right-0 top-0 bottom-0 z-50',
          'w-full max-w-sm',
          'bg-white dark:bg-gray-900',
          'border-l border-gray-200 dark:border-gray-700',
          'shadow-xl',
          'flex flex-col'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {chat.isGroup ? 'Group Info' : 'Contact Info'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center">
            <Avatar
              src={displayAvatar}
              alt={displayName}
              size="xl"
              className="w-24 h-24 mb-4"
              status={isOnline ? 'online' : 'offline'}
            />
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {displayName}
              </h3>
              {isVerified && (
                <ShieldCheckIcon className="w-5 h-5 text-blue-500" />
              )}
            </div>
            {username && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                @{username}
              </p>
            )}
            {isOnline ? (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Online
              </p>
            ) : lastSeen ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Last seen {formatLastSeen(lastSeen)}
              </p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Last seen recently
              </p>
            )}
            {/* Bio/About */}
            {(bio || about) && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center max-w-[250px]">
                {bio || about}
              </p>
            )}
            {phoneNumber && !chat.isGroup && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {phoneNumber}
              </p>
            )}

            {/* Action Buttons */}
            {!chat.isGroup && (
              <div className="flex items-center gap-4 mt-6">
                <button
                  onClick={() => handleCall(false)}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <PhoneIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Audio</span>
                </button>
                <button
                  onClick={() => handleCall(true)}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <VideoCameraIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Video</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex-1 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Contact Information Section */}
              {!chat.isGroup && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    {/* Username */}
                    {username && (
                      <div className="flex items-center gap-3">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Username</p>
                          <p className="text-sm text-gray-900 dark:text-white">@{username}</p>
                        </div>
                      </div>
                    )}
                    {/* Phone */}
                    {phoneNumber && (
                      <div className="flex items-center gap-3">
                        <PhoneIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                          <p className="text-sm text-gray-900 dark:text-white">{phoneNumber}</p>
                        </div>
                      </div>
                    )}
                    {/* Email */}
                    {email && (
                      <div className="flex items-center gap-3">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                          <p className="text-sm text-gray-900 dark:text-white">{email}</p>
                        </div>
                      </div>
                    )}
                    {/* Bio/About */}
                    {(bio || about) && (
                      <div className="flex items-start gap-3">
                        <ChatBubbleLeftIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">About</p>
                          <p className="text-sm text-gray-900 dark:text-white">{bio || about}</p>
                        </div>
                      </div>
                    )}
                    {/* Location */}
                    {location && (
                      <div className="flex items-start gap-3">
                        <MapPinIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                          <p className="text-sm text-gray-900 dark:text-white">{location}</p>
                        </div>
                      </div>
                    )}
                    {/* Joined Date */}
                    {createdAt && (
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Joined</p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Quick Actions
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <StarIcon className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm">Starred</span>
                  </button>
                  <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm">Search</span>
                  </button>
                  <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <LockClosedIcon className="w-5 h-5 text-red-600" />
                    <span className="text-sm">Lock Chat</span>
                  </button>
                  <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <ArchiveBoxIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm">Archive</span>
                  </button>
                </div>
              </div>

              {/* Chat Settings */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Chat Settings
                </h4>
                <div className="space-y-2">
                  {chatSettings.map((setting) => {
                    const Icon = setting.icon
                    return (
                      <button
                        key={setting.id}
                        onClick={() => handleToggleSetting(setting.id)}
                        className={clsx(
                          'w-full flex items-center justify-between p-3 rounded-lg transition-colors',
                          setting.enabled
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span className="text-sm font-medium">{setting.label}</span>
                        </div>
                        <div
                          className={clsx(
                            'w-10 h-5 rounded-full transition-colors',
                            setting.enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                          )}
                        >
                          <div
                            className={clsx(
                              'w-4 h-4 bg-white rounded-full shadow-md transform transition-transform mt-0.5',
                              setting.enabled ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'
                            )}
                          />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Media & Files */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Media & Files
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg" />
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg" />
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg" />
                </div>
                <button className="w-full mt-2 py-2 text-sm text-primary-600 dark:text-primary-400 font-medium">
                  View All
                </button>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Privacy Settings for This Chat
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  These settings apply only to your conversations with {chat.name}
                </p>
                <div className="space-y-2">
                  {privacySettings.map((setting) => {
                    const Icon = setting.icon
                    return (
                      <div
                        key={setting.id}
                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                              <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                {setting.label}
                              </h5>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {setting.description}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleSetting(setting.id)}
                            className={clsx(
                              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                              chat[setting.id]
                                ? 'bg-green-600'
                                : 'bg-gray-300 dark:bg-gray-600'
                            )}
                          >
                            <span
                              className={clsx(
                                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                                chat[setting.id] ? 'translate-x-6' : 'translate-x-1'
                              )}
                            />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* GB Features Info */}
              <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <ShieldCheckIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-medium text-green-900 dark:text-green-100">
                      GB Features Active
                    </h5>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      Advanced privacy and customization features are enabled for this chat
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Media Settings
                </h4>
                <div className="space-y-2">
                  {mediaSettings.map((setting) => {
                    const Icon = setting.icon
                    return (
                      <button
                        key={setting.id}
                        onClick={() => handleToggleSetting(setting.id)}
                        className={clsx(
                          'w-full flex items-center justify-between p-3 rounded-lg transition-colors',
                          setting.enabled
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span className="text-sm font-medium">{setting.label}</span>
                        </div>
                        <div
                          className={clsx(
                            'w-10 h-5 rounded-full transition-colors',
                            setting.enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                          )}
                        >
                          <div
                            className={clsx(
                              'w-4 h-4 bg-white rounded-full shadow-md transform transition-transform mt-0.5',
                              setting.enabled ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'
                            )}
                          />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Storage Used */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Storage Used
                </h5>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: '45%' }} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  245 MB of 500 MB used
                </p>
                <button className="mt-3 text-sm text-red-600 dark:text-red-400 font-medium">
                  Clear Cache
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full py-3 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
            {chat.isGroup ? 'Exit Group' : 'Block Contact'}
          </button>
        </div>
      </motion.div>
    </>
  )
}

export default ChatProfileDrawer
