import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
import ChannelDetail from '../components/channels/ChannelDetail'
import ChannelCreate from '../components/channels/ChannelCreate'
import ChannelAnalytics from '../components/channels/ChannelAnalytics'
import ChannelPostScheduler from '../components/channels/ChannelPostScheduler'
import ChannelMonetization from '../components/channels/ChannelMonetization'
import SearchBar from '../components/common/SearchBar'
import Button from '../components/common/Button'
import api from '../lib/api'
import PageHeader from '../components/layout/PageHeader'
import EmptyState from '../components/layout/EmptyState'
import clsx from 'clsx'
import toast from 'react-hot-toast'

// Demo/offline fallback so the page is never blank when the API is unreachable
const SAMPLE_CHANNELS = [
  {
    _id: 'ch1',
    name: 'GBChat Announcements',
    username: 'gbchat',
    description: 'Product news, release notes and tips.',
    avatar: 'https://picsum.photos/seed/gbchat-channel/200/200.jpg',
    subscriberCount: 24800,
    isSubscribed: true,
    isTrending: true,
    verified: true,
  },
  {
    _id: 'ch2',
    name: 'Design Weekly',
    username: 'designweekly',
    description: 'UI inspiration and layout teardowns every Friday.',
    avatar: 'https://picsum.photos/seed/design-weekly/200/200.jpg',
    subscriberCount: 9120,
    isSubscribed: true,
    isTrending: false,
    verified: false,
  },
  {
    _id: 'ch3',
    name: 'Tech Pulse',
    username: 'techpulse',
    description: 'Daily technology headlines in 60 seconds.',
    avatar: 'https://picsum.photos/seed/tech-pulse/200/200.jpg',
    subscriberCount: 45210,
    isSubscribed: false,
    isTrending: true,
    verified: true,
  },
  {
    _id: 'ch4',
    name: 'Nairobi Devs',
    username: 'nairobidevs',
    description: 'Community events, jobs and meetups.',
    avatar: 'https://picsum.photos/seed/nairobi-devs/200/200.jpg',
    subscriberCount: 3210,
    isSubscribed: false,
    isTrending: false,
    verified: false,
  },
]

