/**
 * EventCreator Component
 * Features:
 * - Create group events
 * - Set event date, time, and location
 * - Online/offline event support
 * - RSVP reminders
 * - Event recurrence options
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarIcon,
  MapPinIcon,
  GlobeAltIcon,
  ClockIcon,
  UsersIcon,
  BellIcon,
  XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import Button from '../common/Button'
import Input from '../common/Input'
import TextArea from '../common/TextArea'
import Modal from '../common/Modal'
import clsx from 'clsx'

const EventCreator = ({ isOpen, onClose, onSubmit, chatId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    isOnline: false,
    onlineLink: '',
    sendReminder: true,
    reminderTime: '30', // minutes before
    maxAttendees: '',
    isRecurring: false,
    recurringType: 'none', // daily, weekly, monthly
  })

  const [errors, setErrors] = useState({})

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required'
    }
    
    if (!formData.date) {
      newErrors.date = 'Event date is required'
    }
    
    if (!formData.time) {
      newErrors.time = 'Event time is required'
    }
    
    if (!formData.isOnline && !formData.location.trim()) {
      newErrors.location = 'Location is required for offline events'
    }
    
    if (formData.isOnline && !formData.onlineLink.trim()) {
      newErrors.onlineLink = 'Meeting link is required for online events'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const eventData = {
      ...formData,
      date: new Date(`${formData.date}T${formData.time}`).toISOString(),
      chatId
    }

    onSubmit(eventData)
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) return null

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create Event
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <Input
              label="Event Title"
              placeholder="Enter event title"
              value={formData.title}
              onChange={(value) => handleInputChange('title', value)}
              error={errors.title}
              required
            />

            <TextArea
              label="Description"
              placeholder="Describe your event..."
              value={formData.description}
              onChange={(value) => handleInputChange('description', value)}
              rows={3}
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(value) => handleInputChange('date', value)}
              error={errors.date}
              required
              min={new Date().toISOString().split('T')[0]}
            />

            <Input
              label="Time"
              type="time"
              value={formData.time}
              onChange={(value) => handleInputChange('time', value)}
              error={errors.time}
              required
            />
          </div>

          {/* Event Type Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className={clsx(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                formData.isOnline ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-green-100 dark:bg-green-900/20'
              )}>
                {formData.isOnline ? (
                  <GlobeAltIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <MapPinIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formData.isOnline ? 'Online Event' : 'Offline Event'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formData.isOnline ? 'Virtual meeting' : 'Physical location'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleInputChange('isOnline', !formData.isOnline)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              style={{
                backgroundColor: formData.isOnline ? '#3b82f6' : '#10b981'
              }}
            >
              <span
                className={clsx(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  formData.isOnline ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          {/* Location / Meeting Link */}
          {formData.isOnline ? (
            <Input
              label="Meeting Link"
              type="url"
              placeholder="https://zoom.us/j/..."
              value={formData.onlineLink}
              onChange={(value) => handleInputChange('onlineLink', value)}
              error={errors.onlineLink}
              icon={<GlobeAltIcon className="w-5 h-5 text-gray-400" />}
              required
            />
          ) : (
            <Input
              label="Location"
              placeholder="Enter event location"
              value={formData.location}
              onChange={(value) => handleInputChange('location', value)}
              error={errors.location}
              icon={<MapPinIcon className="w-5 h-5 text-gray-400" />}
              required
            />
          )}

          {/* Additional Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BellIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Send Reminder</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Notify attendees before event</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.sendReminder}
                onChange={(e) => handleInputChange('sendReminder', e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded border-gray-300 dark:border-gray-600 focus:ring-primary-500"
              />
            </div>

            {formData.sendReminder && (
              <div className="ml-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reminder Time
                </label>
                <select
                  value={formData.reminderTime}
                  onChange={(e) => handleInputChange('reminderTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="15">15 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                  <option value="1440">1 day before</option>
                </select>
              </div>
            )}

            <Input
              label="Maximum Attendees (Optional)"
              type="number"
              placeholder="Leave empty for unlimited"
              value={formData.maxAttendees}
              onChange={(value) => handleInputChange('maxAttendees', value)}
              min="1"
              icon={<UsersIcon className="w-5 h-5 text-gray-400" />}
            />
          </div>

          {/* Event Preview */}
          {(formData.title || formData.date) && (
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
              <h4 className="text-sm font-medium text-primary-900 dark:text-primary-100 mb-2">Event Preview</h4>
              <div className="space-y-1 text-sm text-primary-700 dark:text-primary-300">
                {formData.title && <p className="font-medium">{formData.title}</p>}
                {formData.date && formData.time && (
                  <p className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {formatDateTime(`${formData.date}T${formData.time}`)}
                  </p>
                )}
                {(formData.location || formData.onlineLink) && (
                  <p className="flex items-center gap-2">
                    {formData.isOnline ? <GlobeAltIcon className="w-4 h-4" /> : <MapPinIcon className="w-4 h-4" />}
                    {formData.isOnline ? 'Online Event' : formData.location}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              icon={<CheckCircleIcon className="w-4 h-4" />}
            >
              Create Event
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default EventCreator
