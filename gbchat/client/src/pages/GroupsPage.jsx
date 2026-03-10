import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  PhoneIcon,
  VideoCameraIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CalendarIcon,
  UsersIcon,
  BellIcon,
  EllipsisHorizontalIcon,
  FunnelIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  SpeakerWaveIcon,
} from '@heroicons/react/24/outline'
import {
  PlusIcon as PlusIconSolid,
  StarIcon as StarIconSolid,
  CheckCircleIcon as CheckCircleSolidIcon,
} from '@heroicons/react/24/solid'
import Button from '../components/common/Button'
import CreateGroup from '../components/groups/CreateGroup'
import GroupInfo from '../components/groups/GroupInfo'
import GroupPolls from '../components/groups/GroupPolls'
import GroupEvents from '../components/groups/GroupEvents'
import useChatStore from '../store/useChatStore'
import useGBFeaturesStore from '../store/useGBFeaturesStore'
import Avatar from '../components/common/Avatar'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import api from '../lib/api'
import toast from 'react-hot-toast'

const GroupsPage = () => {
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('groups')
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [groupPolls, setGroupPolls] = useState([])
  const [groupEvents, setGroupEvents] = useState([])
  const [groupAnnouncements, setGroupAnnouncements] = useState([])
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const { groups, fetchChats, chats } = useChatStore()
  const gbFeaturesStore = useGBFeaturesStore()

  // Get groups from chats or use sample data
  const groupsList = groups.length > 0 ? groups : chats.filter(chat => chat.isGroup)

  useEffect(() => {
    fetchChats()
    gbFeaturesStore.fetchGBFeatures()
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    // Load group announcements from API or local storage
    try {
      const saved = localStorage.getItem('group-announcements')
      if (saved) {
        setGroupAnnouncements(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Failed to load announcements:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchChats()
    await gbFeaturesStore.fetchGBFeatures()
    setTimeout(() => setRefreshing(false), 1000)
  }

  const handleCreateGroupSuccess = async (newGroup) => {
    console.log('Group created successfully:', newGroup)
    await fetchChats()
    setIsCreateGroupOpen(false)
    toast.success('Group created successfully! 🎉')
  }

  const handleGroupClick = (group) => {
    setSelectedGroup(group)
    setIsGroupInfoOpen(true)
  }

  const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date

    // If today, show time
    if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    // If yesterday
    if (diff < 48 * 60 * 60 * 1000) {
      return 'Yesterday'
    }
    // If this week, show day name
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' })
    }
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const getMemberAvatars = (members) => {
    return (members || []).slice(0, 4).map(m => m.avatar || m.name.charAt(0))
  }

  // Poll handlers
  const handleCreatePoll = (pollData) => {
    const newPoll = {
      ...pollData,
      _id: Date.now().toString(),
      options: pollData.options.map(opt => ({ ...opt, votes: 0, voted: false })),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + pollData.durationHours * 60 * 60 * 1000).toISOString(),
      voted: false,
      voters: [],
    }
    setGroupPolls([newPoll, ...groupPolls])
    toast.success('Poll created successfully! 📊')
  }

  const handleVote = (pollId, optionId) => {
    setGroupPolls(polls => polls.map(poll => {
      if (poll._id === pollId) {
        return {
          ...poll,
          voted: true,
          options: poll.options.map(opt =>
            opt._id === optionId ? { ...opt, votes: opt.votes + 1, voted: true } : opt
          ),
        }
      }
      return poll
    }))
    toast.success('Vote submitted! ✓')
  }

  // Event handlers
  const handleCreateEvent = (eventData) => {
    const newEvent = {
      ...eventData,
      _id: Date.now().toString(),
      rsvps: [],
      rsvp: null,
      isCreator: true,
      createdAt: new Date().toISOString(),
    }
    setGroupEvents([newEvent, ...groupEvents])
    toast.success('Event created successfully! 📅')
  }

  const handleRSVP = (eventId, status) => {
    setGroupEvents(events => events.map(event => {
      if (event._id === eventId) {
        return { ...event, rsvp: status }
      }
      return event
    }))
    const statusMessages = {
      going: 'See you there! 🎉',
      maybe: 'Maybe response recorded 🤔',
      'not-going': 'Sorry you can\'t make it 😢',
    }
    toast.success(statusMessages[status])
  }

  // Announcement handlers
  const handleCreateAnnouncement = (announcementData) => {
    const newAnnouncement = {
      ...announcementData,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
    }
    setGroupAnnouncements([newAnnouncement, ...groupAnnouncements])
    localStorage.setItem('group-announcements', JSON.stringify([newAnnouncement, ...groupAnnouncements]))
    toast.success('Announcement posted! 📢')
  }

  // Filter groups
  const filteredGroups = groupsList.filter(group => {
    if (searchQuery && !group.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (filter === 'admin' && !group.isAdmin) {
      return false
    }
    if (filter === 'unread' && !group.unreadCount) {
      return false
    }
    if (filter === 'muted' && !group.isMuted) {
      return false
    }
    if (filter === 'starred' && !group.isStarred) {
      return false
    }
    return true
  })

  // Get filter counts
  const filterCounts = {
    all: groupsList.length,
    admin: groupsList.filter(g => g.isAdmin).length,
    unread: groupsList.filter(g => g.unreadCount).length,
    muted: groupsList.filter(g => g.isMuted).length,
    starred: groupsList.filter(g => g.isStarred).length,
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 pb-16">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">👥 Groups</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={clsx('p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all', refreshing && 'animate-spin')}
          >
            <ArrowPathIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateGroupOpen(true)}
          >
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">👥 Groups</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{groupsList.length} groups</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className={clsx('p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all', refreshing && 'animate-spin')}
            title="Refresh"
          >
            <ArrowPathIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateGroupOpen(true)}
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            New Group
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 py-2 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'groups', label: 'Groups', icon: UserGroupIcon, count: filterCounts.all },
            { id: 'announcements', label: 'Announcements', icon: SpeakerWaveIcon, count: groupAnnouncements.length },
            { id: 'polls', label: 'Polls', icon: ChartBarIcon, count: groupPolls.filter(p => !p.ended).length },
            { id: 'events', label: 'Events', icon: CalendarIcon, count: groupEvents.filter(e => new Date(e.date) >= new Date()).length },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={clsx(
                    'px-1.5 py-0.5 rounded-full text-xs',
                    activeTab === tab.id ? 'bg-white/20' : 'bg-primary-500 text-white'
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Search & Filters */}
      {activeTab === 'groups' && (
        <>
          <div className="p-4 space-y-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search groups..."
                className="w-full pl-10 pr-10 py-2.5 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none text-gray-900 dark:text-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                >
                  <XMarkIcon className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2 overflow-x-auto">
                {[
                  { id: 'all', label: 'All', count: filterCounts.all },
                  { id: 'admin', label: 'Admin', count: filterCounts.admin },
                  { id: 'unread', label: 'Unread', count: filterCounts.unread },
                  { id: 'muted', label: 'Muted', count: filterCounts.muted },
                  { id: 'starred', label: 'Starred', count: filterCounts.starred },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={clsx(
                      'px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap',
                      filter === f.id
                        ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    )}
                  >
                    {f.label} {f.count > 0 && `(${f.count})`}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FunnelIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 pb-4 overflow-hidden"
              >
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl space-y-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Sort by</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['Name', 'Recent', 'Unread', 'Members'].map((option) => (
                      <button
                        key={option}
                        className="px-3 py-2 bg-white dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-left"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'groups' && (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <motion.div
                  key={group._id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
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
                      <div className={clsx(
                        'absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white dark:border-gray-900 rounded-full',
                        group.online ? 'bg-green-500' : 'bg-gray-400'
                      )}></div>
                    </div>

                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {group.name}
                          </h3>
                          {group.isAdmin && (
                            <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                          )}
                          {group.isMuted && (
                            <BellIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(group.lastMessageAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {typeof group.lastMessage?.content === 'string'
                            ? group.lastMessage?.content
                            : group.lastMessage?.content?.text || group.description || 'No messages yet'}
                        </p>
                        {group.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-sm shadow-primary-500/30 animate-pulse">
                            {group.unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex -space-x-2">
                          {getMemberAvatars(group.members).slice(0, 3).map((avatar, i) => (
                            <div
                              key={i}
                              className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center text-xs text-white ring-2 ring-white dark:ring-gray-900"
                            >
                              {typeof avatar === 'string' && avatar.startsWith('http') ? (
                                <img src={avatar} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                avatar
                              )}
                            </div>
                          ))}
                          {group.members?.length > 3 && (
                            <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300 ring-2 ring-white dark:ring-gray-900">
                              +{group.members.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">{group.members?.length || 0} members</span>
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
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  {searchQuery ? 'No groups found' : 'No groups yet'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                  {searchQuery ? 'Try a different search term' : 'Create a group to start chatting with multiple people'}
                </p>
                {!searchQuery && (
                  <Button
                    variant="primary"
                    onClick={() => setIsCreateGroupOpen(true)}
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Create Group
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="p-4 space-y-4">
            <Button
              variant="primary"
              icon={<PlusIcon className="w-4 h-4" />}
              onClick={() => {/* Open announcement creator */}}
              className="w-full"
            >
              Create Announcement
            </Button>
            {groupAnnouncements.length > 0 ? (
              groupAnnouncements.map((announcement) => (
                <motion.div
                  key={announcement._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{announcement.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{announcement.content}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}</span>
                    <div className="flex items-center gap-3">
                      <span>👍 {announcement.likes}</span>
                      <span>💬 {announcement.comments}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <SpeakerWaveIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No announcements yet</p>
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
            <ChartBarIcon className="w-6 h-6 text-purple-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Poll</span>
          </button>
          <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 group">
            <CalendarIcon className="w-6 h-6 text-green-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-green-600 dark:text-green-400">Event</span>
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
