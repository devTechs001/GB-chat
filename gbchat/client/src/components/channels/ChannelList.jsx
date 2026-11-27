import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CheckBadgeIcon, HashtagIcon } from '@heroicons/react/24/outline'
import Avatar from '../common/Avatar'
import { formatNumber } from '../../lib/formatters'
import clsx from 'clsx'

/**
 * ChannelList — the inline list rendering of channels.
 *
 * `ChannelsPage` uses `ChannelCard` for its grid, which is the right choice on
 * a browse screen but wrong in a narrow column (side panel, search results,
 * "my subscriptions" strip): the card wastes the whole width on a cover image.
 * This is the dense row variant.
 *
 * It was a zero-byte file; nothing imported it, so the gap never surfaced.
 */
const ChannelList = ({
  channels = [],
  activeId = null,
  loading = false,
  onSelect,
  emptyLabel = 'No channels yet',
  className,
}) => {
  const navigate = useNavigate()

  const open = (channel) => {
    if (onSelect) return onSelect(channel)
    return navigate(`/channels/${channel._id}`)
  }

  if (loading) {
    return (
      <ul className={clsx('space-y-1', className)} aria-busy="true">
        {[...Array(4)].map((_, index) => (
          <li key={index} className="flex items-center gap-3 rounded-xl px-3 py-2">
            <span className="skeleton h-10 w-10 rounded-full" />
            <span className="flex-1 space-y-1.5">
              <span className="skeleton block h-3 w-2/3 rounded" />
              <span className="skeleton block h-2.5 w-1/3 rounded" />
            </span>
          </li>
        ))}
      </ul>
    )
  }

  if (!channels.length) {
    return (
      <p className={clsx('px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400', className)}>
        {emptyLabel}
      </p>
    )
  }

  return (
    <ul className={clsx('space-y-0.5', className)} role="list">
      {channels.map((channel, index) => {
        const selected = String(activeId) === String(channel._id)
        return (
          <motion.li
            key={channel._id || channel.username || index}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index, 8) * 0.02 }}
          >
            <button
              type="button"
              onClick={() => open(channel)}
              aria-current={selected ? 'true' : undefined}
              className={clsx(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors',
                selected
                  ? 'bg-primary-50 text-primary-900 dark:bg-primary-900/20 dark:text-primary-100'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/70'
              )}
            >
              <Avatar src={channel.avatar} alt={channel.name || channel.username} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1">
                  <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {channel.name || channel.username}
                  </span>
                  {channel.verified && (
                    <CheckBadgeIcon
                      className="h-3.5 w-3.5 shrink-0 text-primary-500"
                      aria-label="Verified channel"
                      title="Verified channel"
                    />
                  )}
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <HashtagIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{channel.username || 'channel'}</span>
                  {typeof channel.subscriberCount === 'number' && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{formatNumber(channel.subscriberCount)}</span>
                    </>
                  )}
                </span>
              </span>
              {channel.isSubscribed && (
                <span className="shrink-0 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                  Joined
                </span>
              )}
            </button>
          </motion.li>
        )
      })}
    </ul>
  )
}

export default ChannelList
