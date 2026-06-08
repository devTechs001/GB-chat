import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
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
  TagIcon,
  DocumentTextIcon,
  PhotoIcon,
  LinkIcon,
  MapPinIcon,
  CogIcon,
  GiftIcon,
  TrophyIcon,
  FireIcon,
  SparklesIcon,
  QueueListIcon,
  BookmarkIcon,
  ShareIcon,
  EyeIcon,
  ArchiveBoxIcon,
  TrashIcon,
  UserMinusIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline'
import {
  PlusIcon as PlusIconSolid,
  StarIcon as StarIconSolid,
  CheckCircleIcon as CheckCircleSolidIcon,
  FireIcon as FireIconSolid,
} from '@heroicons/react/24/solid'
import Button from '../components/common/Button'
import CreateGroup from '../components/groups/CreateGroup'
import GroupInfo from '../components/groups/GroupInfo'
import GroupPolls from '../components/groups/GroupPolls'
import GroupEvents from '../components/groups/GroupEvents'
import GroupInsights from '../components/groups/GroupInsights'
import GroupBulkActions from '../components/groups/GroupBulkActions'
import PollCreator from '../components/groups/PollCreator'
import AnnouncementCreator from '../components/groups/AnnouncementCreator'
import EventCreator from '../components/groups/EventCreator'
import useChatStore from '../store/useChatStore'
import useGBFeaturesStore from '../store/useGBFeaturesStore'
import useAuthStore from '../store/useAuthStore'
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
  const [selectedGroups, setSelectedGroups] = useState(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [sortBy, setSortBy] = useState('recent')
  const [viewMode, setViewMode] = useState('list') // list, grid, compact
  const [showArchived, setShowArchived] = useState(false)
  const [groupStats, setGroupStats] = useState({
    totalGroups: 0,
    activeGroups: 0,
    totalMembers: 0,
    totalMessages: 0,
    popularGroups: [],
  })
  const [showGroupInsights, setShowGroupInsights] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showPollCreator, setShowPollCreator] = useState(false)
  const [showAnnouncementCreator, setShowAnnouncementCreator] = useState(false)
  const [showEventCreator, setShowEventCreator] = useState(false)
  const [showMoreOptions, setShowMoreOptions] = useState(false)

  const { groups, fetchChats, chats, setActiveChat, currentChat } = useChatStore()
  const { user } = useAuthStore()
  const gbFeaturesStore = useGBFeaturesStore()
  const navigate = useNavigate()

  // Get groups from chats or use sample data
  const groupsList = groups.length > 0 ? groups : chats.filter(chat => chat.isGroup)

  useEffect(() => {
    fetchChats()
    gbFeaturesStore.fetchGBFeatures()
    loadAnnouncements()
    calculateGroupStats()
  }, [])

  useEffect(() => {
    calculateGroupStats()
  }, [groupsList])

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

  const calculateGroupStats = () => {
    const stats = {
      totalGroups: groupsList.length,
      activeGroups: groupsList.filter(g => {
        const lastMessage = new Date(g.lastMessageAt || g.createdAt)
        const daysSinceLastMessage = (new Date() - lastMessage) / (1000 * 60 * 60 * 24)
        return daysSinceLastMessage <= 7
      }).length,
      totalMembers: groupsList.reduce((sum, g) => sum + (g.members?.length || 0), 0),
      totalMessages: groupsList.reduce((sum, g) => sum + (g.messageCount || 0), 0),
      popularGroups: groupsList
        .sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0))
        .slice(0, 5),
    }
    setGroupStats(stats)
  }

  const handleGroupSelection = (groupId) => {
    const newSelection = new Set(selectedGroups)
    if (newSelection.has(groupId)) {
      newSelection.delete(groupId)
    } else {
      newSelection.add(groupId)
    }
    setSelectedGroups(newSelection)
    setShowBulkActions(newSelection.size > 0)
  }

  const handleBulkAction = async (action) => {
    if (selectedGroups.size === 0) return
    
    setLoading(true)
    try {
      const groupIds = Array.from(selectedGroups)
      
      switch (action) {
        case 'archive':
          await Promise.all(groupIds.map(id => api.patch(`/groups/${id}/archive`)))
          toast.success(`Archived ${groupIds.length} groups`)
          break
        case 'mute':
          await Promise.all(groupIds.map(id => api.patch(`/groups/${id}/mute`)))
          toast.success(`Muted ${groupIds.length} groups`)
          break
        case 'star':
          await Promise.all(groupIds.map(id => api.patch(`/groups/${id}/star`)))
          toast.success(`Starred ${groupIds.length} groups`)
          break
        case 'delete':
          if (confirm(`Are you sure you want to delete ${groupIds.length} groups?`)) {
            await Promise.all(groupIds.map(id => api.delete(`/groups/${id}`)))
            toast.success(`Deleted ${groupIds.length} groups`)
          }
          break
        default:
          toast.error('Unknown action')
      }
      
      setSelectedGroups(new Set())
      setShowBulkActions(false)
      await fetchChats()
    } catch (error) {
      toast.error('Failed to perform bulk action')
    } finally {
      setLoading(false)
    }
  }

  const handleExportGroups = async (format) => {
    setLoading(true)
    try {
      const response = await api.post('/groups/export', { format, groups: Array.from(selectedGroups) })
      const blob = new Blob([response.data], { type: format === 'csv' ? 'text/csv' : 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `groups_export.${format}`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Groups exported successfully')
    } catch (error) {
      toast.error('Failed to export groups')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteToGroups = async (inviteData) => {
    setLoading(true)
    try {
      await api.post('/groups/bulk-invite', {
        groups: Array.from(selectedGroups),
        ...inviteData
      })
      toast.success('Invitations sent successfully')
      setShowInviteModal(false)
    } catch (error) {
      toast.error('Failed to send invitations')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchChats()
    await gbFeaturesStore.fetchGBFeatures()
    calculateGroupStats()
    setTimeout(() => setRefreshing(false), 1000)
  }

  const handleCreateGroupSuccess = async (newGroup) => {
    console.log('Group created successfully:', newGroup)
    await fetchChats()
    setIsCreateGroupOpen(false)
    toast.success('Group created successfully! 🎉')
  }

  const handleGroupClick = (group) => {
    // Set the group as active chat to open chat area
    setActiveChat(group)
    // Navigate to chats page (path is /chats or / in App.jsx)
    navigate('/chats')
  }

  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement)
    // Could open a modal or navigate to announcement details
    toast.info('Opening announcement details...')
  }

  const handleQuickAction = (action) => {
    switch (action) {
      case 'broadcast':
        setShowAnnouncementCreator(true)
        break
      case 'poll':
        setShowPollCreator(true)
        break
      case 'event':
        setShowEventCreator(true)
        break
      case 'more':
        setShowMoreOptions(true)
        break
      default:
        toast.info('Action coming soon...')
    }
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
  const handleCreatePoll = async (pollData) => {
    try {
      // Get the first selected group or a default group
      const groupId = selectedGroups.length > 0 ? selectedGroups[0]._id : groupsList[0]?._id
      
      if (!groupId) {
        toast.error('Please select a group first')
        return
      }

      const response = await api.post(`/groups/${groupId}/polls`, {
        question: pollData.question,
        options: pollData.options,
        allowMultipleVotes: pollData.settings.allowMultipleAnswers,
        anonymous: pollData.settings.anonymous,
        durationHours: pollData.durationHours || 24
      })

      toast.success('Poll created successfully! 📊')
      setShowPollCreator(false)
      
      // Refresh groups data to show new poll
      fetchChats()
      
      return response.data
    } catch (error) {
      console.error('Error creating poll:', error)
      toast.error(error.response?.data?.message || 'Failed to create poll')
    }
  }

  // Announcement handlers
  const handleCreateAnnouncement = async (announcementData) => {
    try {
      // Get the first selected group or a default group
      const groupId = selectedGroups.length > 0 ? selectedGroups[0]._id : groupsList[0]?._id
      
      if (!groupId) {
        toast.error('Please select a group first')
        return
      }

      const response = await api.post(`/groups/${groupId}/announcements`, {
        title: announcementData.title,
        content: announcementData.content,
        isPinned: announcementData.pinned || false,
        attachments: announcementData.attachments || [],
        targetAudience: announcementData.targetAudience || 'all'
      })

      toast.success('Announcement created successfully! 📢')
      setShowAnnouncementCreator(false)
      
      // Refresh groups data to show new announcement
      fetchChats()
      
      return response.data
    } catch (error) {
      console.error('Error creating announcement:', error)
      toast.error(error.response?.data?.message || 'Failed to create announcement')
    }
  }

  // Event handlers
  const handleCreateEvent = async (eventData) => {
    try {
      // Get the first selected group or a default group
      const groupId = selectedGroups.length > 0 ? selectedGroups[0]._id : groupsList[0]?._id
      
      if (!groupId) {
        toast.error('Please select a group first')
        return
      }

      const response = await api.post(`/groups/${groupId}/events`, {
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        location: eventData.location,
        isOnline: eventData.isOnline || false,
        onlineLink: eventData.onlineLink || '',
        sendReminder: eventData.sendReminder || true
      })

      toast.success('Event created successfully! 📅')
      setShowEventCreator(false)
      
      // Refresh groups data to show new event
      fetchChats()
      
      return response.data
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error(error.response?.data?.message || 'Failed to create event')
    }
  }

  const handleVote = async (pollId, optionId) => {
    try {
      // Get the first selected group or a default group
      const groupId = selectedGroups.length > 0 ? selectedGroups[0]._id : groupsList[0]?._id
      
      if (!groupId) {
        toast.error('Please select a group first')
        return
      }

      const response = await api.post(`/groups/${groupId}/polls/${pollId}/vote`, {
        optionId: optionId
      })

      toast.success('Vote submitted! ✓')
      
      // Refresh polls data
      fetchChats()
      
      return response.data
    } catch (error) {
      console.error('Error voting on poll:', error)
      toast.error(error.response?.data?.message || 'Failed to submit vote')
    }
  }

  const handleRSVP = async (eventId, status) => {
    try {
      // Get the first selected group or a default group
      const groupId = selectedGroups.length > 0 ? selectedGroups[0]._id : groupsList[0]?._id
      
      if (!groupId) {
        toast.error('Please select a group first')
        return
      }

      const response = await api.post(`/groups/${groupId}/events/${eventId}/rsvp`, {
        status: status // 'going', 'maybe', 'not-going'
      })

      const statusMessages = {
        going: 'See you there! 🎉',
        maybe: 'Maybe response recorded 🤔',
        'not-going': 'Sorry you can\'t make it 😢',
      }
      toast.success(statusMessages[status] || 'RSVP submitted!')
      
      // Refresh events data
      fetchChats()
      
      return response.data
    } catch (error) {
      console.error('Error RSVPing to event:', error)
      toast.error(error.response?.data?.message || 'Failed to submit RSVP')
    }
  }

  // More Options handlers
  const handleImportGroups = () => {
    toast.info('Import groups feature coming soon! 📥')
    setShowMoreOptions(false)
  }

  const handleExportGroupsFromMore = () => {
    setShowExportModal(true)
    setShowMoreOptions(false)
  }

  const handleGroupSettings = () => {
    toast.info('Global group settings coming soon! ⚙️')
    setShowMoreOptions(false)
  }

  const handleHelpSupport = () => {
    toast.info('Opening help & support... 📚')
    setShowMoreOptions(false)
    // In a real app, this would navigate to help page or open support chat
  }

  // Filter and sort groups
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
    if (filter === 'archived' && !group.isArchived) {
      return false
    }
    if (showArchived && !group.isArchived) {
      return false
    }
    if (!showArchived && group.isArchived) {
      return false
    }
    return true
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'recent':
        return new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt)
      case 'unread':
        return (b.unreadCount || 0) - (a.unreadCount || 0)
      case 'members':
        return (b.members?.length || 0) - (a.members?.length || 0)
      case 'activity':
        const aActivity = a.messageCount || 0
        const bActivity = b.messageCount || 0
        return bActivity - aActivity
      default:
        return 0
    }
  })

  // Get filter counts
  const filterCounts = {
    all: groupsList.length,
    admin: groupsList.filter(g => g.isAdmin).length,
    unread: groupsList.filter(g => g.unreadCount).length,
    muted: groupsList.filter(g => g.isMuted).length,
    starred: groupsList.filter(g => g.isStarred).length,
    archived: groupsList.filter(g => g.isArchived).length,
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 pb-16 overflow-hidden scrollbar-hide">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl flex-shrink-0">
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
      <div className="hidden md:flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">👥 Groups</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{groupsList.length} groups</p>
          </div>
          <button
            onClick={() => setShowGroupInsights(!showGroupInsights)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ChartBarIcon className="w-4 h-4" />
            <span className="text-sm">Insights</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { id: 'list', icon: QueueListIcon, label: 'List' },
              { id: 'grid', icon: UsersIcon, label: 'Grid' },
              { id: 'compact', icon: FunnelIcon, label: 'Compact' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={clsx(
                  'p-1.5 rounded transition-colors',
                  viewMode === mode.id ? 'bg-white dark:bg-gray-700 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
                title={mode.label}
              >
                <mode.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={clsx(
              'p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors',
              showArchived && 'text-primary-600'
            )}
            title={showArchived ? 'Hide Archived' : 'Show Archived'}
          >
            <ArchiveBoxIcon className="w-5 h-5" />
          </button>
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

      {/* Group Insights */}
      <AnimatePresence>
        {showGroupInsights && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="hidden md:block border-b border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl overflow-hidden"
          >
            <div className="p-4">
              <div className="grid grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{groupStats.totalGroups}</div>
                  <div className="text-xs text-gray-500">Total Groups</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{groupStats.activeGroups}</div>
                  <div className="text-xs text-gray-500">Active Groups</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{groupStats.totalMembers}</div>
                  <div className="text-xs text-gray-500">Total Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{groupStats.totalMessages}</div>
                  <div className="text-xs text-gray-500">Total Messages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {groupStats.popularGroups[0]?.members?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500">Largest Group</div>
                </div>
              </div>
              {groupStats.popularGroups.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Popular Groups</h4>
                  <div className="flex gap-2">
                    {groupStats.popularGroups.map((group) => (
                      <div
                        key={group._id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full"
                      >
                        <FireIconSolid className="w-3 h-3 text-orange-500" />
                        <span className="text-xs font-medium">{group.name}</span>
                        <span className="text-xs text-gray-500">({group.members?.length})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {showBulkActions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/20 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-primary-900 dark:text-primary-100">
                    {selectedGroups.size} groups selected
                  </span>
                  <button
                    onClick={() => {
                      setSelectedGroups(new Set())
                      setShowBulkActions(false)
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Clear selection
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleBulkAction('star')}
                    loading={loading}
                  >
                    <StarIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleBulkAction('mute')}
                    loading={loading}
                  >
                    <BellIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleBulkAction('archive')}
                    loading={loading}
                  >
                    <ArchiveBoxIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowInviteModal(true)}
                    loading={loading}
                  >
                    <UserPlusIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowExportModal(true)}
                    loading={loading}
                  >
                    <ShareIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    loading={loading}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <div className="px-4 py-2 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl flex-shrink-0">
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
          <div className="p-4 space-y-3 flex-shrink-0">
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
                  { id: 'archived', label: 'Archived', count: filterCounts.archived },
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
                    {[
                      { id: 'name', label: 'Name' },
                      { id: 'recent', label: 'Recent' },
                      { id: 'unread', label: 'Unread' },
                      { id: 'members', label: 'Members' },
                      { id: 'activity', label: 'Activity' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSortBy(option.id)}
                        className={clsx(
                          'px-3 py-2 bg-white dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-left',
                          sortBy === option.id && 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        )}
                      >
                        {option.label}
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
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {activeTab === 'groups' && (
          <div className={clsx(
            viewMode === 'grid' ? 'p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 
            viewMode === 'compact' ? 'divide-y divide-gray-200 dark:divide-gray-700' :
            'divide-y divide-gray-200 dark:divide-gray-700'
          )}>
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <motion.div
                  key={group._id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: viewMode === 'grid' ? 1.02 : 1.01 }}
                  className={clsx(
                    viewMode === 'grid' 
                      ? 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200'
                      : viewMode === 'compact'
                      ? 'p-2 hover:bg-primary-50/50 dark:hover:bg-gray-800/50 cursor-pointer transition-all duration-200 group'
                      : 'p-4 hover:bg-primary-50/50 dark:hover:bg-gray-800/50 cursor-pointer transition-all duration-200 group'
                  )}
                  onClick={(e) => {
                    if (e.target.type !== 'checkbox') {
                      handleGroupClick(group)
                    }
                  }}
                >
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedGroups.has(group._id)}
                      onChange={(e) => {
                        e.stopPropagation()
                        handleGroupSelection(group._id)
                      }}
                      className="w-4 h-4 text-primary-600 rounded border-gray-300 dark:border-gray-600 focus:ring-primary-500"
                    />
                  </div>

                  {/* Group Content */}
                  <div className={clsx(
                    viewMode === 'grid' ? 'space-y-3' : 'flex items-center'
                  )}>
                    {/* Avatar */}
                    <div className={clsx(
                      viewMode === 'grid' ? 'flex justify-center' : 'flex-shrink-0 relative'
                    )}>
                      <div className="relative">
                        <img
                          src={group.avatar}
                          alt={group.name}
                          className={clsx(
                            viewMode === 'grid' ? 'w-16 h-16' : 'w-12 h-12',
                            'rounded-full object-cover ring-2 ring-primary-500/20 group-hover:ring-primary-500/40 transition-all'
                          )}
                        />
                        <div className={clsx(
                          'absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white dark:border-gray-900 rounded-full',
                          group.online ? 'bg-green-500' : 'bg-gray-400'
                        )}></div>
                        {group.isStarred && (
                          <StarIconSolid className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500" />
                        )}
                        {group.isArchived && (
                          <ArchiveBoxIcon className="absolute -bottom-1 -right-1 w-4 h-4 text-gray-500" />
                        )}
                      </div>
                    </div>

                    {/* Group Info */}
                    <div className={clsx(
                      viewMode === 'grid' ? 'text-center space-y-1' : 'ml-3 flex-1 min-w-0'
                    )}>
                      <div className={clsx(
                        viewMode === 'grid' ? 'flex flex-col items-center' : 'flex items-center justify-between'
                      )}>
                        <div className={clsx(
                          viewMode === 'grid' ? 'flex items-center gap-2' : 'flex items-center gap-2'
                        )}>
                          <h3 className={clsx(
                            viewMode === 'grid' ? 'text-base font-medium' : 'text-sm font-medium',
                            'text-gray-900 dark:text-white truncate'
                          )}>
                            {group.name}
                          </h3>
                          {group.isAdmin && (
                            <StarIconSolid className="w-4 h-4 text-yellow-500" />
                          )}
                          {group.isMuted && (
                            <BellIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        {!viewMode === 'compact' && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(group.lastMessageAt)}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {viewMode !== 'compact' && group.description && (
                        <p className={clsx(
                          viewMode === 'grid' ? 'text-sm' : 'text-sm',
                          'text-gray-500 dark:text-gray-400 line-clamp-2'
                        )}>
                          {group.description}
                        </p>
                      )}

                      {/* Last Message */}
                      {viewMode !== 'grid' && (
                        <div className={clsx(
                          viewMode === 'compact' ? 'flex items-center justify-between' : 'flex items-center justify-between mt-1'
                        )}>
                          <p className={clsx(
                            viewMode === 'compact' ? 'text-xs' : 'text-sm',
                            'text-gray-500 dark:text-gray-400 truncate'
                          )}>
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
                      )}

                      {/* Members */}
                      <div className={clsx(
                        viewMode === 'grid' ? 'flex justify-center items-center gap-2 mt-2' : 'flex items-center gap-2 mt-2'
                      )}>
                        <div className="flex -space-x-2">
                          {getMemberAvatars(group.members).slice(0, viewMode === 'compact' ? 2 : 3).map((avatar, i) => (
                            <div
                              key={i}
                              className={clsx(
                                viewMode === 'compact' ? 'w-4 h-4' : 'w-5 h-5',
                                'rounded-full bg-primary-500 flex items-center justify-center text-xs text-white ring-2 ring-white dark:ring-gray-900'
                              )}
                            >
                              {typeof avatar === 'string' && avatar.startsWith('http') ? (
                                <img src={avatar} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                avatar
                              )}
                            </div>
                          ))}
                          {group.members?.length > (viewMode === 'compact' ? 2 : 3) && (
                            <div className={clsx(
                              viewMode === 'compact' ? 'w-4 h-4' : 'w-5 h-5',
                              'rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300 ring-2 ring-white dark:ring-gray-900'
                            )}>
                              +{group.members.length - (viewMode === 'compact' ? 2 : 3)}
                            </div>
                          )}
                        </div>
                        <span className={clsx(
                          viewMode === 'compact' ? 'text-xs' : 'text-xs',
                          'text-gray-400'
                        )}>
                          {group.members?.length || 0} members
                        </span>
                      </div>

                      {/* Group Tags/Features */}
                      {viewMode === 'grid' && (
                        <div className="flex flex-wrap gap-1 justify-center mt-2">
                          {group.type === 'channel' && (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                              Channel
                            </span>
                          )}
                          {group.type === 'broadcast' && (
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 text-xs rounded-full">
                              Broadcast
                            </span>
                          )}
                          {group.privacy === 'public' && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 text-xs rounded-full">
                              Public
                            </span>
                          )}
                        </div>
                      )}
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
              onClick={handleCreateAnnouncement}
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
                  className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleAnnouncementClick(announcement)}
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
          <button 
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 group"
            onClick={() => handleQuickAction('broadcast')}
          >
            <ChatBubbleLeftIcon className="w-6 h-6 text-blue-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Broadcast</span>
          </button>
          <button 
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200 group"
            onClick={() => handleQuickAction('poll')}
          >
            <ChartBarIcon className="w-6 h-6 text-purple-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Poll</span>
          </button>
          <button 
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 group"
            onClick={() => handleQuickAction('event')}
          >
            <CalendarIcon className="w-6 h-6 text-green-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-green-600 dark:text-green-400">Event</span>
          </button>
          <button 
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 group"
            onClick={() => handleQuickAction('more')}
          >
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

      {/* Group Insights Modal */}
      {showGroupInsights && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <GroupInsights
              groups={groupsList}
              onClose={() => setShowGroupInsights(false)}
            />
          </div>
        </div>
      )}

      {/* Poll Creator Modal */}
      <PollCreator
        isOpen={showPollCreator}
        onClose={() => setShowPollCreator(false)}
        onSubmit={handleCreatePoll}
        chatId={selectedGroups.length > 0 ? selectedGroups[0] : null}
      />

      {/* Announcement Creator Modal */}
      <AnnouncementCreator
        isOpen={showAnnouncementCreator}
        onClose={() => setShowAnnouncementCreator(false)}
        onSubmit={handleCreateAnnouncement}
        chatId={selectedGroups.length > 0 ? selectedGroups[0] : null}
      />

      {/* Event Creator Modal */}
      <EventCreator
        isOpen={showEventCreator}
        onClose={() => setShowEventCreator(false)}
        onSubmit={handleCreateEvent}
        chatId={selectedGroups.length > 0 ? selectedGroups[0] : null}
      />

      {/* More Options Modal */}
      {showMoreOptions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-sm w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">More Options</h3>
              <div className="space-y-2">
                <button 
                  onClick={handleImportGroups}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="text-gray-700 dark:text-gray-300">Import Groups</span>
                </button>
                <button 
                  onClick={handleExportGroupsFromMore}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="text-gray-700 dark:text-gray-300">Export Groups</span>
                </button>
                <button 
                  onClick={handleGroupSettings}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="text-gray-700 dark:text-gray-300">Group Settings</span>
                </button>
                <button 
                  onClick={handleHelpSupport}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="text-gray-700 dark:text-gray-300">Help & Support</span>
                </button>
              </div>
              <div className="mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setShowMoreOptions(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupsPage
