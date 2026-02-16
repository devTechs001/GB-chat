import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import Avatar from '../common/Avatar'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { formatNumber } from '../../lib/formatters'

const ChannelFeed = ({ channelId }) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [channelId])

  const fetchPosts = async () => {
    try {
      const { data } = await api.get(`/channels/${channelId}/posts`)
      setPosts(data.posts)
    } catch (error) {
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId) => {
    try {
      await api.post(`/channels/posts/${postId}/like`)
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
              }
            : post
        )
      )
    } catch (error) {
      toast.error('Failed to like post')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {posts.map((post, index) => (
          <motion.div
            key={post._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm"
          >
            {/* Post Header */}
            <div className="p-4 flex items-center gap-3">
              <Avatar src={post.channel?.avatar} alt={post.channel?.name} size="sm" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {post.channel?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            {/* Post Content */}
            {post.content && (
              <div className="px-4 pb-3">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
            )}

            {/* Post Media */}
            {post.media && (
              <div className="relative">
                {post.media.type === 'image' ? (
                  <img
                    src={post.media.url}
                    alt=""
                    className="w-full max-h-96 object-cover"
                  />
                ) : post.media.type === 'video' ? (
                  <video src={post.media.url} controls className="w-full max-h-96" />
                ) : null}
              </div>
            )}

            {/* Post Actions */}
            <div className="p-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => handleLike(post._id)}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
                >
                  {post.isLiked ? (
                    <HeartSolidIcon className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5" />
                  )}
                  <span className="text-sm">{formatNumber(post.likeCount || 0)}</span>
                </button>

                <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
                  <ChatBubbleLeftIcon className="w-5 h-5" />
                  <span className="text-sm">{formatNumber(post.commentCount || 0)}</span>
                </button>

                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <EyeIcon className="w-5 h-5" />
                  <span className="text-sm">{formatNumber(post.viewCount || 0)}</span>
                </div>
              </div>

              <button className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
                <ShareIcon className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No posts yet</p>
        </div>
      )}
    </div>
  )
}

export default ChannelFeed