import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  HashtagIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  ChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'
import ChannelCard from '../components/channels/ChannelCard'
import ChannelCreate from '../components/channels/ChannelCreate'
import ChannelAnalytics from '../components/channels/ChannelAnalytics'
import ChannelPostScheduler from '../components/channels/ChannelPostScheduler'
import ChannelMonetization from '../components/channels/ChannelMonetization'
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
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [activeTab, setActiveTab] = useState('browse') // browse, analytics, scheduler, monetization
  const [scheduledPosts, setScheduledPosts] = useState([])

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

  const handleSchedulePost = (postData) => {
    console.log('Scheduling post:', postData)
    setScheduledPosts([...scheduledPosts, { ...postData, _id: Date.now().toString(), status: 'pending' }])
  }

  const handlePublishNow = (postId) => {
    console.log('Publishing post:', postId)
    setScheduledPosts(scheduledPosts.map(p =>
      p._id === postId ? { ...p, status: 'published' } : p
    ))
  }

  const handleDeleteScheduledPost = (postId) => {
    setScheduledPosts(scheduledPosts.filter(p => p._id !== postId))
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950 pb-16">
      {/* Mobile Header */}
      <div className="md:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">📢 Channels</h1>
        <Button
          variant="primary"
          size="sm"
          icon={<PlusIcon className="w-5 h-5" />}
          onClick={() => setShowCreate(true)}
        />
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            📢 Channels
          </h1>
          <Button
            variant="primary"
            icon={<PlusIcon className="w-5 h-5" />}
            onClick={() => setShowCreate(true)}
          >
            Create Channel
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4">
          {[
            { id: 'browse', label: 'Browse', icon: HashtagIcon },
            { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
            { id: 'scheduler', label: 'Scheduler', icon: CalendarIcon },
            { id: 'monetization', label: 'Monetization', icon: CurrencyDollarIcon },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Search */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={activeTab === 'browse' ? 'Search channels...' : 'Search...'}
        />

        {/* Filters */}
        {activeTab === 'browse' && (
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
                  'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300',
                  filter === filterOption.id
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200/50 dark:border-gray-700/50'
                )}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Channels Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {activeTab === 'browse' && (
          <>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 animate-pulse border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mb-4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : filteredChannels.length === 0 ? (
              <div className="text-center py-12">
                <HashtagIcon className="w-16 h-16 mx-auto text-primary-400/50 mb-4" />
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
          </>
        )}

        {activeTab === 'analytics' && selectedChannel && (
          <ChannelAnalytics
            channel={selectedChannel}
            onClose={() => setSelectedChannel(null)}
          />
        )}

        {activeTab === 'analytics' && !selectedChannel && (
          <div className="text-center py-12">
            <ChartBarIcon className="w-16 h-16 mx-auto text-primary-400/50 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Select a Channel
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Choose a channel from the Browse tab to view analytics
            </p>
          </div>
        )}

        {activeTab === 'scheduler' && (
          <ChannelPostScheduler
            channelId="current-channel"
            scheduledPosts={scheduledPosts}
            onSchedule={handleSchedulePost}
            onPublish={handlePublishNow}
            onDelete={handleDeleteScheduledPost}
          />
        )}

        {activeTab === 'monetization' && selectedChannel && (
          <ChannelMonetization
            channel={selectedChannel}
            onManageTiers={(tier) => console.log('Manage tier:', tier)}
            onWithdraw={() => console.log('Withdraw funds')}
          />
        )}

        {activeTab === 'monetization' && !selectedChannel && (
          <div className="text-center py-12">
            <CurrencyDollarIcon className="w-16 h-16 mx-auto text-primary-400/50 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Select a Channel
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Choose a channel from the Browse tab to manage monetization
            </p>
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