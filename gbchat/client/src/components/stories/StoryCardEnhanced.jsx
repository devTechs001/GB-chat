import React from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, HeartIcon, PlayIcon, EyeIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import Avatar from '../common/Avatar'
import clsx from 'clsx'

/**
 * StoryCard — the portrait tile used by the stories grid.
 *
 * Round 12 rewrite. The old card was a fixed `w-16 h-20` thumbnail dropped into
 * a `grid-cols-2…6` layout: the cell was 200 px wide, the media 64 px, and the
 * author name was clipped to `max-w-[80px]`. On desktop that read as a row of
 * tiny stamps with unreadable labels.
 *
 * Now the tile **fills its cell** (`aspect-[9/16]`, `w-full`), the media is the
 * card, and the author/time sit in a readable gradient footer. The ring/badges
 * keep their meaning:
 *   gradient ring  → unseen
 *   grey ring      → seen
 *   purple ring    → highlight
 *   star           → close friend
 */
const mediaOf = (story) => {
  const first = (story.media || [])[0] || {}
  return {
    src: first.thumbnail || first.url || story.thumbnail || null,
    isVideo: first.type === 'video' || story.type === 'video',
    count: (story.media || []).length,
  }
}

const StoryCard = ({
  story,
  onClick,
  isOwn = false,
  isCloseFriend = false,
  isHighlight = false,
  className,
}) => {
  const owner = story?.user || story?.userId || {}
  const authorName = isOwn ? 'Your story' : owner.fullName || owner.name || 'GBChat user'

  const viewerIds = [
    ...(story?.viewedBy || []),
    ...(story?.viewers || []).map((entry) => entry?.user?._id || entry?.user || entry),
  ]
    .filter(Boolean)
    .map(String)

  const hasUnviewed = story?.currentUserId
    ? !viewerIds.includes(String(story.currentUserId))
    : true

  const { src, isVideo, count } = mediaOf(story)
  const viewCount = story?.viewCount ?? viewerIds.length
  const hasReaction = Boolean(story?.myReaction || story?.isLiked)

  const ringClass = isHighlight
    ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-950'
    : hasUnviewed && !isOwn
      ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-950'
      : 'ring-1 ring-gray-200 ring-offset-1 ring-offset-white dark:ring-gray-800 dark:ring-offset-gray-950'

  return (
    <motion.button
      type="button"
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      aria-label={`${authorName}${hasUnviewed ? ' — new' : ''}`}
      className={clsx(
        'group relative block w-full overflow-hidden rounded-2xl text-left',
        'aspect-[9/16] shadow-sm transition-shadow hover:shadow-xl hover:shadow-black/10',
        ringClass,
        className
      )}
    >
      {/* Media */}
      {src ? (
        <img
          src={src}
          alt={authorName}
          loading="lazy"
          decoding="async"
          className={clsx(
            'absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]',
            !hasUnviewed && !isOwn && 'saturate-[0.85]'
          )}
        />
      ) : (
        <span className="absolute inset-0 bg-gradient-to-br from-primary-500 via-violet-500 to-rose-500" />
      )}

      {/* Readability scrim: strong at top (badges) and bottom (label). */}
      <span className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/75" />

      {/* Top row: avatar + badges */}
      <span className="absolute inset-x-0 top-0 flex items-start justify-between gap-1 p-2">
        <span className="flex items-center gap-1.5">
          <Avatar src={owner.avatar} alt={authorName} size="xs" className="ring-2 ring-white/80" />
          {isCloseFriend && (
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 shadow"
              title="Close friend"
            >
              <StarSolidIcon className="h-3 w-3 text-white" />
            </span>
          )}
        </span>
        <span className="flex flex-col items-end gap-1">
          {count > 1 && (
            <span className="rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
              {count}
            </span>
          )}
          {isOwn && viewCount > 0 && (
            <span className="flex items-center gap-0.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
              <EyeIcon className="h-3 w-3" />
              {viewCount}
            </span>
          )}
          {hasUnviewed && !isOwn && (
            <span className="h-2 w-2 rounded-full bg-primary-400 ring-2 ring-white/60" />
          )}
        </span>
      </span>

      {/* Video play affordance */}
      {isVideo && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm transition-transform group-hover:scale-110">
            <PlayIcon className="ml-0.5 h-5 w-5 text-white" />
          </span>
        </span>
      )}

      {/* Bottom label */}
      <span className="absolute inset-x-0 bottom-0 p-2.5">
        <span className="block truncate text-[13px] font-semibold leading-tight text-white drop-shadow">
          {authorName}
        </span>
        <span className="mt-0.5 flex items-center gap-1 text-[11px] text-white/75">
          {story?.createdAt
            ? new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Just now'}
          {hasReaction && <HeartSolidIcon className="ml-auto h-3.5 w-3.5 text-rose-400" />}
          {!hasReaction && story?.reactionCount > 0 && (
            <span className="ml-auto flex items-center gap-0.5">
              <HeartIcon className="h-3.5 w-3.5" />
              {story.reactionCount}
            </span>
          )}
        </span>
      </span>

      {/* Add-more affordance for your own story */}
      {isOwn && (
        <span className="absolute bottom-2.5 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-primary-600 shadow-lg transition-transform group-hover:scale-110">
          <PlusIcon className="h-4 w-4" />
        </span>
      )}

      {/* Highlight marker */}
      {isHighlight && (
        <span className="absolute left-2 top-12 rounded-full bg-violet-600/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
          Highlight
        </span>
      )}
    </motion.button>
  )
}

export default StoryCard
