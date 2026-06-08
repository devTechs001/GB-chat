import React from 'react'
import { motion } from 'framer-motion'
import {
  PhoneIcon,
  VideoCameraIcon,
  PhoneArrowUpRightIcon,
  PhoneArrowDownLeftIcon,
  PhoneXMarkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import Avatar from '../common/Avatar'
import clsx from 'clsx'

const CallHistory = ({ calls = [], onCallBack, onVideoCall, filter = 'all' }) => {
  const filteredCalls = calls.filter(call => {
    if (filter === 'all') return true
    if (filter === 'missed') return call.status === 'missed'
    if (filter === 'incoming') return call.direction === 'incoming'
    if (filter === 'outgoing') return call.direction === 'outgoing'
    return true
  })

  const getCallIcon = (call) => {
    if (call.status === 'missed') {
      return <PhoneXMarkIcon className="w-4 h-4 text-red-500" />
    }
    if (call.direction === 'incoming') {
      return <PhoneArrowDownLeftIcon className="w-4 h-4 text-green-500" />
    }
    return <PhoneArrowUpRightIcon className="w-4 h-4 text-blue-500" />
  }

  const getDuration = (seconds) => {
    if (!seconds || seconds === 0) return null
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')} min`
  }

  const groupByDate = (calls) => {
    const groups = {}
    calls.forEach(call => {
      const date = new Date(call.createdAt).toDateString()
      if (!groups[date]) groups[date] = []
      groups[date].push(call)
    })
    return groups
  }

  const grouped = groupByDate(filteredCalls)

  if (filteredCalls.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <ClockIcon className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No call history</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {Object.entries(grouped).map(([date, dateCalls]) => (
        <div key={date}>
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {date === new Date().toDateString() ? 'Today' : date}
            </p>
          </div>
          <div className="space-y-0.5">
            {dateCalls.map((call, index) => (
              <motion.div
                key={call._id || index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              >
                <div className="relative">
                  <Avatar
                    src={call.user?.avatar}
                    alt={call.user?.name || 'Unknown'}
                    size="md"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm">
                    {getCallIcon(call)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {call.user?.name || 'Unknown'}
                    </p>
                    {call.type === 'video' && (
                      <VideoCameraIcon className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <span className={call.status === 'missed' ? 'text-red-400 font-medium' : ''}>
                      {call.status === 'missed' ? 'Missed' : call.status === 'rejected' ? 'Rejected' : getDuration(call.duration) || 'Connecting...'}
                    </span>
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(call.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onCallBack && (
                    <button
                      onClick={() => onCallBack(call)}
                      className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Call back"
                    >
                      <PhoneIcon className="w-4 h-4 text-green-500" />
                    </button>
                  )}
                  {onVideoCall && (
                    <button
                      onClick={() => onVideoCall(call)}
                      className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Video call"
                    >
                      <VideoCameraIcon className="w-4 h-4 text-blue-500" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default CallHistory
