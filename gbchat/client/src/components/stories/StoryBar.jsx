import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PlusIcon } from '@heroicons/react/24/outline'
import StoryCard from './StoryCard'
import StoryCreator from './StoryCreator'
import StoryViewer from './StoryViewer'
import useStoryStore from '../../store/useStoryStore'
import useAuthStore from '../../store/useAuthStore'
import clsx from 'clsx'

const StoryBar = () => {
  const { user } = useAuthStore()
  const { stories, myStory, fetchStories } = useStoryStore()
  const [showCreator, setShowCreator] = useState(false)
  const [viewingStory, setViewingStory] = useState(null)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)

  React.useEffect(() => {
    fetchStories()
  }, [])

  const handleStoryNavigation = (direction) => {
    const currentIndex = stories.findIndex(s => s._id === viewingStory._id)
    if (direction === 'next' && currentIndex < stories.length - 1) {
      setViewingStory(stories[currentIndex + 1])
      setCurrentStoryIndex(0)
    } else if (direction === 'prev' && currentIndex > 0) {
      setViewingStory(stories[currentIndex - 1])
      setCurrentStoryIndex(0)
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="px-3 py-3 md:px-4 md:py-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Stories
          </h3>
          
          {/* Stories horizontal scroll */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {/* Add story button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0"
            >
              <button
                onClick={() => setShowCreator(true)}
                className="relative"
              >
                <div className={clsx(
                  'w-16 h-20 md:w-20 md:h-24',
                  'rounded-lg overflow-hidden',
                  'bg-gradient-to-b from-gray-100 to-gray-200',
                  'dark:from-gray-700 dark:to-gray-800',
                  'flex flex-col items-center justify-center',
                  'border-2 border-dashed border-gray-300 dark:border-gray-600'
                )}>
                  {myStory ? (
                    <>
                      <img
                        src={myStory.media[0]?.thumbnail || myStory.media[0]?.url}
                        alt="My story"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30" />
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                        <PlusIcon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                        Add Story
                      </span>
                    </>
                  )}
                </div>
                {myStory && (
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                    <PlusIcon className="w-4 h-4 text-white" />
                  </div>
                )}
                <p className="text-xs text-center mt-1 text-gray-700 dark:text-gray-300">
                  Your Story
                </p>
              </button>
            </motion.div>

            {/* Other stories */}
            {stories.map((story, index) => (
              <motion.div
                key={story._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0"
              >
                <StoryCard
                  story={story}
                  onClick={() => {
                    setViewingStory(story)
                    setCurrentStoryIndex(0)
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Creator Modal */}
      {showCreator && (
        <StoryCreator
          onClose={() => setShowCreator(false)}
          onSuccess={() => {
            setShowCreator(false)
            fetchStories()
          }}
        />
      )}

      {/* Story Viewer */}
      {viewingStory && (
        <StoryViewer
          story={viewingStory}
          currentIndex={currentStoryIndex}
          onClose={() => setViewingStory(null)}
          onNext={() => handleStoryNavigation('next')}
          onPrev={() => handleStoryNavigation('prev')}
          onIndexChange={setCurrentStoryIndex}
        />
      )}
    </>
  )
}

export default StoryBar