import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusIcon, ClockIcon, EyeIcon } from '@heroicons/react/24/outline'
import StoryCard from '../components/stories/StoryCard'
import StoryViewer from '../components/stories/StoryViewer'
import StoryCreator from '../components/stories/StoryCreator'
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

  useEffect(() => {
    fetchStories()
    fetchMyStory()
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

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-dark-bg pb-16">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Stories</h1>
        <Button
          variant="primary"
          size="sm"
          icon={<PlusIcon className="w-5 h-5" />}
          onClick={() => setShowCreator(true)}
        />
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Stories
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
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                filter === filterOption.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* My Story Section */}
      {myStory && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            My Story
          </h2>
          <div className="flex items-center gap-4">
            <StoryCard
              story={{ ...myStory, user }}
              onClick={() => handleStoryClick(myStory, -1)}
              isOwn
            />
            <div className="flex-1">
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {myStory.media.length} {myStory.media.length === 1 ? 'photo' : 'photos'}
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

      {/* Stories Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {filteredStories.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
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
                  <StoryCard
                    story={story}
                    onClick={() => handleStoryClick(story, index)}
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
    </div>
  )
}

export default StoriesPage