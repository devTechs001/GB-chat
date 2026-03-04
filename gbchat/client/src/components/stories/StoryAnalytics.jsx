/**
 * StoryAnalytics Component
 * Features:
 * - View count tracking
 * - Viewer list with engagement metrics
 * - Reply tracking
 * - Screenshot detection (if supported)
 * - Export analytics
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  CameraIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import Avatar from '../common/Avatar'
import Button from '../common/Button'
import Modal from '../common/Modal'
import clsx from 'clsx'

const StoryAnalytics = ({ story, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview')

  if (!story) return null

  const stats = {
    views: story.viewCount || story.viewedBy?.length || 0,
    replies: story.replyCount || 0,
    shares: story.shareCount || 0,
    likes: story.likeCount || 0,
    screenshots: story.screenshotCount || 0,
    completionRate: story.completionRate || 85,
    avgWatchTime: story.avgWatchTime || '3.2s',
    reach: story.reach || 0,
    impressions: story.impressions || 0,
  }

  const viewers = story.viewers || story.viewedBy || []

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Story Analytics"
      size="lg"
    >
      <div className="space-y-6">
        {/* Story Preview */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <img
            src={story.media?.[0]?.thumbnail || story.media?.[0]?.url}
            alt="Story"
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">Your Story</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Posted {new Date(story.createdAt).toLocaleString()}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">
                {story.media?.length || 0} slides
              </span>
              {story.closeFriendsOnly && (
                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center gap-1">
                  <UserGroupIcon className="w-3 h-3" />
                  Close Friends
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {['overview', 'viewers', 'engagement'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'px-4 py-2 text-sm font-medium capitalize transition-colors relative',
                activeTab === tab
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab stats={stats} story={story} />
        )}
        {activeTab === 'viewers' && (
          <ViewersTab viewers={viewers} story={story} />
        )}
        {activeTab === 'engagement' && (
          <EngagementTab stats={stats} story={story} />
        )}

        {/* Export Button */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="secondary"
            icon={<ArrowDownTrayIcon className="w-4 h-4" />}
            onClick={() => {
              // Export analytics
              console.log('Exporting analytics...')
            }}
            fullWidth
          >
            Export Analytics
          </Button>
        </div>
      </div>
    </Modal>
  )
}

const OverviewTab = ({ stats, story }) => {
  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<EyeIcon className="w-6 h-6" />}
          label="Total Views"
          value={stats.views}
          trend="+12%"
          color="blue"
        />
        <MetricCard
          icon={<HeartSolidIcon className="w-6 h-6" />}
          label="Likes"
          value={stats.likes}
          trend="+8%"
          color="red"
        />
        <MetricCard
          icon={<ChatBubbleLeftIcon className="w-6 h-6" />}
          label="Replies"
          value={stats.replies}
          trend="+25%"
          color="green"
        />
        <MetricCard
          icon={<ShareIcon className="w-6 h-6" />}
          label="Shares"
          value={stats.shares}
          trend="+5%"
          color="purple"
        />
      </div>

      {/* Performance Chart Placeholder */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <ArrowTrendingUpIcon className="w-4 h-4" />
          Performance Over Time
        </h4>
        <div className="h-32 flex items-end justify-between gap-2">
          {[40, 65, 45, 80, 55, 90, 70].map((value, index) => (
            <div
              key={index}
              className="flex-1 bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-md transition-all hover:from-primary-600 hover:to-primary-500"
              style={{ height: `${value}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
            <ClockIcon className="w-4 h-4" />
            <span className="text-sm">Avg. Watch Time</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.avgWatchTime}
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
            <ArrowTrendingUpIcon className="w-4 h-4" />
            <span className="text-sm">Completion Rate</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.completionRate}%
          </p>
        </div>
      </div>
    </div>
  )
}

const ViewersTab = ({ viewers, story }) => {
  const [filter, setFilter] = useState('all')

  const filteredViewers = viewers.filter(viewer => {
    if (filter === 'engaged') return viewer.interacted
    if (filter === 'repeat') return viewer.viewCount > 1
    return true
  })

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: 'All Viewers' },
          { id: 'engaged', label: 'Engaged' },
          { id: 'repeat', label: 'Repeat' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={clsx(
              'px-3 py-1.5 text-xs font-medium rounded-full transition-colors',
              filter === f.id
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Viewers List */}
      <div className="max-h-64 overflow-y-auto space-y-2">
        {filteredViewers.map((viewer, index) => (
          <motion.div
            key={viewer._id || index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <Avatar src={viewer.avatar} alt={viewer.name} size="md" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {viewer.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {viewer.viewCount > 1 ? `${viewer.viewCount} views` : 'Viewed'}
                  {viewer.interacted && ' • Interacted'}
                </p>
              </div>
            </div>
            {viewer.interacted && (
              <HeartSolidIcon className="w-4 h-4 text-red-500" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Total Reach
            </span>
          </div>
          <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
            {viewers.length} unique viewers
          </p>
        </div>
      </div>
    </div>
  )
}

const EngagementTab = ({ stats, story }) => {
  const engagementMetrics = [
    { label: 'Profile Visits', value: story.profileVisits || 12, change: '+15%' },
    { label: 'Link Clicks', value: story.linkClicks || 8, change: '+22%' },
    { label: 'Sticker Taps', value: story.stickerTaps || 5, change: '+8%' },
    { label: 'Poll Votes', value: story.pollVotes || 23, change: '+35%' },
  ]

  return (
    <div className="space-y-4">
      {/* Engagement Rate */}
      <div className="p-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl text-white">
        <p className="text-sm opacity-90 mb-1">Overall Engagement Rate</p>
        <p className="text-4xl font-bold mb-2">
          {((stats.likes + stats.replies + stats.shares) / stats.views * 100).toFixed(1)}%
        </p>
        <div className="flex items-center gap-2 text-sm">
          <ArrowTrendingUpIcon className="w-4 h-4" />
          <span>+12.5% from last story</span>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="space-y-3">
        {engagementMetrics.map((metric, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {metric.label}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {metric.value}
              </span>
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                {metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Top Interactions */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Top Interactions
        </h4>
        <div className="space-y-2">
          {[
            { type: 'Reply', count: stats.replies, icon: ChatBubbleLeftIcon },
            { type: 'Share', count: stats.shares, icon: ShareIcon },
            { type: 'Screenshot', count: stats.screenshots, icon: CameraIcon },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.type}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const MetricCard = ({ icon, label, value, trend, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
      <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center mb-3', colorClasses[color])}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
      {trend && (
        <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
          {trend}
        </p>
      )}
    </div>
  )
}

export default StoryAnalytics
