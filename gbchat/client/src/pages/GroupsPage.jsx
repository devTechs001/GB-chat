import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  PhoneIcon,
  VideoCameraIcon,
  EllipsisHorizontalIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CalendarIcon,
} from '@heroicons/react/24/solid'
import Button from '../components/common/Button'
import CreateGroup from '../components/groups/CreateGroup'
import GroupInfo from '../components/groups/GroupInfo'
import GroupPolls from '../components/groups/GroupPolls'
import GroupEvents from '../components/groups/GroupEvents'
import useChatStore from '../store/useChatStore'

const GroupsPage = () => {
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('groups') // groups, polls, events
  const [groupPolls, setGroupPolls] = useState([])
  const [groupEvents, setGroupEvents] = useState([])

  const { chats, fetchChats } = useChatStore()

  // Filter to get only group chats
  const groups = chats.filter(chat => chat.isGroup)

  useEffect(() => {
    fetchChats()
  }, [])

  const handleCreateGroupSuccess = (newGroup) => {
    // Refresh the chats to include the new group
    fetchChats()
    setIsCreateGroupOpen(false)
  }

  const handleGroupClick = (group) => {
    setSelectedGroup(group)
    setIsGroupInfoOpen(true)
  }

  const handleCreatePoll = (pollData) => {
    console.log('Creating poll:', pollData)
    // API call to create poll
    setGroupPolls([...groupPolls, { ...pollData, _id: Date.now().toString() }])
  }

  const handleVote = (pollId, optionId) => {
    console.log('Voting:', pollId, optionId)
    // API call to vote
  }

  const handleCreateEvent = (eventData) => {
    console.log('Creating event:', eventData)
    // API call to create event
    setGroupEvents([...groupEvents, { ...eventData, _id: Date.now().toString(), rsvps: [] }])
  }

  const handleRSVP = (eventId, status) => {
    console.log('RSVP:', eventId, status)
    // API call to RSVP
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 pb-16">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">👥 Groups</h1>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateGroupOpen(true)}
        >
          <PlusIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">👥 Groups</h1>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateGroupOpen(true)}
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          New Group
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 py-2 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
        <div className="flex gap-2">
          {[
            { id: 'groups', label: 'Groups', icon: UserGroupIcon },
            { id: 'polls', label: 'Polls', icon: ChartBarIcon },
            { id: 'events', label: 'Events', icon: CalendarIcon },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ' +
                  (activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800')
                }
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={activeTab === 'groups' ? 'Search groups...' : `Search ${activeTab}...`}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none text-gray-900 dark:text-white transition-all"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'groups' && (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {groups.length > 0 ? (
              groups.map((group) => (
                <motion.div
                  key={group._id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 hover:bg-primary-50/50 dark:hover:bg-gray-800/50 cursor-pointer transition-all duration-200 group"
                  onClick={() => handleGroupClick(group)}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 relative">
                      <img
                        src={group.avatar}
                        alt={group.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-500/20 group-hover:ring-primary-500/40 transition-all"
                      />
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                    </div>

                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {group.name}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {group.lastMessageAt ? new Date(group.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {group.members?.length || 0} members • {group.lastMessage?.content || 'No messages yet'}
                        </p>
                        {group.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-sm shadow-primary-500/30 animate-pulse">
                            {group.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-64 p-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-primary-600/10 rounded-full flex items-center justify-center mb-4">
                  <UserGroupIcon className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No groups yet</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                  Create a group to start chatting with multiple people
                </p>
                <Button
                  variant="primary"
                  onClick={() => setIsCreateGroupOpen(true)}
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Create Group
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'polls' && (
          <div className="p-4">
            <GroupPolls
              groupId="current-group"
              polls={groupPolls}
              onCreatePoll={handleCreatePoll}
              onVote={handleVote}
            />
          </div>
        )}

        {activeTab === 'events' && (
          <div className="p-4">
            <GroupEvents
              groupId="current-group"
              events={groupEvents}
              onCreateEvent={handleCreateEvent}
              onRSVP={handleRSVP}
            />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="grid grid-cols-5 gap-3">
          <button
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all duration-200 group"
            onClick={() => setIsCreateGroupOpen(true)}
          >
            <UserGroupIcon className="w-6 h-6 text-primary-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-primary-600 dark:text-primary-400">New Group</span>
          </button>
          <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 group">
            <ChatBubbleLeftIcon className="w-6 h-6 text-blue-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Broadcast</span>
          </button>
          <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200 group">
            <LockClosedIcon className="w-6 h-6 text-purple-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Private</span>
          </button>
          <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 group">
            <ShieldCheckIcon className="w-6 h-6 text-green-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-green-600 dark:text-green-400">Admin</span>
          </button>
          <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 group">
            <EllipsisHorizontalIcon className="w-6 h-6 text-gray-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">More</span>
          </button>
        </div>
      </div>

      {/* Create Group Modal */}
      <CreateGroup
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onSuccess={handleCreateGroupSuccess}
      />

      {/* Group Info Modal */}
      {selectedGroup && (
        <GroupInfo
          group={selectedGroup}
          isOpen={isGroupInfoOpen}
          onClose={() => setIsGroupInfoOpen(false)}
          onUpdate={() => fetchChats()}
        />
      )}
    </div>
  )
}

export default GroupsPage