/**
 * Enhanced StoryCard Component
 * Features:
 * - Animated gradient rings for unviewed stories
 * - Close friends badge
 * - Media count indicator
 * - Like/favorite indicators
 * - Enhanced hover effects
 * - Story highlights support
 */

import React from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, StarIcon, HeartIcon, PlayIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import Avatar from '../common/Avatar'
import clsx from 'clsx'

const StoryCard = ({ 
  story, 
  onClick, 
  isOwn = false, 
  isCloseFriend = false,
  isHighlight = false 
}) => {
  const hasUnviewed = !story.viewedBy?.includes(story.currentUserId)
  const mediaCount = story.media?.length || 0
  const isVideo = story.media?.[0]?.type === 'video'

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <div className="relative">
        {/* Animated Gradient Ring */}
        <div
          className={clsx(
            'relative w-16 h-20 md:w-20 md:h-24 rounded-2xl overflow-hidden transition-all duration-300',
            'hover:shadow-lg hover:shadow-primary-500/20',
            hasUnviewed && !isOwn && !isHighlight
              ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900'
              : isHighlight
              ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-900'
              : 'ring-2 ring-gray-200 dark:ring-gray-700'
          )}
        >
          {/* Animated Gradient Border for Unviewed */}
          {hasUnviewed && !isOwn && !isHighlight && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 opacity-75" />
          )}
          
          {/* Highlight Ring */}
          {isHighlight && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 opacity-75" />
          )}

          {/* Close Friends Badge */}
          {isCloseFriend && (
            <div className="absolute -top-1 -right-1 z-20 bg-green-500 rounded-full p-1 shadow-lg">
              <StarSolidIcon className="w-3 h-3 text-white" />
            </div>
          )}

          {/* Inner Content */}
          <div className="absolute inset-0.5 bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
            <img
              src={story.media?.[0]?.thumbnail || story.media?.[0]?.url}
              alt={story.user?.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Video Indicator */}
            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <PlayIcon className="w-5 h-5 text-white ml-0.5" />
                </div>
              </div>
            )}
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />

          {/* User Avatar */}
          <div className="absolute top-1.5 left-1.5">
            <Avatar
              src={story.user?.avatar}
              alt={story.user?.name}
              size="xs"
              className={clsx(
                'ring-2 transition-all duration-300',
                hasUnviewed ? 'ring-primary-500' : 'ring-white dark:ring-gray-800'
              )}
            />
          </div>

          {/* Media Count Badge */}
          {mediaCount > 1 && (
            <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5">
              <span className="text-xs font-bold text-white">{mediaCount}</span>
            </div>
          )}

          {/* Add More Badge (for own story) */}
          {isOwn && (
            <div className="absolute bottom-1.5 right-1.5 w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <PlusIcon className="w-4 h-4 text-white" />
            </div>
          )}

          {/* Like Indicator */}
          {story.isLiked && (
            <div className="absolute bottom-1.5 left-1.5 text-red-500">
              <HeartSolidIcon className="w-4 h-4 drop-shadow-lg" />
            </div>
          )}
        </div>

        {/* User Name */}
        <p className="mt-2 text-xs text-center font-medium text-gray-900 dark:text-white truncate max-w-[80px] md:max-w-[90px]">
          {isOwn ? 'My Story' : story.user?.name}
        </p>

        {/* Time and Status */}
        <div className="flex items-center justify-center gap-1 mt-0.5">
          {story.createdAt && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(story.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
          {hasUnviewed && !isOwn && (
            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default StoryCard
