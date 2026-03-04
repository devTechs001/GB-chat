/**
 * ChannelAnalytics Component
 * Features:
 * - Subscriber growth tracking
 * - Post performance metrics
 * - Engagement analytics
 * - Audience demographics
 * - Export reports
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  UserGroupIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import Button from '../common/Button'
import Modal from '../common/Modal'
import clsx from 'clsx'

const ChannelAnalytics = ({ channel, onClose }) => {
  const [timeRange, setTimeRange] = useState('7d')
  const [activeTab, setActiveTab] = useState('overview')

  // Mock analytics data - replace with real API data
  const analytics = {
    subscribers: {
      total: channel.subscriberCount || 12500,
      growth: 12.5,
      new: 856,
      unsubscribed: 124,
    },
    posts: {
      total: channel.postCount || 245,
      thisPeriod: 12,
      avgPerWeek: 8.5,
    },
    engagement: {
      rate: 8.4,
      likes: 45200,
      comments: 8900,
      shares: 12300,
      views: 285000,
    },
    topPosts: [
      { id: 1, title: 'Amazing announcement', views: 15400, likes: 2300, shares: 450 },
      { id: 2, title: 'Product update', views: 12200, likes: 1800, shares: 320 },
      { id: 3, title: 'Community spotlight', views: 9800, likes: 1500, shares: 280 },
    ],
    audience: {
      topCountries: [
        { country: 'United States', percentage: 35, flag: '🇺🇸' },
        { country: 'United Kingdom', percentage: 18, flag: '🇬🇧' },
        { country: 'India', percentage: 15, flag: '🇮🇳' },
        { country: 'Canada', percentage: 12, flag: '🇨🇦' },
        { country: 'Australia', percentage: 8, flag: '🇦🇺' },
      ],
      ageGroups: [
        { range: '18-24', percentage: 25 },
        { range: '25-34', percentage: 40 },
        { range: '35-44', percentage: 20 },
        { range: '45+', percentage: 15 },
      ],
      gender: {
        male: 55,
        female: 43,
        other: 2,
      },
    },
    activity: {
      peakHours: [9, 12, 18, 20],
      peakDays: ['Monday', 'Wednesday', 'Friday'],
    },
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Channel Analytics"
      size="xl"
    >
      <div className="space-y-6">
        {/* Time Range Selector */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {[
              { id: '24h', label: '24H' },
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
            ].map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={clsx(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  timeRange === range.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowDownTrayIcon className="w-4 h-4" />}
            onClick={() => {
              // Export analytics
              console.log('Exporting analytics...')
            }}
          >
            Export
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {['overview', 'audience', 'posts', 'activity'].map((tab) => (
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
        {activeTab === 'overview' && <OverviewTab analytics={analytics} />}
        {activeTab === 'audience' && <AudienceTab analytics={analytics.audience} />}
        {activeTab === 'posts' && <PostsTab analytics={analytics} />}
        {activeTab === 'activity' && <ActivityTab analytics={analytics.activity} />}
      </div>
    </Modal>
  )
}

const OverviewTab = ({ analytics }) => {
  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<UserGroupIcon className="w-6 h-6" />}
          label="Total Subscribers"
          value={analytics.subscribers.total.toLocaleString()}
          trend={analytics.subscribers.growth}
          trendLabel="vs last period"
          color="blue"
        />
        <MetricCard
          icon={<EyeIcon className="w-6 h-6" />}
          label="Total Views"
          value={analytics.engagement.views.toLocaleString()}
          trend={15.2}
          trendLabel="vs last period"
          color="purple"
        />
        <MetricCard
          icon={<HeartSolidIcon className="w-6 h-6" />}
          label="Total Likes"
          value={analytics.engagement.likes.toLocaleString()}
          trend={8.7}
          trendLabel="vs last period"
          color="red"
        />
        <MetricCard
          icon={<ShareIcon className="w-6 h-6" />}
          label="Total Shares"
          value={analytics.engagement.shares.toLocaleString()}
          trend={22.3}
          trendLabel="vs last period"
          color="green"
        />
      </div>

      {/* Subscriber Growth Chart */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Subscriber Growth
        </h3>
        <div className="h-48 flex items-end justify-between gap-2">
          {[65, 72, 68, 85, 92, 88, 95, 100, 98, 105, 110, 108].map((value, index) => (
            <div
              key={index}
              className="flex-1 bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-md transition-all hover:from-primary-600 hover:to-primary-500 relative group"
              style={{ height: `${value}%` }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {Math.round(value * 100)} subscribers
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Week 1</span>
          <span>Week 2</span>
          <span>Week 3</span>
          <span>Week 4</span>
        </div>
      </div>

      {/* Engagement Rate */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Engagement Overview
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">
              {analytics.engagement.rate}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Engagement Rate
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {Math.round(analytics.engagement.likes / analytics.posts.total)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Avg Likes/Post
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {Math.round(analytics.engagement.views / analytics.posts.total)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Avg Views/Post
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const AudienceTab = ({ analytics }) => {
  return (
    <div className="space-y-6">
      {/* Demographics */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Age Groups */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5" />
            Age Distribution
          </h4>
          <div className="space-y-3">
            {analytics.ageGroups.map((group, index) => (
              <div key={index}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{group.range}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{group.percentage}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${group.percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gender */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">
            Gender Distribution
          </h4>
          <div className="space-y-3">
            {[
              { label: 'Male', percentage: analytics.gender.male, color: 'blue' },
              { label: 'Female', percentage: analytics.gender.female, color: 'pink' },
              { label: 'Other', percentage: analytics.gender.other, color: 'purple' },
            ].map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{item.percentage}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`h-full bg-gradient-to-r from-${item.color}-500 to-${item.color}-400 rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Countries */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <GlobeAltIcon className="w-5 h-5" />
          Top Countries
        </h4>
        <div className="space-y-3">
          {analytics.topCountries.map((country, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-xl">{country.flag}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{country.country}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{country.percentage}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${country.percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const PostsTab = ({ analytics }) => {
  return (
    <div className="space-y-6">
      {/* Post Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {analytics.posts.total}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Posts</div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {analytics.posts.thisPeriod}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">This Period</div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {analytics.posts.avgPerWeek}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Avg/Week</div>
        </div>
      </div>

      {/* Top Performing Posts */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
          Top Performing Posts
        </h4>
        <div className="space-y-3">
          {analytics.topPosts.map((post, index) => (
            <div
              key={post.id}
              className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {post.title}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span className="flex items-center gap-1">
                    <EyeIcon className="w-3 h-3" />
                    {post.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <HeartSolidIcon className="w-3 h-3 text-red-500" />
                    {post.likes.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <ShareIcon className="w-3 h-3" />
                    {post.shares}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const ActivityTab = ({ analytics }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  
  return (
    <div className="space-y-6">
      {/* Peak Hours */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <ClockIcon className="w-5 h-5" />
          Peak Activity Hours
        </h4>
        <div className="grid grid-cols-12 gap-1">
          {hours.map((hour) => {
            const isPeak = analytics.peakHours.includes(hour)
            const height = isPeak ? 60 + Math.random() * 40 : 20 + Math.random() * 30
            
            return (
              <div
                key={hour}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={clsx(
                    'w-full rounded-t transition-all hover:opacity-80',
                    isPeak ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                  )}
                  style={{ height: `${height}%`, minHeight: '20px' }}
                />
                {hour % 4 === 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {hour}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Peak Days */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
          Peak Activity Days
        </h4>
        <div className="flex gap-3 flex-wrap">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
            const isPeak = analytics.peakDays.includes(day)
            
            return (
              <div
                key={day}
                className={clsx(
                  'px-4 py-2 rounded-lg font-medium transition-all',
                  isPeak
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                )}
              >
                {day.slice(0, 3)}
              </div>
            )
          })}
        </div>
      </div>

      {/* Best Time to Post */}
      <div className="p-4 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl border border-primary-100 dark:border-primary-800">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          💡 Best Time to Post
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Based on your audience activity, the best times to post are:
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {analytics.peakDays.map((day) => (
            <span
              key={day}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-primary-600 dark:text-primary-400"
            >
              {day} at {analytics.peakHours[0]}:00
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

const MetricCard = ({ icon, label, value, trend, trendLabel, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  }

  const isPositive = trend > 0

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
      <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center mb-3', colorClasses[color])}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-1">
          {isPositive ? (
            <ArrowTrendingUpIcon className="w-3 h-3 text-green-600 dark:text-green-400" />
          ) : (
            <ArrowTrendingDownIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
          )}
          <span className="text-xs font-medium text-green-600 dark:text-green-400">
            {isPositive ? '+' : ''}{trend}%
          </span>
          {trendLabel && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}

export default ChannelAnalytics
