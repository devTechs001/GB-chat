import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  PaperAirplaneIcon,
  EllipsisVerticalIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  EyeIcon,
  ShareIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import Avatar from '../common/Avatar'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const StoryViewer = ({
  story,
  currentIndex,
  onClose,
  onNext,
  onPrev,
  onIndexChange,
}) => {
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [showViewers, setShowViewers] = useState(false)
  const [views, setViews] = useState(story?.viewedBy?.length || 0)
  const videoRef = useRef(null)
  const progressInterval = useRef(null)

  const currentStoryItem = story?.media?.[currentIndex]
  const isVideo = currentStoryItem?.type === 'video'
  const duration = isVideo ? 15000 : 5000 // 15s for video, 5s for image
  const allowSaving = story?.settings?.allowSaving !== false
  const allowSharing = story?.settings?.allowSharing !== false
  const allowReplies = story?.settings?.allowReplies !== false

  // Handle case when story or media is undefined
  if (!story || !story.media || story.media.length === 0) {
    return null
  }

  useEffect(() => {
    // Reset progress when story changes
    setProgress(0)
    
    // Start progress timer
    if (!isPaused) {
      const startTime = Date.now()
      progressInterval.current = setInterval(() => {
        const elapsed = Date.now() - startTime
        const newProgress = (elapsed / duration) * 100
        
        if (newProgress >= 100) {
          clearInterval(progressInterval.current)
          handleNextStory()
        } else {
          setProgress(newProgress)
        }
      }, 30)
    }

    return () => clearInterval(progressInterval.current)
  }, [currentIndex, isPaused, story])

  const handleNextStory = () => {
    if (currentIndex < (story?.media?.length || 0) - 1) {
      onIndexChange(currentIndex + 1)
    } else {
      onNext()
    }
  }

  const handlePrevStory = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1)
    } else {
      onPrev()
    }
  }

  const handleReply = () => {
    if (replyText.trim()) {
      // Send reply
      console.log('Sending reply:', replyText)
      setReplyText('')
      setShowReply(false)
    }
  }

  const handleSave = async () => {
    if (!allowSaving) {
      toast.error('Saving is not allowed for this story')
      return
    }

    try {
      // Mark story as saved
      await api.post(`/stories/${story._id}/save`, {
        mediaIndex: currentIndex,
      })
      setIsSaved(true)

      // Download the media
      const mediaUrl = currentStoryItem.url
      const response = await fetch(mediaUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `story_${story.user.name}_${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Story saved to device')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save story')
    }
  }

  const handleShare = async () => {
    if (!allowSharing) {
      toast.error('Sharing is not allowed for this story')
      return
    }

    try {
      // Share using Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this story',
          url: currentStoryItem.url,
        })
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(currentStoryItem.url)
        toast.success('Link copied to clipboard')
      }
    } catch (error) {
      console.error('Share error:', error)
    }
  }

  const handleScreenTouch = (e) => {
    if (showViewers) return // Don't navigate if viewers list is open
    const screenWidth = window.innerWidth
    const touchX = e.clientX || e.touches?.[0]?.clientX
    
    if (touchX < screenWidth / 3) {
      handlePrevStory()
    } else if (touchX > (screenWidth * 2) / 3) {
      handleNextStory()
    } else {
      setIsPaused(!isPaused)
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="h-full w-full relative flex items-center justify-center"
          onClick={handleScreenTouch}
        >
          {/* Story Image/Video */}
          {isVideo ? (
            <video
              ref={videoRef}
              src={currentStoryItem.url}
              className="max-h-full max-w-full object-contain"
              autoPlay
              muted={isMuted}
              loop={false}
              playsInline
            />
          ) : (
            <img
              src={currentStoryItem.url}
              alt="Story"
              className="max-h-full max-w-full object-contain"
            />
          )}

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 pointer-events-none" />

          {/* Progress Bars */}
          <div className="absolute top-0 left-0 right-0 p-2 flex gap-1">
            {story.media.map((_, index) => (
              <div
                key={index}
                className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-white transition-all duration-100"
                  style={{
                    width:
                      index < currentIndex
                        ? '100%'
                        : index === currentIndex
                        ? `${progress}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-4 left-0 right-0 px-4 flex items-center justify-between pointer-events-none z-20">
            <div className="flex items-center gap-3">
              <Avatar
                src={story.user?.avatar || null}
                alt={story.user?.name || 'User'}
                size="sm"
                className="ring-2 ring-white/50"
              />
              <div>
                <p className="text-white font-medium text-sm">
                  {story.user?.name || 'Unknown User'}
                </p>
                <p className="text-white/70 text-xs">
                  {currentStoryItem?.createdAt 
                    ? formatDistanceToNow(new Date(currentStoryItem.createdAt), {
                        addSuffix: true,
                      })
                    : 'Just now'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              {isVideo && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsMuted(!isMuted)
                  }}
                  className="p-2 hover:bg-white/10 rounded-full"
                >
                  {isMuted ? (
                    <SpeakerXMarkIcon className="w-5 h-5 text-white" />
                  ) : (
                    <SpeakerWaveIcon className="w-5 h-5 text-white" />
                  )}
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                className="p-2 hover:bg-white/10 rounded-full pointer-events-auto"
              >
                <XMarkIcon className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Caption */}
          {currentStoryItem.caption && (
            <div className="absolute bottom-20 left-0 right-0 px-4">
              <p className="text-white text-center text-sm md:text-base">
                {currentStoryItem.caption}
              </p>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="absolute bottom-4 left-0 right-0 px-4 z-20">
            <div className="flex flex-col items-center gap-4">
              {/* Views indicator for own stories */}
              {story.isOwn && !showReply && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowViewers(true)
                    setIsPaused(true)
                  }}
                  className="flex flex-col items-center gap-1 text-white opacity-80 hover:opacity-100 transition-opacity"
                >
                  <EyeIcon className="w-6 h-6" />
                  <span className="text-xs font-medium">{views} views</span>
                </motion.button>
              )}

              {showReply ? (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex items-center gap-2 w-full max-w-lg"
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                    placeholder="Type a reply..."
                    className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-md rounded-full text-white placeholder-white/50 border border-white/20 focus:outline-none focus:bg-white/20 transition-all"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReply()
                    }}
                    className="p-3 bg-primary-500 hover:bg-primary-600 rounded-full shadow-lg transition-transform active:scale-90"
                  >
                    <PaperAirplaneIcon className="w-5 h-5 text-white" />
                  </button>
                </motion.div>
              ) : (
                <div className="flex items-center justify-center gap-6 w-full max-w-lg">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsLiked(!isLiked)
                    }}
                    className="group flex flex-col items-center gap-1"
                  >
                    <div className="p-3 hover:bg-white/10 rounded-full transition-colors">
                      {isLiked ? (
                        <HeartSolidIcon className="w-7 h-7 text-red-500" />
                      ) : (
                        <HeartIcon className="w-7 h-7 text-white" />
                      )}
                    </div>
                  </button>

                  {allowReplies && !story.isOwn && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowReply(true)
                      }}
                      className="flex-1 px-8 py-3 bg-white/10 backdrop-blur-md rounded-full text-white font-medium hover:bg-white/20 border border-white/10 transition-all active:scale-95"
                    >
                      Reply
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    {allowSaving && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSave()
                        }}
                        className="p-3 hover:bg-white/10 rounded-full transition-colors"
                        title="Save"
                      >
                        {isSaved ? (
                          <CheckCircleSolidIcon className="w-7 h-7 text-green-500" />
                        ) : (
                          <DocumentArrowDownIcon className="w-7 h-7 text-white" />
                        )}
                      </button>
                    )}

                    {allowSharing && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleShare()
                        }}
                        className="p-3 hover:bg-white/10 rounded-full transition-colors"
                        title="Share"
                      >
                        <ShareIcon className="w-7 h-7 text-white" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Viewers List Modal */}
          <AnimatePresence>
            {showViewers && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute inset-x-0 bottom-0 h-[60vh] bg-white dark:bg-gray-900 rounded-t-[2.5rem] z-30 shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto my-4" />
                <div className="px-6 py-2 flex items-center justify-between">
                  <h3 className="text-xl font-bold dark:text-white">Views ({views})</h3>
                  <button 
                    onClick={() => {
                      setShowViewers(false)
                      setIsPaused(false)
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                  >
                    <XMarkIcon className="w-6 h-6 dark:text-white" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-2">
                  {story.viewedBy?.length > 0 ? (
                    story.viewedBy.map((viewer, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-colors">
                        <Avatar src={viewer.avatar} alt={viewer.name} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold dark:text-white truncate">{viewer.name}</p>
                          <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(viewer.at), { addSuffix: true })}</p>
                        </div>
                        {viewer.liked && <HeartSolidIcon className="w-5 h-5 text-red-500" />}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                      <EyeIcon className="w-12 h-12 opacity-20" />
                      <p>No views yet</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation hints for desktop */}
          <div className="hidden md:flex absolute inset-y-0 left-0 right-0 pointer-events-none">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handlePrevStory()
              }}
              className="flex-1 flex items-center justify-start pl-4 pointer-events-auto"
            >
              <ChevronLeftIcon className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleNextStory()
              }}
              className="flex-1 flex items-center justify-end pr-4 pointer-events-auto"
            >
              <ChevronRightIcon className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default StoryViewer