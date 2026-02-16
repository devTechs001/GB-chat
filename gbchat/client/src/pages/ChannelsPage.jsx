import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  HashtagIcon,
  UserGroupIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline'
import ChannelCard from '../components/channels/ChannelCard'
import ChannelCreate from '../components/channels/ChannelCreate'
import SearchBar from '../components/common/SearchBar'
import Button from '../components/common/Button'
import api from '../lib/api'
import clsx from 'clsx'

const ChannelsPage = () => {
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, subscribed, trending
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    fetchChannels()
  }, [])

  const fetchChannels = async () => {
    try {
      const { data } = await api.get('/channels')
      // Handle both array and object responses
      const channelsArray = Array.isArray(data) ? data : (data.channels || [])
      setChannels(channelsArray)
    } catch (error) {
      console.error('Failed to fetch channels:', error)
      setChannels([])
    } finally {
      setLoading(false)
    }
  }

  const filteredChannels = channels.filter((channel) => {
    if (filter === 'subscribed' && !channel.isSubscribed) return false
    if (filter === 'trending' && !channel.isTrending) return false
    if (searchQuery && !channel.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-dark-bg pb-16">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Channels</h1>
        <Button
          variant="primary"
          size="sm"
          icon={<PlusIcon className="w-5 h-5" />}
          onClick={() => setShowCreate(true)}
        />
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Channels
          </h1>
          <Button
            variant="primary"
            icon={<PlusIcon className="w-5 h-5" />}
            onClick={() => setShowCreate(true)}
          >
            Create Channel
          </Button>
        </div>

        {/* Search */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search channels..."
        />

        {/* Filters */}
        <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
          {[
            { id: 'all', label: 'All Channels' },
            { id: 'subscribed', label: 'Subscribed' },
            { id: 'trending', label: 'Trending' },
          ].map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={clsx(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                filter === filterOption.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              )}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Channels Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse"
              >
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="text-center py-12">
            <HashtagIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No channels found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery
                ? 'Try different search terms'
                : 'Create your first channel to get started'}
            </p>
            {!searchQuery && (
              <Button variant="primary" onClick={() => setShowCreate(true)}>
                Create Channel
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredChannels.map((channel, index) => (
                <motion.div
                  key={channel._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ChannelCard channel={channel} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Channel Modal */}
      {showCreate && (
        <ChannelCreate
          onClose={() => setShowCreate(false)}
          onSuccess={(newChannel) => {
            setChannels((prev) => [newChannel, ...prev])
            setShowCreate(false)
          }}
        />
      )}
    </div>
  )
}

export default ChannelsPage