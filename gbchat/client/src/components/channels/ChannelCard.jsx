import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  UserGroupIcon,
  CheckBadgeIcon,
  BellIcon,
  BellSlashIcon,
} from '@heroicons/react/24/outline'
import Avatar from '../common/Avatar'
import Button from '../common/Button'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { formatNumber } from '../../lib/formatters'

const ChannelCard = ({ channel }) => {
  const navigate = useNavigate()
  const [isSubscribed, setIsSubscribed] = useState(channel.isSubscribed)
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (e) => {
    e.stopPropagation()
    setLoading(true)

    try {
      if (isSubscribed) {
        await api.post(`/channels/${channel._id}/unsubscribe`)
        setIsSubscribed(false)
        toast.success('Unsubscribed from channel')
      } else {
        await api.post(`/channels/${channel._id}/subscribe`)
        setIsSubscribed(true)
        toast.success('Subscribed to channel')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed')
    } finally {
      setLoading(false)
    }
  }

  const handleClick = () => {
    navigate(`/channels/${channel._id}`)
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
    >
      {/* Channel Header */}
      <div className="flex items-start gap-4 mb-4">
        <Avatar
          src={channel.avatar}
          alt={channel.name}
          size="lg"
          fallback={channel.name.charAt(0)}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {channel.name}
            </h3>
            {channel.verified && (
              <CheckBadgeIcon className="w-5 h-5 text-primary-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            @{channel.username || channel.name.toLowerCase().replace(/\s+/g, '')}
          </p>
        </div>
      </div>

      {/* Channel Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {channel.description || 'No description available'}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <UserGroupIcon className="w-4 h-4" />
          <span>{formatNumber(channel.subscriberCount || 0)} subscribers</span>
        </div>
        {channel.postCount && (
          <div>
            <span>{formatNumber(channel.postCount)} posts</span>
          </div>
        )}
      </div>

      {/* Category/Tags */}
      {channel.category && (
        <div className="mb-4">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
            {channel.category}
          </span>
        </div>
      )}

      {/* Subscribe Button */}
      <Button
        variant={isSubscribed ? 'secondary' : 'primary'}
        fullWidth
        onClick={handleSubscribe}
        loading={loading}
        icon={
          isSubscribed ? (
            <BellSlashIcon className="w-4 h-4" />
          ) : (
            <BellIcon className="w-4 h-4" />
          )
        }
      >
        {isSubscribed ? 'Subscribed' : 'Subscribe'}
      </Button>
    </motion.div>
  )
}

export default ChannelCard