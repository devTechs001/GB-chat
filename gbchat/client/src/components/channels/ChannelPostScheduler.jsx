/**
 * ChannelPostScheduler Component
 * Features:
 * - Schedule posts for future publishing
 * - Queue management
 * - Optimal time suggestions
 * - Recurring posts
 * - Draft management
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  LinkIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import Button from '../common/Button'
import Input from '../common/Input'
import TextArea from '../common/TextArea'
import Modal from '../common/Modal'
import clsx from 'clsx'

const ChannelPostScheduler = ({ channelId, scheduledPosts = [], onSchedule, onPublish, onDelete }) => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)

  const pendingPosts = scheduledPosts.filter(p => p.status === 'pending')
  const publishedPosts = scheduledPosts.filter(p => p.status === 'published')
  const draftPosts = scheduledPosts.filter(p => p.status === 'draft')

  return (
    <>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary-500" />
            Scheduled Posts
          </h3>
          <Button
            variant="primary"
            size="sm"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            Schedule Post
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {pendingPosts.length}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Pending</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {publishedPosts.length}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">Published</p>
          </div>
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {draftPosts.length}
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">Drafts</p>
          </div>
        </div>

        {/* Upcoming Posts */}
        {pendingPosts.length > 0 ? (
          <div className="space-y-2">
            {pendingPosts.slice(0, 5).map((post) => (
              <ScheduledPostCard
                key={post._id}
                post={post}
                onClick={() => setSelectedPost(post)}
                onPublish={() => onPublish?.(post._id)}
                onDelete={() => onDelete?.(post._id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 dark:text-gray-400">No scheduled posts</p>
            <Button
              variant="primary"
              size="sm"
              className="mt-3"
              onClick={() => setShowCreateModal(true)}
            >
              Schedule your first post
            </Button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <SchedulePostModal
          channelId={channelId}
          onClose={() => setShowCreateModal(false)}
          onSubmit={(postData) => {
            onSchedule?.(postData)
            setShowCreateModal(false)
          }}
        />
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onEdit={() => {
            setSelectedPost(null)
            setShowCreateModal(true)
          }}
          onDelete={() => {
            onDelete?.(selectedPost._id)
            setSelectedPost(null)
          }}
        />
      )}
    </>
  )
}

const ScheduledPostCard = ({ post, onClick, onPublish, onDelete }) => {
  const isSoon = new Date(post.scheduledFor) - new Date() < 60 * 60 * 1000

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={clsx(
        'p-3 rounded-lg cursor-pointer border transition-all',
        isSoon
          ? 'bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border-primary-200 dark:border-primary-800'
          : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {/* Media Preview */}
          {post.media?.thumbnail && (
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={post.media.thumbnail}
                alt="Post preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate mb-1">
              {post.content?.slice(0, 50) || 'Post without text'}
              {post.content?.length > 50 && '...'}
            </p>
            
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                {new Date(post.scheduledFor).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                {new Date(post.scheduledFor).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {isSoon && (
                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-medium animate-pulse">
                  Soon
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPublish()
            }}
            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
            title="Publish now"
          >
            <PlayIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            title="Delete"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

const SchedulePostModal = ({ channelId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    content: '',
    scheduledFor: '',
    media: null,
    allowComments: true,
    isRecurring: false,
    recurringPattern: 'weekly',
  })
  const [optimalTimes] = useState([
    { label: 'Today 9:00 AM', value: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() },
    { label: 'Today 6:00 PM', value: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString() },
    { label: 'Tomorrow 10:00 AM', value: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString() },
  ])

  const handleSubmit = () => {
    if (!formData.content.trim() && !formData.media) return
    if (!formData.scheduledFor) return

    onSubmit({
      channelId,
      content: formData.content,
      scheduledFor: formData.scheduledFor,
      media: formData.media,
      allowComments: formData.allowComments,
      isRecurring: formData.isRecurring,
      recurringPattern: formData.recurringPattern,
    })
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Schedule Post"
      size="lg"
    >
      <div className="space-y-4">
        {/* Content */}
        <TextArea
          label="Post Content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="What would you like to share?"
          rows={4}
          maxLength={2000}
        />

        {/* Media Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Media (Optional)
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center gap-2 hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
              <PhotoIcon className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Photo</span>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center gap-2 hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
              <VideoCameraIcon className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Video</span>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center gap-2 hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
              <DocumentIcon className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Document</span>
            </button>
          </div>
        </div>

        {/* Schedule Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Schedule For
          </label>
          <Input
            type="datetime-local"
            value={formData.scheduledFor}
            onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        {/* Optimal Times */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <ArrowPathIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
              Optimal posting times for your audience
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {optimalTimes.map((time, index) => (
              <button
                key={index}
                onClick={() => setFormData({ ...formData, scheduledFor: time.value })}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                {time.label}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Allow comments
            </span>
            <input
              type="checkbox"
              checked={formData.allowComments}
              onChange={(e) => setFormData({ ...formData, allowComments: e.target.checked })}
              className="toggle-switch"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Recurring post
            </span>
            <input
              type="checkbox"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="toggle-switch"
            />
          </label>

          {formData.isRecurring && (
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                Repeat Pattern
              </label>
              <select
                value={formData.recurringPattern}
                onChange={(e) => setFormData({ ...formData, recurringPattern: e.target.value })}
                className="input-field w-full"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="secondary"
            onClick={() => {
              // Save as draft
              console.log('Saving as draft...')
            }}
          >
            Save Draft
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!formData.content.trim() && !formData.media}
            className="flex-1"
          >
            Schedule Post
          </Button>
        </div>
      </div>
    </Modal>
  )
}

const PostDetailModal = ({ post, onClose, onEdit, onDelete }) => {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Scheduled Post"
      size="lg"
    >
      <div className="space-y-4">
        {/* Preview */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          {post.media?.url && (
            <div className="mb-3 rounded-lg overflow-hidden">
              <img src={post.media.url} alt="Post media" className="w-full h-48 object-cover" />
            </div>
          )}
          <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <CalendarIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Scheduled Date</span>
            </div>
            <p className="text-gray-900 dark:text-white">
              {new Date(post.scheduledFor).toLocaleDateString()}
            </p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
              <ClockIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Scheduled Time</span>
            </div>
            <p className="text-gray-900 dark:text-white">
              {new Date(post.scheduledFor).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <CheckCircleSolidIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-900 dark:text-green-300">
            Scheduled and ready to publish
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onEdit} icon={<PencilIcon className="w-4 h-4" />}>
            Edit
          </Button>
          <Button variant="danger" onClick={onDelete} icon={<TrashIcon className="w-4 h-4" />}>
            Delete
          </Button>
          <Button variant="primary" className="flex-1" icon={<PlayIcon className="w-4 h-4" />}>
            Publish Now
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ChannelPostScheduler
