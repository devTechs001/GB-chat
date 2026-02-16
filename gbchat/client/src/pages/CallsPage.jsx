import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PhoneIcon,
  VideoCameraIcon,
  PhoneArrowUpRightIcon,
  PhoneArrowDownLeftIcon,
  PhoneXMarkIcon,
  ClockIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import Avatar from '../components/common/Avatar'
import Button from '../components/common/Button'
import SearchBar from '../components/common/SearchBar'
import CallInterface from '../components/calls/CallInterface'
import useCallStore from '../store/useCallStore'
import clsx from 'clsx'

const CallsPage = () => {
  const { callHistory, activeCall, fetchCallHistory, initiateCall } = useCallStore()
  const [filter, setFilter] = useState('all') // all, missed, incoming, outgoing
  const [searchQuery, setSearchQuery] = useState('')
  const [showCallInterface, setShowCallInterface] = useState(false)

  useEffect(() => {
    fetchCallHistory()
  }, [])

  const filteredCalls = callHistory.filter((call) => {
    if (filter !== 'all' && call.type !== filter) return false
    if (searchQuery && !call.user.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  const getCallIcon = (call) => {
    if (call.status === 'missed') {
      return <PhoneXMarkIcon className="w-5 h-5 text-red-500" />
    }
    if (call.direction === 'incoming') {
      return <PhoneArrowDownLeftIcon className="w-5 h-5 text-green-500" />
    }
    return <PhoneArrowUpRightIcon className="w-5 h-5 text-blue-500" />
  }

  const getCallStatusText = (call) => {
    if (call.status === 'missed') return 'Missed'
    if (call.status === 'rejected') return 'Rejected'
    if (call.duration) {
      const minutes = Math.floor(call.duration / 60)
      const seconds = call.duration % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
    return 'Connecting...'
  }

  const handleCall = (user, isVideo = false) => {
    initiateCall({ userId: user._id, type: isVideo ? 'video' : 'audio' })
    setShowCallInterface(true)
  }

  const groupCallsByDate = (calls) => {
    const groups = {}
    calls.forEach((call) => {
      const date = new Date(call.createdAt).toDateString()
      if (!groups[date]) groups[date] = []
      groups[date].push(call)
    })
    return groups
  }

  const groupedCalls = groupCallsByDate(filteredCalls)

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-dark-bg pb-16">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-10">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Calls</h1>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Calls
          </h1>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              icon={<PhoneIcon className="w-5 h-5" />}
              onClick={() => {/* Open new call dialog */}}
              className="hidden md:flex"
            >
              New Call
            </Button>
          </div>
        </div>

        {/* Search */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search calls..."
        />

        {/* Filters */}
        <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
          {[
            { id: 'all', label: 'All' },
            { id: 'missed', label: 'Missed' },
            { id: 'incoming', label: 'Incoming' },
            { id: 'outgoing', label: 'Outgoing' },
          ].map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={clsx(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                filter === filterOption.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              )}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Call History */}
      <div className="flex-1 overflow-y-auto">
        {Object.keys(groupedCalls).length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <PhoneIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No call history
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your recent calls will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {Object.entries(groupedCalls).map(([date, calls]) => (
              <div key={date} className="bg-white dark:bg-gray-900">
                {/* Date Header */}
                <div className="px-4 md:px-6 py-2 bg-gray-50 dark:bg-gray-800">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {date === new Date().toDateString() ? 'Today' : date}
                  </h3>
                </div>

                {/* Calls */}
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {calls.map((call) => (
                    <motion.div
                      key={call._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3 px-4 md:px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {/* Avatar */}
                      <Avatar
                        src={call.user.avatar}
                        alt={call.user.name}
                        size="md"
                      />

                      {/* Call Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {call.user.name}
                          </p>
                          {call.callType === 'video' && (
                            <VideoCameraIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          {getCallIcon(call)}
                          <span>{getCallStatusText(call)}</span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(call.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleCall(call.user, false)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                          title="Audio Call"
                        >
                          <PhoneIcon className="w-5 h-5 text-green-500" />
                        </button>
                        <button
                          onClick={() => handleCall(call.user, true)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                          title="Video Call"
                        >
                          <VideoCameraIcon className="w-5 h-5 text-blue-500" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Call Interface */}
      {showCallInterface && activeCall && (
        <CallInterface
          callData={activeCall}
          onEnd={() => setShowCallInterface(false)}
        />
      )}

      {/* FAB for mobile */}
      <button
        onClick={() => {/* Open new call dialog */}}
        className="md:hidden fixed bottom-6 right-6 p-4 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 z-20"
      >
        <PhoneIcon className="w-6 h-6" />
      </button>
    </div>
  )
}

export default CallsPage