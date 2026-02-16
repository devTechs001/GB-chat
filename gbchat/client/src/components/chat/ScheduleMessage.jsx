import React, { useState } from 'react'
import {
  CalendarIcon,
  ClockIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const ScheduleMessage = ({ isOpen, onClose, chatId, message, onScheduled }) => {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSchedule = async () => {
    if (!date || !time) {
      toast.error('Please select date and time')
      return
    }

    const scheduledAt = new Date(`${date}T${time}`)
    
    if (scheduledAt <= new Date()) {
      toast.error('Please select a future date and time')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/messages/schedule', {
        chatId,
        content: message,
        scheduledAt: scheduledAt.toISOString(),
      })
      
      toast.success('Message scheduled successfully')
      onScheduled?.(data.scheduledMessage)
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule message')
    } finally {
      setLoading(false)
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  // Quick options
  const quickOptions = [
    { label: 'In 1 hour', hours: 1 },
    { label: 'In 3 hours', hours: 3 },
    { label: 'Tomorrow morning', preset: 'tomorrow_morning' },
    { label: 'Tomorrow evening', preset: 'tomorrow_evening' },
  ]

  const handleQuickOption = (option) => {
    const now = new Date()
    
    if (option.hours) {
      now.setHours(now.getHours() + option.hours)
    } else if (option.preset === 'tomorrow_morning') {
      now.setDate(now.getDate() + 1)
      now.setHours(9, 0, 0, 0)
    } else if (option.preset === 'tomorrow_evening') {
      now.setDate(now.getDate() + 1)
      now.setHours(18, 0, 0, 0)
    }

    setDate(now.toISOString().split('T')[0])
    setTime(now.toTimeString().slice(0, 5))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Message" size="md">
      <div className="space-y-6">
        {/* Message Preview */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Message to schedule:
          </p>
          <p className="text-gray-900 dark:text-white line-clamp-3">
            {message}
          </p>
        </div>

        {/* Quick Options */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quick Options
          </p>
          <div className="flex flex-wrap gap-2">
            {quickOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleQuickOption(option)}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time
            </label>
            <div className="relative">
              <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        {date && time && (
          <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <p className="text-sm text-primary-700 dark:text-primary-300">
              Message will be sent on{' '}
              <strong>
                {new Date(`${date}T${time}`).toLocaleString()}
              </strong>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSchedule}
            loading={loading}
            disabled={!date || !time}
            fullWidth
          >
            Schedule
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ScheduleMessage