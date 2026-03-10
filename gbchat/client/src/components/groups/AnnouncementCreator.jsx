/**
 * AnnouncementCreator Component
 * Features:
 * - Create group announcements
 * - Pin important announcements
 * - Add media attachments
 * - Schedule announcements
 * - Target specific member groups
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  SpeakerWaveIcon,
  PhotoIcon,
  LinkIcon,
  DocumentIcon,
  CalendarIcon,
  UsersIcon,
  XMarkIcon,
  CheckCircleIcon,
  PinIcon,
} from '@heroicons/react/24/outline'
import { PinIcon as PinIconSolid } from '@heroicons/react/24/solid'
import Button from '../common/Button'
import Input from '../common/Input'
import TextArea from '../common/TextArea'
import Modal from '../common/Modal'
import clsx from 'clsx'

const AnnouncementCreator = ({ groupId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPinned: false,
    attachments: [],
    targetAudience: 'all', // all, admins, members
    scheduleDate: '',
    scheduleTime: '',
  })
  const [showSchedule, setShowSchedule] = useState(false)

  const handleAddAttachment = (type) => {
    // In real app, this would open file picker or link input
    const attachment = {
      type,
      url: '',
      name: `Attachment ${formData.attachments.length + 1}`,
    }
    setFormData({ ...formData, attachments: [...formData.attachments, attachment] })
  }

  const handleRemoveAttachment = (index) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.content.trim()) return

    onSubmit({
      groupId,
      title: formData.title,
      content: formData.content,
      isPinned: formData.isPinned,
      attachments: formData.attachments,
      targetAudience: formData.targetAudience,
      scheduledAt: showSchedule && formData.scheduleDate && formData.scheduleTime
        ? new Date(`${formData.scheduleDate}T${formData.scheduleTime}`).toISOString()
        : null,
    })
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Create Announcement"
      size="lg"
    >
      <div className="space-y-4">
        {/* Title */}
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="What's the announcement?"
          maxLength={100}
          icon={<SpeakerWaveIcon className="w-4 h-4" />}
        />

        {/* Content */}
        <TextArea
          label="Content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Share important information with the group..."
          rows={4}
          maxLength={1000}
        />

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Attachments
          </label>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => handleAddAttachment('image')}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <PhotoIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Image</span>
            </button>
            <button
              onClick={() => handleAddAttachment('link')}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <LinkIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Link</span>
            </button>
            <button
              onClick={() => handleAddAttachment('document')}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <DocumentIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Doc</span>
            </button>
          </div>

          {formData.attachments.length > 0 && (
            <div className="space-y-2">
              {formData.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {attachment.type === 'image' && <PhotoIcon className="w-5 h-5 text-primary-500" />}
                    {attachment.type === 'link' && <LinkIcon className="w-5 h-5 text-blue-500" />}
                    {attachment.type === 'document' && <DocumentIcon className="w-5 h-5 text-purple-500" />}
                    <span className="text-sm text-gray-700 dark:text-gray-300">{attachment.name}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveAttachment(index)}
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <XMarkIcon className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Options */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Announcement Options</h4>

          {/* Pin Announcement */}
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              {formData.isPinned ? (
                <PinIconSolid className="w-5 h-5 text-primary-500" />
              ) : (
                <PinIcon className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Pin announcement</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Keep at the top of the group</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              className="toggle-switch"
            />
          </label>

          {/* Target Audience */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              <UsersIcon className="w-4 h-4 inline mr-1" />
              Target Audience
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'Everyone', icon: '👥' },
                { id: 'admins', label: 'Admins Only', icon: '🛡️' },
                { id: 'members', label: 'Members', icon: '👤' },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setFormData({ ...formData, targetAudience: option.id })}
                  className={clsx(
                    'p-3 rounded-lg text-sm font-medium transition-all',
                    formData.targetAudience === option.id
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  )}
                >
                  <span className="text-lg block mb-1">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className={clsx(
                'flex items-center gap-3 w-full p-3 rounded-lg transition-all',
                showSchedule
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500'
                  : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
              )}
            >
              <CalendarIcon className={clsx(
                'w-5 h-5',
                showSchedule ? 'text-primary-500' : 'text-gray-400'
              )} />
              <div className="flex-1 text-left">
                <p className={clsx(
                  'text-sm font-medium',
                  showSchedule ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'
                )}>
                  Schedule for later
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {showSchedule ? 'Set date and time' : 'Post immediately'}
                </p>
              </div>
              {showSchedule && <CheckCircleIcon className="w-5 h-5 text-primary-500" />}
            </button>

            {showSchedule && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
              >
                <Input
                  label="Date"
                  type="date"
                  value={formData.scheduleDate}
                  onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
                <Input
                  label="Time"
                  type="time"
                  value={formData.scheduleTime}
                  onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!formData.title.trim() || !formData.content.trim()}
            fullWidth
          >
            {showSchedule ? 'Schedule Announcement' : 'Post Announcement'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default AnnouncementCreator
