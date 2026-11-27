import React from 'react'
import { motion } from 'framer-motion'
import Avatar from '../common/Avatar'
import clsx from 'clsx'

/**
 * StoryRing — one circular avatar with the "has a story" gradient ring.
 *
 * `StoryCardEnhanced` is the tile used by the stories grid; this is the small,
 * circular variant used in rails (the chat list header, the home welcome
 * screen, notification rows). It was a zero-byte file, so any such use would
 * have failed to build.
 *
 * Visual state is derived from the data, not from props the caller must
 * remember to pass:
 *   - no story            → plain avatar, muted ring
 *   - unseen story        → gradient ring, bold label
 *   - all seen            → grey ring, muted label (story still openable)
 */
const StoryRing = ({
  story,
  name,
  avatar,
  size = 'md',
  seen = false,
  isOwn = false,
  onClick,
  label,
  className,
}) => {
  const owner = story?.user || story?.userId || {}
  const displayName = label || name || owner.fullName || owner.name || 'Story'
  const displayAvatar = avatar || owner.avatar || null

  // `story` may be a single story or an author group ({ stories: [...] }).
  const hasStory = Boolean(story) && !seen

  const ringClass = isOwn
    ? 'from-gray-300 via-gray-300 to-gray-400 dark:from-gray-600 dark:via-gray-600 dark:to-gray-500'
    : seen
      ? 'from-gray-300 via-gray-300 to-gray-400 dark:from-gray-700 dark:via-gray-700 dark:to-gray-600'
      : 'from-amber-400 via-rose-500 to-purple-600'

  const Content = (
    <>
      <span
        className={clsx(
          'block rounded-full bg-gradient-to-tr p-[2px] transition-transform group-hover:scale-105',
          hasStory ? ringClass : 'from-transparent to-transparent'
        )}
      >
        <span className="block rounded-full bg-gray-50 p-[2px] dark:bg-gray-950">
          <Avatar src={displayAvatar} alt={displayName} size={size} />
        </span>
      </span>
      {isOwn && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-950">
          +
        </span>
      )}
    </>
  )

  const shared = clsx(
    'group relative flex flex-none flex-col items-center gap-1 outline-none',
    'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-xl',
    className
  )

  if (!onClick) {
    return (
      <div className={shared}>
        <span className="relative">{Content}</span>
        <span className="w-full truncate text-center text-[10px] text-gray-600 dark:text-gray-400">
          {isOwn ? 'You' : displayName.split(' ')[0]}
        </span>
      </div>
    )
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      aria-label={isOwn ? 'Add to your story' : `${displayName}'s story${seen ? ' (seen)' : ''}`}
      className={shared}
    >
      <span className="relative">{Content}</span>
      <span
        className={clsx(
          'w-full truncate text-center text-[10px]',
          seen ? 'text-gray-500 dark:text-gray-400' : 'font-medium text-gray-700 dark:text-gray-200'
        )}
      >
        {isOwn ? 'You' : displayName.split(' ')[0]}
      </span>
    </motion.button>
  )
}

export default StoryRing
