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
          <div className="absolute top-4 left-0 right-0 px-4 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-3">
              <Avatar
                src={story.user.avatar}
                alt={story.user.name}
                size="sm"
                className="ring-2 ring-white/50"
              />
              <div>
                <p className="text-white font-medium text-sm">
                  {story.user.name}
                </p>
                <p className="text-white/70 text-xs">
                  {formatDistanceToNow(new Date(currentStoryItem.createdAt), {
                    addSuffix: true,
                  })}
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
          <div className="absolute bottom-4 left-0 right-0 px-4">
            {showReply ? (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                  placeholder="Send a reply..."
                  className="flex-1 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white placeholder-white/50 focus:outline-none focus:bg-white/20"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleReply()
                  }}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full"
                >
                  <PaperAirplaneIcon className="w-5 h-5 text-white" />
                </button>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsLiked(!isLiked)
                  }}
                  className="p-3 hover:bg-white/10 rounded-full"
                  title="React"
                >
                  {isLiked ? (
                    <HeartSolidIcon className="w-6 h-6 text-red-500" />
                  ) : (
                    <HeartIcon className="w-6 h-6 text-white" />
                  )}
                </button>

                {allowReplies && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowReply(true)
                    }}
                    className="px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20"
                  >
                    Reply
                  </button>
                )}

                {allowSaving && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSave()
                    }}
                    className="p-3 hover:bg-white/10 rounded-full relative"
                    title="Save story"
                  >
                    {isSaved ? (
                      <CheckCircleSolidIcon className="w-6 h-6 text-green-500" />
                    ) : (
                      <DocumentArrowDownIcon className="w-6 h-6 text-white" />
                    )}
                  </button>
                )}

                {allowSharing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShare()
                    }}
                    className="p-3 hover:bg-white/10 rounded-full"
                    title="Share story"
                  >
                    <PaperAirplaneIcon className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>
            )}
          </div>

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