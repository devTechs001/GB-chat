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
import NewCallModal from '../components/calls/NewCallModal'
import useCallStore from '../store/useCallStore'
import clsx from 'clsx'

const CallsPage = () => {
  const { callHistory, activeCall, fetchCallHistory, initiateCall } = useCallStore()
  const [filter, setFilter] = useState('all') // all, missed, incoming, outgoing
  const [searchQuery, setSearchQuery] = useState('')
  const [showCallInterface, setShowCallInterface] = useState(false)
  const [showNewCallModal, setShowNewCallModal] = useState(false)

  useEffect(() => {
    fetchCallHistory()
  }, [])

  const filteredCalls = (callHistory || []).filter((call) => {
    if (filter !== 'all' && call.type !== filter) return false
    if (searchQuery && !call.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
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
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950 pb-16">
      {/* Mobile Header */}
      <div className="md:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 sticky top-0 z-10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">📞 Calls</h1>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            📞 Calls
          </h1>
          <Button
            variant="ghost"
            icon={<PhoneIcon className="w-5 h-5" />}
            onClick={() => setShowNewCallModal(true)}
            className="hidden md:flex bg-primary-500/10 hover:bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded-xl"
          >
            New Call
          </Button>
        </div>

        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search calls..." />

        <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
          {[
            { id: 'all', label: '🔄 All' },
            { id: 'missed', label: '❌ Missed' },
            { id: 'incoming', label: '📥 Incoming' },
            { id: 'outgoing', label: '📤 Outgoing' },
          ].map((filterOption) => (
            <button key={filterOption.id} onClick={() => setFilter(filterOption.id)}
              className={clsx(
                'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300',
                filter === filterOption.id
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200/50 dark:border-gray-700/50'
              )}>
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Call History */}
      <div className="flex-1 overflow-y-auto">
        {Object.keys(groupedCalls).length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary-500/20 to-primary-600/10 rounded-full flex items-center justify-center">
              <PhoneIcon className="w-12 h-12 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No call history</h3>
            <p className="text-gray-500 dark:text-gray-400">Your recent calls will appear here</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {Object.entries(groupedCalls).map(([date, calls]) => (
              <div key={date}>
                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {date === new Date().toDateString() ? '📅 Today' : date}
                  </h3>
                </div>
                <div className="space-y-1">
                  {calls.map((call) => (
                    <motion.div key={call._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 border border-gray-100/50 dark:border-gray-700/30 group">
                      <div className="relative">
                        <Avatar src={call.user.avatar} alt={call.user.name} size="md" className="ring-2 ring-gray-200/50 dark:ring-gray-700/50" />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm">
                          {getCallIcon(call)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 dark:text-white truncate text-sm">{call.user.name}</p>
                          {call.callType === 'video' && <VideoCameraIcon className="w-4 h-4 text-blue-400" />}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <span className={call.status === 'missed' ? 'text-red-400 font-medium' : ''}>{getCallStatusText(call)}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(call.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleCall(call.user, false)}
                          className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-colors" title="Audio Call">
                          <PhoneIcon className="w-5 h-5 text-green-500" />
                        </button>
                        <button onClick={() => handleCall(call.user, true)}
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors" title="Video Call">
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

      {showCallInterface && activeCall && (
        <CallInterface callData={activeCall} onEnd={() => setShowCallInterface(false)} />
      )}

      <NewCallModal isOpen={showNewCallModal} onClose={() => setShowNewCallModal(false)} />

      <button onClick={() => setShowNewCallModal(true)}
        className="md:hidden fixed bottom-20 right-4 p-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 transition-all z-20">
        <PhoneIcon className="w-6 h-6" />
      </button>
    </div>
  )
}

export default CallsPage