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
import PageHeader from '../components/layout/PageHeader'
import EmptyState from '../components/layout/EmptyState'
import clsx from 'clsx'

const CallsPage = () => {
  const { callHistory, activeCall, fetchCallHistory, initiateCall, isLoading, historyError } = useCallStore()
  const [filter, setFilter] = useState('all') // all, missed, incoming, outgoing
  const [searchQuery, setSearchQuery] = useState('')
  const [showCallInterface, setShowCallInterface] = useState(false)
  const [showNewCallModal, setShowNewCallModal] = useState(false)

  useEffect(() => {
    fetchCallHistory()
  }, [])

  const filteredCalls = (callHistory || []).filter((call) => {
    if (filter === 'missed' && call.status !== 'missed') return false
    if (filter === 'incoming' && call.direction !== 'incoming') return false
    if (filter === 'outgoing' && call.direction !== 'outgoing') return false
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

  const handleCall = async (user, isVideo = false) => {
    const participantId = user?._id || user?.id
    if (!participantId) return
    const result = await initiateCall({
      participantId,
      type: isVideo ? 'video' : 'audio',
      peer: { _id: participantId, name: user.name, avatar: user.avatar },
    })
    if (result.success) setShowCallInterface(true)
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
    <div className="flex flex-col h-full min-h-0 bg-gray-50 dark:bg-gray-950">
      <PageHeader
        title="Calls"
        subtitle="Voice and video call history"
        icon={PhoneIcon}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<PhoneIcon className="w-4 h-4" />}
            onClick={() => setShowNewCallModal(true)}
          >
            <span className="hidden sm:inline">New call</span>
          </Button>
        }
      >
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search calls..." />

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
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
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                filter === filterOption.id
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/30'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* Call History */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {Object.keys(groupedCalls).length === 0 ? (
          <EmptyState
            icon={PhoneIcon}
            title="No calls yet"
            description="Your recent voice and video calls will appear here."
            action={
              <Button variant="primary" onClick={() => setShowNewCallModal(true)}>
                Start a call
              </Button>
            }
          />
        ) : (
          <div className="space-y-1 p-2">
            {Object.entries(groupedCalls).map(([date, calls]) => (
              <div key={date}>
                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {date === new Date().toDateString() ? 'Today' : date}
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
        <CallInterface
          callData={activeCall}
          onEnd={() => {
            useCallStore.getState().endCall(activeCall._id)
            setShowCallInterface(false)
          }}
        />
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