import React from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  FireIcon,
  ClockIcon,
  EyeIcon,
  StarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PhotoIcon,
  LinkIcon,
  MapPinIcon,
  GiftIcon,
  TrophyIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import {
  FireIcon as FireIconSolid,
} from '@heroicons/react/24/solid'
import clsx from 'clsx'

const GroupInsights = ({ groups, onClose }) => {
  // Calculate insights
  const calculateInsights = () => {
    const totalGroups = groups.length
    const activeGroups = groups.filter(g => {
      const lastMessage = new Date(g.lastMessageAt || g.createdAt)
      const daysSinceLastMessage = (new Date() - lastMessage) / (1000 * 60 * 60 * 24)
      return daysSinceLastMessage <= 7
    }).length
    
    const totalMembers = groups.reduce((sum, g) => sum + (g.members?.length || 0), 0)
    const totalMessages = groups.reduce((sum, g) => sum + (g.messageCount || 0), 0)
    
    const avgMembersPerGroup = totalGroups > 0 ? Math.round(totalMembers / totalGroups) : 0
    const avgMessagesPerGroup = totalGroups > 0 ? Math.round(totalMessages / totalGroups) : 0
    
    const mostActive = groups
      .sort((a, b) => (b.messageCount || 0) - (a.messageCount || 0))
      .slice(0, 5)
    
    const largestGroups = groups
      .sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0))
      .slice(0, 5)
    
    const newestGroups = groups
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
    
    const groupTypes = {
      group: groups.filter(g => g.type === 'group').length,
      channel: groups.filter(g => g.type === 'channel').length,
      broadcast: groups.filter(g => g.type === 'broadcast').length,
    }
    
    const privacyTypes = {
      public: groups.filter(g => g.privacy === 'public').length,
      private: groups.filter(g => g.privacy === 'private').length,
    }
    
    return {
      totalGroups,
      activeGroups,
      totalMembers,
      totalMessages,
      avgMembersPerGroup,
      avgMessagesPerGroup,
      mostActive,
      largestGroups,
      newestGroups,
      groupTypes,
      privacyTypes,
    }
  }
  
  const insights = calculateInsights()
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Group Insights</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Analytics and performance metrics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <UserGroupIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total</span>
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{insights.totalGroups}</div>
            <div className="text-xs text-blue-700 dark:text-blue-300">Groups</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">Active</span>
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{insights.activeGroups}</div>
            <div className="text-xs text-green-700 dark:text-green-300">This week</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-2">
              <UsersIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Total</span>
            </div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{insights.totalMembers}</div>
            <div className="text-xs text-purple-700 dark:text-purple-300">Members</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between mb-2">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Total</span>
            </div>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{insights.totalMessages}</div>
            <div className="text-xs text-orange-700 dark:text-orange-300">Messages</div>
          </div>
        </div>
        
        {/* Averages */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <UsersIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Average Members per Group</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{insights.avgMembersPerGroup}</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Average Messages per Group</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{insights.avgMessagesPerGroup}</div>
          </div>
        </div>
        
        {/* Group Types Distribution */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Group Types</h3>
          <div className="space-y-3">
            {Object.entries(insights.groupTypes).map(([type, count]) => {
              const percentage = insights.totalGroups > 0 ? (count / insights.totalGroups) * 100 : 0
              return (
                <div key={type} className="flex items-center gap-3">
                  <div className="w-20 text-sm font-medium text-gray-900 dark:text-white capitalize">{type}</div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-sm text-gray-600 dark:text-gray-400">{count}</div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Top Lists */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Most Active */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <FireIconSolid className="w-4 h-4 text-orange-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Most Active</h3>
            </div>
            <div className="space-y-2">
              {insights.mostActive.map((group, index) => (
                <div key={group._id} className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-xs font-bold text-orange-600 dark:text-orange-400">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{group.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{group.messageCount || 0} messages</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Largest Groups */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <UsersIcon className="w-4 h-4 text-blue-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Largest Groups</h3>
            </div>
            <div className="space-y-2">
              {insights.largestGroups.map((group, index) => (
                <div key={group._id} className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{group.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{group.members?.length || 0} members</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Newest Groups */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <StarIcon className="w-4 h-4 text-green-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Newest Groups</h3>
            </div>
            <div className="space-y-2">
              {insights.newestGroups.map((group, index) => (
                <div key={group._id} className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-xs font-bold text-green-600 dark:text-green-400">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{group.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(group.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GroupInsights
