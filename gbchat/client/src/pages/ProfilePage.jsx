import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  PhoneIcon,
  VideoCameraIcon,
  ChatBubbleLeftIcon,
  EllipsisVerticalIcon,
  ShieldCheckIcon,
  CalendarIcon,
  MapPinIcon,
  LinkIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import Avatar from '../components/common/Avatar'
import Button from '../components/common/Button'
import Dropdown from '../components/common/Dropdown'
import Loader from '../components/common/Loader'
import api from '../lib/api'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('media') // media, groups, links
  const [sharedMedia, setSharedMedia] = useState([])

  useEffect(() => {
    fetchProfile()
  }, [userId])

  const fetchProfile = async () => {
    try {
      const { data } = await api.get(`/users/${userId}`)
      setProfile(data.user)
    } catch (error) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCall = (isVideo = false) => {
    // Initiate call
    console.log(`Starting ${isVideo ? 'video' : 'audio'} call with ${profile.name}`)
  }

  const handleMessage = () => {
    navigate(`/?chat=${userId}`)
  }

  const handleBlock = async () => {
    if (confirm('Are you sure you want to block this user?')) {
      try {
        await api.post(`/users/${userId}/block`)
        toast.success('User blocked')
        navigate('/')
      } catch (error) {
        toast.error('Failed to block user')
      }
    }
  }

  const menuItems = [
    { label: 'Share Contact', action: 'share' },
    { label: 'Export Chat', action: 'export' },
    { label: 'Clear Chat', action: 'clear', danger: true },
    { divider: true },
    { label: 'Block User', action: 'block', danger: true },
    { label: 'Report User', action: 'report', danger: true },
  ]

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">User not found</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-dark-bg pb-16 lg:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Contact Info</h1>
          <Dropdown
            trigger={
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <EllipsisVerticalIcon className="w-5 h-5" />
              </button>
            }
            items={menuItems}
            onSelect={(action) => {
              if (action === 'block') handleBlock()
            }}
          />
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-900 p-6">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            <Avatar
              src={profile.avatar}
              alt={profile.name}
              size="xl"
              status={profile.isOnline ? 'online' : 'offline'}
              className="ring-4 ring-white dark:ring-gray-900"
            />
          </motion.div>
          
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            {profile.name}
          </h2>
          
          {profile.username && (
            <p className="text-gray-500 dark:text-gray-400">
              @{profile.username}
            </p>
          )}

          {profile.bio && (
            <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-md">
              {profile.bio}
            </p>
          )}

          {profile.verified && (
            <div className="mt-2 flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400">
              <ShieldCheckIcon className="w-4 h-4" />
              Verified Account
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-6">
            <Button
              variant="primary"
              icon={<ChatBubbleLeftIcon className="w-5 h-5" />}
              onClick={handleMessage}
            >
              Message
            </Button>
            <Button
              variant="secondary"
              icon={<PhoneIcon className="w-5 h-5" />}
              onClick={() => handleCall(false)}
            >
              Call
            </Button>
            <Button
              variant="secondary"
              icon={<VideoCameraIcon className="w-5 h-5" />}
              onClick={() => handleCall(true)}
            >
              Video
            </Button>
          </div>
        </div>
      </div>

      {/* Info Sections */}
      <div className="mt-2 bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
        {/* About */}
        {profile.about && (
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              About
            </h3>
            <p className="text-gray-900 dark:text-white">{profile.about}</p>
          </div>
        )}

        {/* Details */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Details
          </h3>
          
          {profile.phone && (
            <div className="flex items-center gap-3">
              <PhoneIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-gray-900 dark:text-white">{profile.phone}</p>
              </div>
            </div>
          )}

          {profile.email && (
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-gray-900 dark:text-white">{profile.email}</p>
              </div>
            </div>
          )}

          {profile.location && (
            <div className="flex items-center gap-3">
              <MapPinIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                <p className="text-gray-900 dark:text-white">{profile.location}</p>
              </div>
            </div>
          )}

          {profile.website && (
            <div className="flex items-center gap-3">
              <LinkIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Website</p>
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  {profile.website}
                </a>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Joined</p>
              <p className="text-gray-900 dark:text-white">
                {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>

        {/* Groups in Common */}
        {profile.commonGroups?.length > 0 && (
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5" />
              {profile.commonGroups.length} groups in common
            </h3>
            <div className="space-y-2">
              {profile.commonGroups.map((group) => (
                <div
                  key={group._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <Avatar src={group.avatar} alt={group.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {group.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {group.memberCount} members
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Shared Content Tabs */}
      <div className="mt-2 bg-white dark:bg-gray-900">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            {['media', 'links', 'docs'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  'flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                )}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'media' && (
            <div className="grid grid-cols-3 gap-1">
              {sharedMedia.length === 0 ? (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  No media shared yet
                </div>
              ) : (
                sharedMedia.map((media, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-gray-200 dark:bg-gray-700 rounded overflow-hidden"
                  >
                    <img
                      src={media.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'links' && (
            <div className="text-center py-8 text-gray-500">
              No links shared yet
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="text-center py-8 text-gray-500">
              No documents shared yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage