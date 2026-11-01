import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  PaperAirplaneIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  EyeIcon,
  ShareIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import Avatar from '../common/Avatar'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'
import api from '../../lib/api'
import useStoryStore from '../../store/useStoryStore'
import useAuthStore from '../../store/useAuthStore'
import toast from 'react-hot-toast'

const IMAGE_DURATION = 5000

/** Owning user of a story (server returns `user`, demo data uses `userId`) */
const storyOwner = (story) => story?.user || story?.userId || {}

/** A story is "mine" when its owner is the signed-in user */
const isOwnStory = (story, currentUser) => {
  if (story?.isOwn) return true
  const ownerId = storyOwner(story)?._id || storyOwner(story)?.id
  const meId = currentUser?._id || currentUser?.id
  return Boolean(ownerId && meId && String(ownerId) === String(meId))
}

/** Reaction by a given user inside `viewers[]` (server shape) or `reactions[]` (legacy) */
const reactionOf = (story, userId) => {
  if (!story) return null
  if (story.myReaction !== undefined) return story.myReaction
  const viewer = (story.viewers || []).find(
    (v) => String(v?.user?._id || v?.user) === String(userId)
  )
  if (viewer?.reaction) return viewer.reaction

  const legacy = (story.reactions || []).find(
    (r) => String(r?.user?._id || r?.user) === String(userId)
  )
  return legacy?.reaction || legacy?.type || null
}

