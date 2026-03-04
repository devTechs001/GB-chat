/**
 * GroupPolls Component
 * Features:
 * - Create polls with multiple options
 * - Real-time voting
 * - Anonymous voting option
 * - Poll expiration
 * - Results visualization
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartBarIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  XMarkIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import Button from '../common/Button'
import Input from '../common/Input'
import Modal from '../common/Modal'
import clsx from 'clsx'

const GroupPolls = ({ groupId, polls = [], onCreatePoll, onVote, onClose }) => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPoll, setSelectedPoll] = useState(null)

  const activePolls = polls.filter(p => !p.ended)
  const pastPolls = polls.filter(p => p.ended)

  return (
    <>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-primary-500" />
            Polls
          </h3>
          <Button
            variant="primary"
            size="sm"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            Create Poll
          </Button>
        </div>

        {/* Active Polls */}
        {activePolls.length > 0 ? (
          <div className="space-y-3">
            {activePolls.map((poll) => (
              <PollCard
                key={poll._id}
                poll={poll}
                onVote={(optionId) => onVote?.(poll._id, optionId)}
                onViewResults={() => setSelectedPoll(poll)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ChartBarIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 dark:text-gray-400">No active polls</p>
            <Button
              variant="primary"
              size="sm"
              className="mt-3"
              onClick={() => setShowCreateModal(true)}
            >
              Create your first poll
            </Button>
          </div>
        )}

        {/* Past Polls Link */}
        {pastPolls.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSelectedPoll(pastPolls[0])}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              View {pastPolls.length} past {pastPolls.length === 1 ? 'poll' : 'polls'}
            </button>
          </div>
        )}
      </div>

      {/* Create Poll Modal */}
      {showCreateModal && (
        <CreatePollModal
          groupId={groupId}
          onClose={() => setShowCreateModal(false)}
          onSubmit={(pollData) => {
            onCreatePoll?.(pollData)
            setShowCreateModal(false)
          }}
        />
      )}

      {/* Poll Results Modal */}
      {selectedPoll && (
        <PollResultsModal
          poll={selectedPoll}
          onClose={() => setSelectedPoll(null)}
        />
      )}
    </>
  )
}

const PollCard = ({ poll, onVote, onViewResults }) => {
  const [selectedOption, setSelectedOption] = useState(null)
  const hasVoted = poll.voted || poll.options.some(o => o.voted)
  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0)

  const handleVote = () => {
    if (selectedOption) {
      onVote(selectedOption)
    }
  }

  const timeLeft = poll.expiresAt ? new Date(poll.expiresAt) - new Date() : null
  const hoursLeft = timeLeft ? Math.ceil(timeLeft / (1000 * 60 * 60)) : null

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            {poll.question}
          </h4>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <UserGroupIcon className="w-3 h-3" />
              {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
            </span>
            {hoursLeft !== null && (
              <span className="flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                {hoursLeft}h left
              </span>
            )}
            {poll.allowMultipleVotes && (
              <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-xs">
                Multiple choices
              </span>
            )}
            {poll.anonymous && (
              <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full text-xs">
                Anonymous
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onViewResults}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          <ChartBarIcon className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {poll.options.map((option) => (
          <button
            key={option._id}
            onClick={() => !hasVoted && setSelectedOption(option._id)}
            disabled={hasVoted}
            className={clsx(
              'w-full p-3 rounded-lg text-left transition-all relative overflow-hidden',
              hasVoted
                ? 'bg-gray-200 dark:bg-gray-600'
                : selectedOption === option._id
                ? 'bg-primary-500 text-white ring-2 ring-primary-600'
                : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
            )}
          >
            {/* Progress Bar for Results */}
            {hasVoted && totalVotes > 0 && (
              <div
                className="absolute inset-y-0 left-0 bg-primary-500/10 dark:bg-primary-500/20 transition-all duration-500"
                style={{ width: `${(option.votes / totalVotes) * 100}%` }}
              />
            )}
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                {option.voted && (
                  <CheckCircleSolidIcon className="w-5 h-5 text-primary-500" />
                )}
                <span className={clsx(
                  'font-medium',
                  hasVoted ? 'text-gray-900 dark:text-white' : ''
                )}>
                  {option.text}
                </span>
              </div>
              {hasVoted && (
                <span className="font-bold text-gray-900 dark:text-white">
                  {Math.round((option.votes / totalVotes) * 100)}%
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Vote Button */}
      {!hasVoted && selectedOption && (
        <Button
          variant="primary"
          size="sm"
          onClick={handleVote}
          className="w-full mt-3"
          icon={<CheckCircleIcon className="w-4 h-4" />}
        >
          Submit Vote
        </Button>
      )}
    </div>
  )
}

const CreatePollModal = ({ groupId, onClose, onSubmit }) => {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false)
  const [anonymous, setAnonymous] = useState(false)
  const [duration, setDuration] = useState(24)

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, ''])
    }
  }

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = () => {
    if (!question.trim() || options.some(o => !o.trim())) return

    onSubmit({
      groupId,
      question,
      options: options.filter(o => o.trim()).map(text => ({ text, votes: 0 })),
      allowMultipleVotes,
      anonymous,
      durationHours: duration,
    })
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Create Poll"
      size="md"
    >
      <div className="space-y-4">
        {/* Question */}
        <Input
          label="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What would you like to ask?"
          maxLength={200}
        />

        {/* Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Options
          </label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 input-field"
                  maxLength={100}
                />
                {options.length > 2 && (
                  <button
                    onClick={() => handleRemoveOption(index)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 10 && (
            <Button
              variant="secondary"
              size="sm"
              icon={<PlusIcon className="w-4 h-4" />}
              onClick={handleAddOption}
              className="mt-2"
            >
              Add Option
            </Button>
          )}
        </div>

        {/* Settings */}
        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Poll Settings
          </h4>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Allow multiple votes
            </span>
            <input
              type="checkbox"
              checked={allowMultipleVotes}
              onChange={(e) => setAllowMultipleVotes(e.target.checked)}
              className="toggle-switch"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Anonymous voting
            </span>
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="toggle-switch"
            />
          </label>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Duration (hours)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="input-field w-full"
            >
              <option value={1}>1 hour</option>
              <option value={6}>6 hours</option>
              <option value={12}>12 hours</option>
              <option value={24}>24 hours</option>
              <option value={48}>48 hours</option>
              <option value={168}>1 week</option>
            </select>
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
            disabled={!question.trim() || options.some(o => !o.trim())}
            fullWidth
          >
            Create Poll
          </Button>
        </div>
      </div>
    </Modal>
  )
}

const PollResultsModal = ({ poll, onClose }) => {
  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0)

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Poll Results"
      size="md"
    >
      <div className="space-y-4">
        <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {poll.question}
          </p>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
          </p>
        </div>

        <div className="space-y-3">
          {poll.options.map((option, index) => {
            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {option.text}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {option.votes} votes ({Math.round(percentage)}%)
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                  />
                </div>
              </div>
            )
          })}
        </div>

        {poll.voters && poll.voters.length > 0 && !poll.anonymous && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Voters ({poll.voters.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {poll.voters.map((voter, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
                >
                  {voter.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <Button variant="secondary" onClick={onClose} fullWidth>
          Close
        </Button>
      </div>
    </Modal>
  )
}

export default GroupPolls
