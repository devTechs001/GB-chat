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

  const filteredStories = stories.filter((story) => {
    if (filter === 'unread') {
      return !story.viewedBy?.includes(user._id)
    }
    if (filter === 'contacts') {
      return user.contacts?.includes(story.user._id)
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
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950 pb-16">
      {/* Mobile Header */}
      <div className="md:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">📸 Stories</h1>
        <Button
          variant="primary"
          size="sm"
          icon={<PlusIcon className="w-5 h-5" />}
          onClick={() => setShowCreator(true)}
        />
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            📸 Stories
          </h1>
          <Button
            variant="primary"
            icon={<PlusIcon className="w-5 h-5" />}
            onClick={() => setShowCreator(true)}
          >
            Create Story
          </Button>
        </div>

        {/* Filters */}
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
                'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300',
                filter === filterOption.id
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200/50 dark:border-gray-700/50'
              )}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* My Story Section */}
      {myStory && (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6">
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
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {filteredStories.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary-500/20 to-primary-600/10 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No stories yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Be the first to share a story with your friends
            </p>
            <Button
              variant="primary"
              onClick={() => setShowCreator(true)}
            >
              Create Story
            </Button>
          </div>
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