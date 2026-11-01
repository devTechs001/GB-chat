import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  ClockIcon,
  EyeIcon,
  ChartBarIcon,
  StarIcon,
  FireIcon,
  ChatBubbleLeftEllipsisIcon,
  HeartIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import StoryCard from '../components/stories/StoryCard'
import StoryCardEnhanced from '../components/stories/StoryCardEnhanced'
import StoryViewer from '../components/stories/StoryViewer'
import StoryCreator from '../components/stories/StoryCreator'
import StoryHighlights from '../components/stories/StoryHighlights'
import StoryAnalytics from '../components/stories/StoryAnalytics'
import useStoryStore from '../store/useStoryStore'
import useAuthStore from '../store/useAuthStore'
import Avatar from '../components/common/Avatar'
import Button from '../components/common/Button'
import PageHeader from '../components/layout/PageHeader'
import EmptyState from '../components/layout/EmptyState'
import { PhotoIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import api from '../lib/api'
import toast from 'react-hot-toast'

// Highlights live on the server; the local cache keeps the page usable offline
// and in demo mode.
const HIGHLIGHT_CACHE_KEY = 'storyHighlights'

const StoriesPage = () => {
  const { user } = useAuthStore()
  const { stories, myStory, fetchStories, fetchMyStory } = useStoryStore()
  const [viewingStory, setViewingStory] = useState(null)
  const [showCreator, setShowCreator] = useState(false)
  const [filter, setFilter] = useState('all') // all, unread, contacts
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [selectedStoryForAnalytics, setSelectedStoryForAnalytics] = useState(null)
  const [highlights, setHighlights] = useState([])
  const [showHighlights, setShowHighlights] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const readHighlightCache = () => {
    try {
      const cached = JSON.parse(localStorage.getItem(HIGHLIGHT_CACHE_KEY) || '[]')
      return Array.isArray(cached) ? cached : []
    } catch {
      return []
    }
  }

  const cacheHighlights = (list) => {
    try {
      localStorage.setItem(HIGHLIGHT_CACHE_KEY, JSON.stringify(list))
    } catch {
      /* storage full or unavailable — the server copy is the source of truth */
    }
  }

  const fetchHighlights = async () => {
    try {
      const { data } = await api.get('/stories/highlights')
      const list = Array.isArray(data?.highlights) ? data.highlights : []
      setHighlights(list)
      cacheHighlights(list)
    } catch {
      // offline / demo: fall back to whatever we cached locally
      setHighlights(readHighlightCache())
    }
  }

  useEffect(() => {
    fetchStories()
    fetchMyStory()
    fetchHighlights()
  }, [])

  const filteredStories = (stories || []).filter((story) => {
    const storyOwnerId = story?.user?._id || story?.userId?._id || story?.userId
    if (filter === 'mine') {
      return String(storyOwnerId) === String(user?._id || user?.id)
    }
    if (filter === 'unread') {
      return !story?.viewedBy?.includes(user?._id)
    }
    if (filter === 'contacts') {
      return Boolean(user?.contacts?.some((contactId) => String(contactId) === String(storyOwnerId)))
    }
    return true
  })

  const meId = user?._id || user?.id

  /** Unseen stories first, then newest — the order people actually browse in. */
  const orderedStories = React.useMemo(() => {
    const isSeen = (story) => {
      const seen = story?.viewers || story?.viewedBy || []
      return (seen || []).some((entry) => {
        const id = entry?.user?._id || entry?.user || entry?.userId || entry
        return String(id) === String(meId)
      })
    }
    return [...filteredStories].sort((a, b) => {
      const seenDiff = Number(isSeen(a)) - Number(isSeen(b))
      if (seenDiff !== 0) return seenDiff
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })
  }, [filteredStories, meId])

  const unseenCount = orderedStories.filter((story) => {
    const seen = story?.viewers || story?.viewedBy || []
    return !(seen || []).some((entry) => String(entry?.user?._id || entry?.user || entry) === String(meId))
  }).length

  /** "Expires in 6h" style label for the insights card. */
  const expiresIn = (date) => {
    if (!date) return '24h'
    const ms = new Date(date).getTime() - Date.now()
    if (ms <= 0) return 'expired'
    const hours = Math.floor(ms / 3600000)
    if (hours >= 1) return `${hours}h`
    return `${Math.max(1, Math.round(ms / 60000))}m`
  }

  /** One entry per author for the horizontal rail. */
  const authorGroups = React.useMemo(() => {
    const map = new Map()
    for (const story of orderedStories) {
      const owner = story?.user || story?.userId || {}
      const id = owner?._id || owner?.id || story?.userId || 'unknown'
      if (!map.has(id)) {
        map.set(id, {
          id,
          name: owner?.fullName || owner?.name || 'GBChat user',
          avatar: owner?.avatar || null,
          stories: [],
        })
      }
      map.get(id).stories.push(story)
    }
    return [...map.values()]
  }, [orderedStories])

  const refreshAll = async () => {
    setRefreshing(true)
    await Promise.all([fetchStories(), fetchMyStory(), fetchHighlights()])
    setRefreshing(false)
  }

  const handleStoryClick = (story, index) => {
    setViewingStory(story)
    setCurrentIndex(0)
  }

  const handleNext = () => {
    const list = orderedStories
    const currentIdx = list.findIndex((s) => s._id === viewingStory._id)
    if (currentIdx >= 0 && currentIdx < list.length - 1) {
      setViewingStory(list[currentIdx + 1])
      setCurrentIndex(0)
    } else {
      setViewingStory(null)
    }
  }

  const handlePrev = () => {
    const list = orderedStories
    const currentIdx = list.findIndex((s) => s._id === viewingStory._id)
    if (currentIdx > 0) {
      setViewingStory(list[currentIdx - 1])
      setCurrentIndex(0)
    }
  }

  /* Keyboard: N opens the creator, R refreshes — matches the viewer's ←/→/Esc. */
  useEffect(() => {
    const onKeyDown = (event) => {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || viewingStory || showCreator) return
      if (event.key.toLowerCase() === 'n') setShowCreator(true)
      if (event.key.toLowerCase() === 'r') refreshAll()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [viewingStory, showCreator])

  const handleAddHighlight = async (highlightData) => {
    const optimistic = {
      _id: `local-${Date.now()}`,
      ...highlightData,
      storyCount: 0,
      stories: [],
    }
    setHighlights((prev) => [...prev, optimistic])

    try {
      const { data } = await api.post('/stories/highlights', {
        title: highlightData.title,
        icon: highlightData.icon,
        color: highlightData.color,
        categoryId: highlightData.categoryId,
        coverImage: highlightData.coverImage,
        storyIds: highlightData.storyIds,
      })
      if (data?.highlight) {
        setHighlights((prev) => {
          const next = prev.map((item) => (item._id === optimistic._id ? data.highlight : item))
          cacheHighlights(next)
          return next
        })
      }
      toast.success('Highlight created')
    } catch (error) {
      // Keep it locally so the UI is not lost when the API is unreachable.
      setHighlights((prev) => {
        cacheHighlights(prev)
        return prev
      })
      if (error?.response) toast.error(error.response.data?.message || 'Could not save highlight')
    }
  }

  const handleEditHighlight = async (highlightData) => {
    setHighlights((prev) => {
      const next = prev.map((h) => (h._id === highlightData._id ? { ...h, ...highlightData } : h))
      cacheHighlights(next)
      return next
    })

    if (String(highlightData._id).startsWith('local-')) return
    try {
      await api.patch(`/stories/highlights/${highlightData._id}`, {
        title: highlightData.title,
        icon: highlightData.icon,
        color: highlightData.color,
        categoryId: highlightData.categoryId,
        coverImage: highlightData.coverImage,
      })
    } catch (error) {
      if (error?.response) toast.error(error.response.data?.message || 'Could not update highlight')
    }
  }

  const handleDeleteHighlight = async (highlightData) => {
    const previous = highlights
    const next = highlights.filter((h) => h._id !== highlightData._id)
    setHighlights(next)
    cacheHighlights(next)

    if (String(highlightData._id).startsWith('local-')) return
    try {
      await api.delete(`/stories/highlights/${highlightData._id}`)
      toast.success('Highlight deleted')
    } catch (error) {
      setHighlights(previous)
      cacheHighlights(previous)
      toast.error(error?.response?.data?.message || 'Could not delete highlight')
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-gray-50 dark:bg-gray-950">
      <PageHeader
        title="Stories"
        subtitle="Updates from the last 24 hours"
        icon={PhotoIcon}
        badge={filteredStories.length}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={<ArrowPathIcon className={clsx('w-5 h-5', refreshing && 'animate-spin')} />}
              onClick={refreshAll}
              aria-label="Refresh stories"
            />
            <Button
              variant="primary"
              size="sm"
              icon={<PlusIcon className="w-5 h-5" />}
              onClick={() => setShowCreator(true)}
            >
              <span className="hidden sm:inline">Create story</span>
            </Button>
          </>
        }
      >
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: unseenCount ? `Unread · ${unseenCount}` : 'Unread' },
            { id: 'mine', label: 'Mine' },
            { id: 'contacts', label: 'Contacts' },
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

      {/* Scrollable body */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">

      {/* My Story Section */}
      {myStory && (
        <div className="mx-4 mt-4 md:mx-6 md:mt-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              My story
            </h2>
            <Button
              variant="secondary"
              size="sm"
              icon={<ChartBarIcon className="w-4 h-4" />}
              onClick={() => {
                setSelectedStoryForAnalytics(myStory)
                setShowAnalytics(true)
              }}
            >
              Analytics
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <StoryCardEnhanced
              story={{ ...myStory, user: user || myStory.user, currentUserId: user?._id }}
              onClick={() => handleStoryClick(myStory, -1)}
              isOwn
            />
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-xl surface-muted px-2.5 py-2">
                  <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-gray-500">
                    <EyeIcon className="h-3 w-3" /> Views
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {myStory.viewCount ?? (myStory.viewers || []).length ?? 0}
                  </p>
                </div>
                <div className="rounded-xl surface-muted px-2.5 py-2">
                  <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-gray-500">
                    <HeartIcon className="h-3 w-3" /> Reactions
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {myStory.reactions || 0}
                  </p>
                </div>
                <div className="rounded-xl surface-muted px-2.5 py-2">
                  <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-gray-500">
                    <ChatBubbleLeftEllipsisIcon className="h-3 w-3" /> Replies
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {myStory.replies || 0}
                  </p>
                </div>
                <div className="rounded-xl surface-muted px-2.5 py-2">
                  <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-gray-500">
                    <ClockIcon className="h-3 w-3" /> Expires
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    in {expiresIn(myStory.expiresAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Story Highlights Section */}
      {showHighlights && (
        <StoryHighlights
          highlights={highlights}
          onAddHighlight={handleAddHighlight}
          onEditHighlight={handleEditHighlight}
          onDeleteHighlight={handleDeleteHighlight}
        />
      )}

      {/* Author rail — one ring per person, unseen first */}
      {authorGroups.length > 0 && (
        <div className="px-4 pt-4 md:px-6">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {authorGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => {
                  setViewingStory(group.stories[0])
                  setCurrentIndex(0)
                }}
                className="flex w-16 flex-none flex-col items-center gap-1"
              >
                <span className="rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-[2px]">
                  <span className="block rounded-full bg-gray-50 p-[2px] dark:bg-gray-950">
                    <Avatar src={group.avatar} alt={group.name} size="md" />
                  </span>
                </span>
                <span className="w-full truncate text-center text-[10px] text-gray-600 dark:text-gray-400">
                  {group.id === meId ? 'You' : group.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stories Grid */}
      <div className="p-4 md:p-6">
        {filteredStories.length === 0 ? (
          <EmptyState
            icon={PhotoIcon}
            title="No stories yet"
            description="Be the first to share a story with your friends."
            action={
              <div className="flex items-center gap-2">
                <Button variant="primary" onClick={() => setShowCreator(true)}>
                  Create story
                </Button>
                <Button variant="secondary" onClick={refreshAll} loading={refreshing}>
                  Refresh
                </Button>
              </div>
            }
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <AnimatePresence>
              {orderedStories.map((story, index) => (
                <motion.div
                  key={story._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: Math.min(index, 12) * 0.04 }}
                  className={clsx(
                    'relative',
                    (story.viewers || []).some(
                      (entry) => String(entry?.user?._id || entry?.user || entry) === String(meId)
                    ) && 'opacity-70'
                  )}
                >
                  <StoryCardEnhanced
                    story={{ ...story, currentUserId: user?._id }}
                    onClick={() => handleStoryClick(story, index)}
                    isOwn={String(story.user?._id || story.userId?._id) === String(user?._id)}
                    isCloseFriend={user?.closeFriends?.includes(story.user?._id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      </div>

      {/* Story Creator Modal */}
      {showCreator && (
        <StoryCreator
          onClose={() => setShowCreator(false)}
          onSuccess={() => {
            setShowCreator(false)
            fetchStories()
            fetchMyStory()
          }}
        />
      )}

      {/* Story Viewer */}
      {viewingStory && (
        <StoryViewer
          story={viewingStory}
          currentIndex={currentIndex}
          onClose={() => setViewingStory(null)}
          onNext={handleNext}
          onPrev={handlePrev}
          onIndexChange={setCurrentIndex}
        />
      )}

      {/* Story Analytics Modal */}
      {showAnalytics && selectedStoryForAnalytics && (
        <StoryAnalytics
          story={selectedStoryForAnalytics}
          onClose={() => {
            setShowAnalytics(false)
            setSelectedStoryForAnalytics(null)
          }}
        />
      )}
    </div>
  )
}

export default StoriesPage