import React from 'react'
import { motion } from 'framer-motion'
import { PlusIcon } from '@heroicons/react/24/outline'
import Avatar from '../common/Avatar'
import clsx from 'clsx'

const StoryCard = ({ story, onClick, isOwn = false }) => {
  const hasUnviewed = !story.viewedBy?.includes(story.currentUserId)

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <div className="relative">
        {/* Story Ring */}
        <div
          className={clsx(
            'relative w-16 h-20 md:w-20 md:h-24 rounded-lg overflow-hidden',
            hasUnviewed && !isOwn
              ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900'
              : 'ring-2 ring-gray-200 dark:ring-gray-700'
          )}
        >
          {/* Story Image/Video */}
          <img
            src={story.media?.[0]?.thumbnail || story.media?.[0]?.url}
            alt={story.user?.name}
            className="w-full h-full object-cover"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />

          {/* User Avatar */}
          <div className="absolute top-2 left-2">
            <Avatar
              src={story.user?.avatar}
              alt={story.user?.name}
              size="xs"
              className={clsx(
                'ring-2',
                hasUnviewed ? 'ring-primary-500' : 'ring-white dark:ring-gray-800'
              )}
            />
          </div>

          {/* Add More Badge (for own story) */}
          {isOwn && (
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
              <PlusIcon className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* User Name */}
        <p className="mt-2 text-xs text-center font-medium text-gray-900 dark:text-white truncate">
          {isOwn ? 'My Story' : story.user?.name}
        </p>

        {/* Time */}
        {story.createdAt && (
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            {new Date(story.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </motion.div>
  )
}

export default StoryCard