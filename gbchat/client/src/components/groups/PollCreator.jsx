import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  XMarkIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import Input from '../common/Input'
import Button from '../common/Button'
import Modal from '../common/Modal'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const PollCreator = ({ isOpen, onClose, onSubmit, chatId }) => {
  const [pollData, setPollData] = useState({
    question: '',
    options: ['', ''],
    settings: {
      allowMultipleAnswers: false,
      anonymous: false,
      showResults: 'after_vote', // always, after_vote, after_close
      closeAt: null,
    },
  })

  const [errors, setErrors] = useState({})

  const handleAddOption = () => {
    if (pollData.options.length >= 10) {
      toast.error('Maximum 10 options allowed')
      return
    }
    setPollData((prev) => ({
      ...prev,
      options: [...prev.options, ''],
    }))
  }

  const handleRemoveOption = (index) => {
    if (pollData.options.length <= 2) {
      toast.error('Minimum 2 options required')
      return
    }
    setPollData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }))
  }

  const handleOptionChange = (index, value) => {
    setPollData((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }))
    if (errors.options) {
      setErrors((prev) => ({ ...prev, options: undefined }))
    }
  }

  const validatePoll = () => {
    const newErrors = {}

    if (!pollData.question.trim()) {
      newErrors.question = 'Question is required'
    }

    const validOptions = pollData.options.filter((opt) => opt.trim())
    if (validOptions.length < 2) {
      newErrors.options = 'At least 2 options are required'
    }

    if (pollData.options.some((opt, i) => 
      opt.trim() && pollData.options.findIndex((o, j) => o.trim() === opt.trim() && j !== i) !== -1
    )) {
      newErrors.options = 'Duplicate options are not allowed'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validatePoll()) return

    const poll = {
      ...pollData,
      options: pollData.options.filter((opt) => opt.trim()),
      chatId,
    }

    onSubmit(poll)
    onClose()
    toast.success('Poll created successfully')
  }

  const handleSetCloseTime = (hours) => {
    const closeAt = new Date()
    closeAt.setHours(closeAt.getHours() + hours)
    setPollData((prev) => ({
      ...prev,
      settings: { ...prev.settings, closeAt: closeAt.toISOString() },
    }))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Poll"
      size="lg"
    >
      <div className="space-y-6">
        {/* Question */}
        <div>
          <Input
            label="Poll Question"
            value={pollData.question}
            onChange={(e) => {
              setPollData((prev) => ({ ...prev, question: e.target.value }))
              if (errors.question) {
                setErrors((prev) => ({ ...prev, question: undefined }))
              }
            }}
            error={errors.question}
            placeholder="Ask a question..."
            maxLength={200}
          />
          <p className="text-xs text-gray-500 mt-1">
            {pollData.question.length}/200
          </p>
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Poll Options
          </label>
          <AnimatePresence>
            {pollData.options.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    maxLength={100}
                    fullWidth
                  />
                  {pollData.options.length > 2 && (
                    <button
                      onClick={() => handleRemoveOption(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {errors.options && (
            <p className="text-sm text-red-600 mt-1">{errors.options}</p>
          )}

          {pollData.options.length < 10 && (
            <button
              onClick={handleAddOption}
              className="mt-2 flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              Add Option
            </button>
          )}
        </div>

        {/* Settings */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Poll Settings
          </h4>

          <label className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Allow multiple answers
              </span>
            </div>
            <input
              type="checkbox"
              checked={pollData.settings.allowMultipleAnswers}
              onChange={(e) =>
                setPollData((prev) => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    allowMultipleAnswers: e.target.checked,
                  },
                }))
              }
              className="toggle-switch"
            />
          </label>

          <label className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Anonymous voting
              </span>
            </div>
            <input
              type="checkbox"
              checked={pollData.settings.anonymous}
              onChange={(e) =>
                setPollData((prev) => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    anonymous: e.target.checked,
                  },
                }))
              }
              className="toggle-switch"
            />
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Show results
            </label>
            <div className="flex gap-2">
              {[
                { value: 'always', label: 'Always' },
                { value: 'after_vote', label: 'After Vote' },
                { value: 'after_close', label: 'After Close' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    setPollData((prev) => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        showResults: option.value,
                      },
                    }))
                  }
                  className={clsx(
                    'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pollData.settings.showResults === option.value
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Auto-close */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <CalendarIcon className="w-4 h-4" />
              Auto-close poll
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                { hours: 1, label: '1 hour' },
                { hours: 6, label: '6 hours' },
                { hours: 24, label: '1 day' },
                { hours: 168, label: '1 week' },
              ].map((option) => (
                <button
                  key={option.hours}
                  onClick={() => handleSetCloseTime(option.hours)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-sm transition-colors',
                    pollData.settings.closeAt &&
                      new Date(pollData.settings.closeAt).getTime() <=
                        Date.now() + option.hours * 3600000
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  )}
                >
                  {option.label}
                </button>
              ))}
              {pollData.settings.closeAt && (
                <button
                  onClick={() =>
                    setPollData((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, closeAt: null },
                    }))
                  }
                  className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >
                  Never
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Create Poll
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default PollCreator