import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusIcon, ClockIcon, EyeIcon, ChartBarIcon, StarIcon } from '@heroicons/react/24/outline'
import StoryCard from '../components/stories/StoryCard'
import StoryCardEnhanced from '../components/stories/StoryCardEnhanced'
import StoryViewer from '../components/stories/StoryViewer'
import StoryCreator from '../components/stories/StoryCreator'
import StoryHighlights from '../components/stories/StoryHighlights'
import StoryAnalytics from '../components/stories/StoryAnalytics'
import useStoryStore from '../store/useStoryStore'
import useAuthStore from '../store/useAuthStore'
import Button from '../components/common/Button'
import PageHeader from '../components/layout/PageHeader'
import EmptyState from '../components/layout/EmptyState'
import { PhotoIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

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

  useEffect(() => {
    fetchStories()
    fetchMyStory()
    // Load highlights from localStorage or API
    const savedHighlights = localStorage.getItem('storyHighlights')
    if (savedHighlights) {
      setHighlights(JSON.parse(savedHighlights))
    }
  }, [])

  const filteredStories = (stories || []).filter((story) => {
    const storyOwnerId = story?.user?._id || story?.userId?._id || story?.userId
    if (filter === 'unread') {
      return !story?.viewedBy?.includes(user?._id)
    }
    if (filter === 'contacts') {
      return Boolean(user?.contacts?.some((contactId) => String(contactId) === String(storyOwnerId)))
    }
    return true
  })

  const handleStoryClick = (story, index) => {
    setViewingStory(story)
    setCurrentIndex(0)
  }

  const handleNext = () => {
    const currentIdx = stories.findIndex((s) => s._id === viewingStory._id)
    if (currentIdx < stories.length - 1) {
      setViewingStory(stories[currentIdx + 1])
      setCurrentIndex(0)
    } else {
      setViewingStory(null)
    }
  }

  const handlePrev = () => {
    const currentIdx = stories.findIndex((s) => s._id === viewingStory._id)
    if (currentIdx > 0) {
      setViewingStory(stories[currentIdx - 1])
      setCurrentIndex(0)
    }
  }

  const handleAddHighlight = (highlightData) => {
    const newHighlight = {
      _id: Date.now().toString(),
      ...highlightData,
      storyCount: 0,
      stories: [],
    }
    const updatedHighlights = [...highlights, newHighlight]
    setHighlights(updatedHighlights)
    localStorage.setItem('storyHighlights', JSON.stringify(updatedHighlights))
  }

  const handleEditHighlight = (highlightData) => {
    const updatedHighlights = highlights.map(h =>
      h._id === highlightData._id ? { ...h, ...highlightData } : h
    )
    setHighlights(updatedHighlights)
    localStorage.setItem('storyHighlights', JSON.stringify(updatedHighlights))
  }

  const handleDeleteHighlight = (highlightData) => {
    const updatedHighlights = highlights.filter(h => h._id !== highlightData._id)
    setHighlights(updatedHighlights)
    localStorage.setItem('storyHighlights', JSON.stringify(updatedHighlights))
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-gray-50 dark:bg-gray-950">
      <PageHeader
        title="Stories"
        subtitle="Updates from the last 24 hours"
        icon={PhotoIcon}
        badge={filteredStories.length}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<PlusIcon className="w-5 h-5" />}
            onClick={() => setShowCreator(true)}
          >
            <span className="hidden sm:inline">Create story</span>
          </Button>
        }
      >
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
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
              ✨ My Story
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
              story={{ ...myStory, user, currentUserId: user._id }}
              onClick={() => handleStoryClick(myStory, -1)}
              isOwn
            />
            <div className="flex-1">
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {myStory.media?.length || 0} {myStory.media?.length === 1 ? 'photo' : 'photos'}
                </span>
                <span className="flex items-center gap-1">
                  <EyeIcon className="w-4 h-4" />
                  {myStory.viewCount || 0} views
                </span>
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

      {/* Stories Grid */}
      <div className="p-4 md:p-6">
        {filteredStories.length === 0 ? (
          <EmptyState
            icon={PhotoIcon}
            title="No stories yet"
            description="Be the first to share a story with your friends."
            action={
              <Button variant="primary" onClick={() => setShowCreator(true)}>
                Create story
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <AnimatePresence>
              {filteredStories.map((story, index) => (
                <motion.div
                  key={story._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <StoryCardEnhanced
                    story={story}
                    onClick={() => handleStoryClick(story, index)}
                    isCloseFriend={user.closeFriends?.includes(story.user._id)}
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