const ChannelsPage = () => {
  const navigate = useNavigate()
  const { channelId } = useParams()
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, subscribed, trending
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [activeTab, setActiveTab] = useState('browse') // browse, analytics, scheduler, monetization
  const [scheduledPosts, setScheduledPosts] = useState([])
  const [ownedChannels, setOwnedChannels] = useState([])
  const [schedulerChannelId, setSchedulerChannelId] = useState('')
  const [schedulerLoading, setSchedulerLoading] = useState(false)

  useEffect(() => {
    fetchChannels()
    fetchOwnedChannels()
  }, [])

  // The scheduler only makes sense for channels you own/admin.
  useEffect(() => {
    if (activeTab === 'scheduler' && schedulerChannelId) fetchScheduledPosts(schedulerChannelId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, schedulerChannelId])

  const fetchChannels = async () => {
    try {
      const { data } = await api.get('/channels')
      // Handle both array and object responses
      const channelsArray = Array.isArray(data) ? data : (data.channels || [])
      setChannels(channelsArray)
    } catch (error) {
      console.error('Failed to fetch channels:', error)
      setChannels(SAMPLE_CHANNELS)
    } finally {
      setLoading(false)
    }
  }

  const filteredChannels = channels.filter((channel) => {
    if (filter === 'subscribed' && !channel.isSubscribed) return false
    if (filter === 'trending' && !channel.isTrending) return false
    if (searchQuery && !(channel.name || '').toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  /* ---------------- channel ownership + real scheduler ---------------- */

  const fetchOwnedChannels = async () => {
    try {
      const { data } = await api.get('/channels/mine')
      const list = Array.isArray(data) ? data : data.channels || []
      setOwnedChannels(list)
      if (list.length && !schedulerChannelId) setSchedulerChannelId(list[0]._id)
    } catch {
      // offline / demo mode: the scheduler shows its empty state
      setOwnedChannels([])
    }
  }

  const normalizeScheduled = (post) => ({
    ...post,
    content: post.text,
    media: post.mediaUrl ? { url: post.mediaUrl, thumbnail: post.mediaUrl } : null,
    status: post.status === 'published' ? 'published' : post.status || 'pending',
  })

  const fetchScheduledPosts = async (channelId) => {
    setSchedulerLoading(true)
    try {
      const { data } = await api.get(`/channels/${channelId}/posts/scheduled`)
      const list = data?.scheduled || []
      setScheduledPosts(list.map(normalizeScheduled))
    } catch (error) {
      setScheduledPosts([])
      const status = error?.response?.status
      if (status === 403) toast.error('Only channel admins can manage the schedule')
    } finally {
      setSchedulerLoading(false)
    }
  }

  const handleSchedulePost = async (postData) => {
    const channelId = postData.channelId || schedulerChannelId
    if (!channelId) {
      toast.error('Create a channel first')
      return
    }
    try {
      const { data } = await api.post(`/channels/${channelId}/posts/schedule`, {
        text: postData.content,
        type: postData.media ? 'image' : 'text',
        mediaUrl: typeof postData.media === 'string' ? postData.media : postData.media?.url || '',
        scheduledFor: postData.scheduledFor,
      })
      const created = data?.scheduledPost
      if (created) {
        setScheduledPosts((prev) => [...prev, normalizeScheduled(created)])
        toast.success('Post scheduled')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not schedule this post')
    }
  }

  const handlePublishNow = async (postId) => {
    if (!schedulerChannelId) return
    try {
      await api.post(`/channels/${schedulerChannelId}/posts/scheduled/${postId}/publish`)
      setScheduledPosts((prev) =>
        prev.map((post) => (post._id === postId ? { ...post, status: 'published' } : post))
      )
      toast.success('Post published')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not publish this post')
    }
  }

  const handleDeleteScheduledPost = async (postId) => {
    if (!schedulerChannelId) return
    try {
      await api.delete(`/channels/${schedulerChannelId}/posts/scheduled/${postId}`)
      setScheduledPosts((prev) => prev.filter((post) => post._id !== postId))
      toast.success('Scheduled post removed')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not remove this post')
    }
  }

  const TABS = [
    { id: 'browse', label: 'Browse', icon: HashtagIcon },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
    { id: 'scheduler', label: 'Scheduler', icon: CalendarIcon },
    { id: 'monetization', label: 'Monetize', icon: CurrencyDollarIcon },
  ]

  /* /channels/:channelId renders the channel itself, not the browse grid. */
  if (channelId) {
    const initial = channels.find((channel) => String(channel._id) === String(channelId)) || null
    return (
      <ChannelDetail
        channelId={channelId}
        initialChannel={initial}
        onBack={() => navigate('/channels')}
      />
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-gray-50 dark:bg-gray-950">
      <PageHeader
        title="Channels"
        subtitle="Broadcast to your audience"
        icon={HashtagIcon}
        badge={channels.length}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<PlusIcon className="w-5 h-5" />}
            onClick={() => setShowCreate(true)}
          >
            <span className="hidden sm:inline">Create channel</span>
          </Button>
        }
      >
        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {activeTab === 'browse' && (
          <>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search channels..."
            />
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {[
                { id: 'all', label: 'All' },
                { id: 'subscribed', label: 'Subscribed' },
                { id: 'trending', label: 'Trending' },
              ].map((filterOption) => (
                <button
                  key={filterOption.id}
                  onClick={() => setFilter(filterOption.id)}
                  className={clsx(
                    'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                    filter === filterOption.id
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </>
        )}
      </PageHeader>

      {/* Channels Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 md:p-6">
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
              <EmptyState
                icon={HashtagIcon}
                title="No channels found"
                description={
                  searchQuery
                    ? 'Try different search terms.'
                    : 'Create your first channel to start broadcasting.'
                }
                action={
                  !searchQuery && (
                    <Button variant="primary" onClick={() => setShowCreate(true)}>
                      Create channel
                    </Button>
                  )
                }
              />
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
          <EmptyState
            icon={ChartBarIcon}
            title="Select a channel"
            description="Open a channel from the Browse tab to see its analytics."
            action={
              <Button variant="secondary" onClick={() => setActiveTab('browse')}>
                Browse channels
              </Button>
            }
          />
        )}

        {activeTab === 'scheduler' && ownedChannels.length === 0 && (
          <EmptyState
            icon={CalendarIcon}
            title="No channels to schedule for"
            description="Create a channel first — scheduled posts are published to that channel's subscribers."
            action={
              <Button variant="primary" onClick={() => setShowCreate(true)}>
                Create channel
              </Button>
            }
          />
        )}

        {activeTab === 'scheduler' && ownedChannels.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Channel</span>
              <div className="flex flex-wrap gap-2">
                {ownedChannels.map((channel) => (
                  <button
                    key={channel._id}
                    onClick={() => setSchedulerChannelId(channel._id)}
                    className={clsx(
                      'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                      schedulerChannelId === channel._id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    )}
                  >
                    {channel.name}
                  </button>
                ))}
              </div>
              {schedulerLoading && (
                <span className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
              )}
            </div>

            <ChannelPostScheduler
              channelId={schedulerChannelId}
              scheduledPosts={scheduledPosts}
              onSchedule={handleSchedulePost}
              onPublish={handlePublishNow}
              onDelete={handleDeleteScheduledPost}
            />
          </div>
        )}

        {activeTab === 'monetization' && selectedChannel && (
          <ChannelMonetization
            channel={selectedChannel}
            onManageTiers={(tier) => console.log('Manage tier:', tier)}
            onWithdraw={() => console.log('Withdraw funds')}
          />
        )}

        {activeTab === 'monetization' && !selectedChannel && (
          <EmptyState
            icon={CurrencyDollarIcon}
            title="Select a channel"
            description="Open a channel from the Browse tab to manage monetization."
            action={
              <Button variant="secondary" onClick={() => setActiveTab('browse')}>
                Browse channels
              </Button>
            }
          />
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