const StoryViewer = ({ story, currentIndex = 0, onClose, onNext, onPrev, onIndexChange }) => {
  const { user } = useAuthStore()
  const reactToStory = useStoryStore((state) => state.reactToStory)
  const viewStory = useStoryStore((state) => state.viewStory)

  const media = story?.media || []
  const currentItem = media[currentIndex]

  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [showViewers, setShowViewers] = useState(false)
  const [sendingReply, setSendingReply] = useState(false)
  const [viewerList, setViewerList] = useState([])
  const [reaction, setReaction] = useState(() => reactionOf(story, user?._id))

  const videoRef = useRef(null)
  const startTimeRef = useRef(Date.now())

  const isVideo = currentItem?.type === 'video'
  const duration = isVideo ? 15000 : IMAGE_DURATION
  const own = isOwnStory(story, user)
  const allowSaving = story?.settings?.allowSaving !== false
  const allowSharing = story?.settings?.allowSharing !== false
  const allowReplies = story?.settings?.allowReplies !== false

  const totalMedia = Math.max(media.length, 1)

  const viewCount = useMemo(() => {
    if (!story) return 0
    if (typeof story.viewCount === 'number') return story.viewCount
    if (typeof story.analytics?.uniqueViews === 'number') return story.analytics.uniqueViews
    return (story.viewers || story.viewedBy || []).length
  }, [story])

  const viewers = viewerList.length
    ? viewerList
    : (story?.viewers || []).map((entry) => ({
        _id: entry?._id || entry?.user?._id,
        user: entry?.user,
        viewedAt: entry?.viewedAt || entry?.at,
        reaction: entry?.reaction,
      }))

  const goNext = useCallback(() => {
    if (currentIndex < totalMedia - 1) {
      onIndexChange?.(currentIndex + 1)
    } else {
      onNext?.()
    }
  }, [currentIndex, totalMedia, onIndexChange, onNext])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      onIndexChange?.(currentIndex - 1)
    } else {
      onPrev?.()
    }
  }, [currentIndex, onIndexChange, onPrev])

  /* ---- Reset everything when the story (or the author) changes ---- */
  useEffect(() => {
    if (!story?._id) return
    setProgress(0)
    setReaction(reactionOf(story, user?._id))
    setIsSaved(false)
    setShowReply(false)
    setReplyText('')
    setViewerList([])
    setIsPaused(false)
    startTimeRef.current = Date.now()
  }, [story?._id, user?._id])

  /* ---- Mark as viewed once per story ---- */
  useEffect(() => {
    if (!story?._id || own) return
    viewStory?.(story._id, user?._id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?._id])

  /* ---- Progress ticker ---- */
  useEffect(() => {
    if (!story?._id || isPaused || showViewers) return undefined

    const startedAt = startTimeRef.current
    const offset = (progress / 100) * duration

    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt + offset
      const next = Math.min((elapsed / duration) * 100, 100)
      setProgress(next)
      if (next >= 100) {
        clearInterval(interval)
        goNext()
      }
    }, 50)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?._id, currentIndex, isPaused, showViewers, duration])

  useEffect(() => {
    startTimeRef.current = Date.now()
    setProgress(0)
  }, [currentIndex, story?._id])

  /* ---- Keyboard shortcuts ---- */
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
      if (event.key === 'ArrowRight') goNext()
      if (event.key === 'ArrowLeft') goPrev()
      if (event.key === ' ') setIsPaused((value) => !value)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, goNext, goPrev])

  /* ---- Video playback follows the paused state ---- */
  useEffect(() => {
    if (!videoRef.current) return
    if (isPaused) videoRef.current.pause()
    else videoRef.current.play().catch(() => {})
    videoRef.current.muted = isMuted
  }, [isPaused, isMuted, currentIndex, isVideo])

  const toggleReaction = async () => {
    if (!story?._id) return
    const next = reaction === '❤️' ? null : '❤️'

    // Optimistic — only this story is affected
    setReaction(next)
    try {
      await reactToStory?.(story._id, next, user?._id)
    } catch {
      setReaction(reaction)
      toast.error('Could not update reaction')
    }
  }

  const handleReply = async () => {
    const text = replyText.trim()
    if (!text || sendingReply) return

    setSendingReply(true)
    try {
      await api.post(`/stories/${story._id}/reply`, { text })
      toast.success('Reply sent')
      setReplyText('')
      setShowReply(false)
    } catch {
      toast.error('Could not send reply')
    } finally {
      setSendingReply(false)
    }
  }

  const handleSave = async () => {
    if (!allowSaving) {
      toast.error('Saving is disabled for this story')
      return
    }

    try {
      await api.post(`/stories/${story._id}/save`, { mediaIndex: currentIndex })
      setIsSaved(true)

      if (currentItem?.url) {
        const link = document.createElement('a')
        link.href = currentItem.url
        link.target = '_blank'
        link.rel = 'noopener'
        link.download = `story-${story._id}-${currentIndex}.${isVideo ? 'mp4' : 'jpg'}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch {
      toast.error('Could not save this story')
    }
  }

  const handleShare = async () => {
    if (!allowSharing) {
      toast.error('Sharing is disabled for this story')
      return
    }
    try {
      if (navigator.share && currentItem?.url) {
        await navigator.share({ title: 'GBChat story', url: currentItem.url })
      } else if (currentItem?.url) {
        await navigator.clipboard.writeText(currentItem.url)
        toast.success('Link copied')
      }
    } catch {
      /* user cancelled */
    }
  }

  const openViewers = async () => {
    setShowViewers(true)
    setIsPaused(true)
    try {
      const { data } = await api.get(`/stories/${story._id}/viewers`)
      const list = Array.isArray(data) ? data : data.viewers || []
      setViewerList(
        list.map((entry) => ({
          _id: entry?._id || entry?.user?._id,
          user: typeof entry?.user === 'object' ? entry.user : { _id: entry?.user },
          viewedAt: entry?.viewedAt || entry?.at,
          reaction: entry?.reaction,
        }))
      )
    } catch {
      setViewerList([])
    }
  }

  const handleSurfaceClick = (event) => {
    if (showViewers) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - bounds.left

    if (x < bounds.width * 0.28) goPrev()
    else if (x > bounds.width * 0.72) goNext()
    else setIsPaused((value) => !value)
  }

  // Nothing to render — keep hooks above this guard
  if (!story || !media.length) return null

  const owner = storyOwner(story)

  return (
    <div className="fixed inset-0 z-[120] bg-black" role="dialog" aria-modal="true" aria-label="Story viewer">
      <div className="relative h-full w-full flex items-center justify-center" onClick={handleSurfaceClick}>
        {/* Media */}
        {isVideo ? (
          <video
            ref={videoRef}
            key={`${story._id}-${currentIndex}`}
            src={currentItem?.url}
            className="max-h-full max-w-full object-contain"
            autoPlay
            muted={isMuted}
            playsInline
            loop={false}
            onEnded={goNext}
          />
        ) : (
          <img
            key={`${story._id}-${currentIndex}`}
            src={currentItem?.url}
            alt={currentItem?.caption || 'Story'}
            className="max-h-full max-w-full object-contain"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70 pointer-events-none" />

        {/* Progress */}
        <div className="absolute top-0 inset-x-0 pt-2 px-2 flex gap-1">
          {media.map((_, index) => (
            <div key={index} className="flex-1 h-[3px] bg-white/25 rounded-full overflow-hidden">
              <div
                className="h-full bg-white"
                style={{
                  width:
                    index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%',
                  transition: index === currentIndex ? 'width 60ms linear' : 'none',
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-4 inset-x-0 px-3 sm:px-4 flex items-center justify-between gap-2 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              src={owner?.avatar}
              alt={owner?.fullName || owner?.name || 'User'}
              size="sm"
              className="ring-2 ring-white/40"
            />
            <div className="min-w-0">
              <p className="text-white font-medium text-sm truncate">
                {own ? 'Your story' : owner?.fullName || owner?.name || 'Unknown user'}
              </p>
              <p className="text-white/70 text-xs">
                {currentItem?.createdAt || story.createdAt
                  ? formatDistanceToNow(new Date(currentItem?.createdAt || story.createdAt), {
                      addSuffix: true,
                    })
                  : 'Just now'}
                {` · ${currentIndex + 1}/${media.length}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(event) => {
                event.stopPropagation()
                setIsPaused((value) => !value)
              }}
              aria-label={isPaused ? 'Play' : 'Pause'}
              className="p-2 rounded-full text-white hover:bg-white/15"
            >
              {isPaused ? <PlayIcon className="w-5 h-5" /> : <PauseIcon className="w-5 h-5" />}
            </button>

            {isVideo && (
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  setIsMuted((value) => !value)
                }}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="p-2 rounded-full text-white hover:bg-white/15"
              >
                {isMuted ? <SpeakerXMarkIcon className="w-5 h-5" /> : <SpeakerWaveIcon className="w-5 h-5" />}
              </button>
            )}

            <button
              onClick={(event) => {
                event.stopPropagation()
                onClose?.()
              }}
              aria-label="Close story"
              className="p-2 rounded-full text-white hover:bg-white/15"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Caption */}
        {currentItem?.caption && (
          <div className="absolute bottom-32 inset-x-0 px-6">
            <p className="text-white text-center text-sm md:text-base drop-shadow">
              {currentItem.caption}
            </p>
          </div>
        )}

        {/* Bottom actions */}
        <div className="absolute bottom-4 inset-x-0 px-4 z-20">
          <div className="flex flex-col items-center gap-3">
            {own && (
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  openViewers()
                }}
                className="flex items-center gap-2 text-white/85 hover:text-white text-xs font-medium rounded-full bg-black/30 backdrop-blur px-3 py-1.5"
              >
                <EyeIcon className="w-4 h-4" />
                {viewCount} {viewCount === 1 ? 'view' : 'views'}
              </button>
            )}

            {showReply ? (
              <div className="flex items-center gap-2 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={replyText}
                  onChange={(event) => setReplyText(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && handleReply()}
                  placeholder="Reply to this story…"
                  className="flex-1 px-4 py-3 bg-white/10 backdrop-blur rounded-full text-white placeholder-white/50 border border-white/20 focus:outline-none focus:bg-white/20"
                  autoFocus
                />
                <button
                  onClick={handleReply}
                  disabled={sendingReply || !replyText.trim()}
                  className="p-3 bg-primary-500 hover:bg-primary-600 rounded-full disabled:opacity-50"
                  aria-label="Send reply"
                >
                  <PaperAirplaneIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 w-full max-w-lg">
                {!own && (
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      toggleReaction()
                    }}
                    aria-pressed={reaction === '❤️'}
                    aria-label="Like story"
                    className={clsx(
                      'p-3 rounded-full transition-transform active:scale-90',
                      reaction === '❤️' ? 'bg-white/15' : 'hover:bg-white/10'
                    )}
                  >
                    {reaction === '❤️' ? (
                      <HeartSolidIcon className="w-7 h-7 text-rose-500" />
                    ) : (
                      <HeartIcon className="w-7 h-7 text-white" />
                    )}
                  </button>
                )}

                {allowReplies && !own && (
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      setShowReply(true)
                    }}
                    className="flex-1 px-6 py-3 bg-white/10 backdrop-blur rounded-full text-white font-medium hover:bg-white/20 border border-white/10"
                  >
                    Reply
                  </button>
                )}

                {allowSaving && (
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      handleSave()
                    }}
                    className="p-3 rounded-full text-white hover:bg-white/10"
                    aria-label="Save story"
                  >
                    {isSaved ? (
                      <CheckCircleSolidIcon className="w-7 h-7 text-emerald-400" />
                    ) : (
                      <ArrowDownTrayIcon className="w-7 h-7" />
                    )}
                  </button>
                )}

                {allowSharing && (
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      handleShare()
                    }}
                    className="p-3 rounded-full text-white hover:bg-white/10"
                    aria-label="Share story"
                  >
                    <ShareIcon className="w-7 h-7" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Desktop arrows */}
        <div className="hidden md:flex absolute inset-y-0 inset-x-0 pointer-events-none items-center justify-between px-3">
          <button
            onClick={(event) => {
              event.stopPropagation()
              goPrev()
            }}
            aria-label="Previous story"
            className="pointer-events-auto p-2 rounded-full bg-black/30 text-white hover:bg-black/50"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation()
              goNext()
            }}
            aria-label="Next story"
            className="pointer-events-auto p-2 rounded-full bg-black/30 text-white hover:bg-black/50"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Viewers sheet */}
        <AnimatePresence>
          {showViewers && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="absolute inset-x-0 bottom-0 h-[65vh] bg-white dark:bg-gray-900 rounded-t-3xl z-30 flex flex-col"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto my-3" />
              <div className="px-5 pb-2 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {viewCount} {viewCount === 1 ? 'view' : 'views'}
                </h3>
                <button
                  onClick={() => {
                    setShowViewers(false)
                    setIsPaused(false)
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Close viewers"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 pb-6">
                {viewers.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400">
                    <EyeIcon className="w-10 h-10 opacity-30" />
                    <p className="text-sm">No views yet</p>
                  </div>
                ) : (
                  viewers.map((viewer, index) => (
                    <div
                      key={viewer._id || index}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Avatar
                        src={viewer.user?.avatar}
                        alt={viewer.user?.fullName || viewer.user?.name || 'Viewer'}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {viewer.user?.fullName || viewer.user?.name || 'Someone'}
                        </p>
                        {viewer.viewedAt && (
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(viewer.viewedAt), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                      {viewer.reaction === '❤️' && <HeartSolidIcon className="w-5 h-5 text-rose-500" />}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default StoryViewer
