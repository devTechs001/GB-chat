import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
  ArrowLeftIcon,
  BellIcon,
  BellSlashIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  HeartIcon as HeartOutlineIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  ShareIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import Avatar from '../common/Avatar'
import Button from '../common/Button'
import EmptyState from '../layout/EmptyState'
import api from '../../lib/api'
import { formatNumber } from '../../lib/formatters'
import toast from 'react-hot-toast'

/**
 * ChannelDetail — the page behind `/channels/:channelId`.
 *
 * (The old ChannelCard linked to this URL while no such route existed, so the
 * click just landed on the catch-all 404.)
 *
 * Shows the channel header, a post composer for owners/admins, and the feed
 * with real like counts. Falls back to the channel passed by the list so the
 * header paints before the request resolves.
 */
const ChannelDetail = ({ channelId, initialChannel }) => {
  const navigate = useNavigate()
  const [channel, setChannel] = useState(initialChannel || null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [draft, setDraft] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  const fetchChannel = useCallback(async () => {
    try {
      const { data } = await api.get(`/channels/${channelId}`)
      const payload = data?.channel || data
      if (payload && (payload._id || payload.name)) setChannel(payload)
    } catch {
      /* keep the optimistic copy from the list */
    }
  }, [channelId])

  const fetchPosts = useCallback(async () => {
    try {
      const { data } = await api.get(`/channels/${channelId}/posts`)
      setPosts(Array.isArray(data?.posts) ? data.posts : Array.isArray(data) ? data : [])
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [channelId])

  useEffect(() => {
    if (!channelId) return
    setLoading(true)
    fetchChannel()
    fetchPosts()
  }, [channelId, fetchChannel, fetchPosts])

  const subscribe = async () => {
    if (!channel) return
    setSubscribing(true)
    const subscribed = !channel.isSubscribed
    const delta = subscribed ? 1 : -1
    setChannel((prev) => ({
      ...prev,
      isSubscribed: subscribed,
      subscriberCount: Math.max(0, (prev.subscriberCount || 0) + delta),
    }))
    try {
      if (subscribed) await api.post(`/channels/${channelId}/subscribe`)
      else await api.post(`/channels/${channelId}/unsubscribe`)
      toast.success(subscribed ? 'Subscribed' : 'Unsubscribed')
    } catch {
      setChannel((prev) => ({
        ...prev,
        isSubscribed: !subscribed,
        subscriberCount: Math.max(0, (prev.subscriberCount || 0) - delta),
      }))
      toast.error('Could not update your subscription')
    } finally {
      setSubscribing(false)
    }
  }

  const publish = async () => {
    const text = draft.trim()
    if (!text) return
    setPosting(true)
    try {
      const body = new FormData()
      body.append('text', text)
      const { data } = await api.post(`/channels/${channelId}/posts`, body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const created = data?.post || data
      if (created && created._id) setPosts((prev) => [created, ...prev])
      else fetchPosts()
      setDraft('')
      toast.success('Posted to the channel')
    } catch {
      toast.error('Could not publish this post')
    } finally {
      setPosting(false)
    }
  }

  const toggleLike = async (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post._id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likeCount: Math.max(0, (post.likeCount || 0) + (post.isLiked ? -1 : 1)),
            }
          : post
      )
    )
    try {
      await api.post(`/channels/posts/${postId}/like`)
    } catch {
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likeCount: Math.max(0, (post.likeCount || 0) + (post.isLiked ? -1 : 1)),
              }
            : post
        )
      )
    }
  }

  const share = async () => {
    const url = `${window.location.origin}/channels/${channelId}`
    try {
      if (navigator.share) {
        await navigator.share({ title: channel?.name || 'Channel', url })
        return
      }
      await navigator.clipboard.writeText(url)
      toast.success('Channel link copied')
    } catch {
      toast.error('Sharing is not available in this browser')
    }
  }

  const isOwner = Boolean(channel?.isOwner || channel?.isAdmin || channel?.ownerId === channel?.userId)

  return (
    <div className="flex h-full min-h-0 flex-col bg-gray-50 dark:bg-gray-950">
      <div className="flex items-center gap-2 border-b border-gray-200/70 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900">
        <button
          onClick={() => navigate('/channels')}
          aria-label="Back to channels"
          className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {channel?.name || 'Channel'}
          </p>
          <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
            {channel?.username ? `@${channel.username}` : 'Channel'}
          </p>
        </div>
        <button
          onClick={share}
          aria-label="Share channel"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ShareIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="relative">
          <div className="h-28 w-full bg-gradient-to-r from-primary-600 via-primary-500 to-emerald-500" />
          <div className="px-4 pb-4">
            <div className="-mt-10 flex items-end gap-3">
              <div className="rounded-2xl border-4 border-gray-50 dark:border-gray-950">
                <Avatar src={channel?.avatar} alt={channel?.name} size="xl" />
              </div>
              <div className="flex-1" />
              <Button
                size="sm"
                variant={channel?.isSubscribed ? 'secondary' : 'primary'}
                loading={subscribing}
                icon={
                  channel?.isSubscribed ? (
                    <BellSlashIcon className="h-4 w-4" />
                  ) : (
                    <BellIcon className="h-4 w-4" />
                  )
                }
                onClick={subscribe}
              >
                {channel?.isSubscribed ? 'Subscribed' : 'Subscribe'}
              </Button>
            </div>

            <h1 className="mt-3 flex items-center gap-1.5 text-lg font-bold text-gray-900 dark:text-white">
              {channel?.name || 'Channel'}
              {channel?.verified && <SparklesIcon className="h-4 w-4 text-primary-500" />}
            </h1>
            {channel?.description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{channel.description}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="inline-flex items-center gap-1">
                <UserGroupIcon className="h-4 w-4" />
                {formatNumber(channel?.subscriberCount || 0)} subscribers
              </span>
              {channel?.postCount ? <span>{formatNumber(channel.postCount)} posts</span> : null}
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="mx-4 mb-3 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
            <textarea
              rows={3}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Share an update with your subscribers…"
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => toast('Media uploads land with the composer update')}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <PhotoIcon className="h-4 w-4" />
                Media
              </button>
              <Button
                size="sm"
                variant="primary"
                loading={posting}
                disabled={!draft.trim()}
                icon={<PaperAirplaneIcon className="h-4 w-4" />}
                onClick={publish}
              >
                Post
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3 px-4 pb-8">
          {loading ? (
            [...Array(3)].map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
            ))
          ) : posts.length === 0 ? (
            <EmptyState
              icon={ChatBubbleLeftIcon}
              title="No posts yet"
              description={isOwner ? 'Publish your first update above.' : 'This channel has not posted anything yet.'}
            />
          ) : (
            posts.map((post) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-start gap-3">
                  <Avatar src={channel?.avatar} alt={channel?.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {channel?.name || 'Channel'}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {post.createdAt
                        ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
                        : ''}
                    </p>
                  </div>
                </div>

                {post.text && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
                    {post.text}
                  </p>
                )}

                {post.mediaUrl && (
                  <img
                    src={post.mediaUrl}
                    alt=""
                    loading="lazy"
                    className="mt-2 max-h-80 w-full rounded-xl object-cover"
                  />
                )}

                <div className="mt-3 flex items-center gap-5 text-gray-500 dark:text-gray-400">
                  <button
                    onClick={() => toggleLike(post._id)}
                    className="flex items-center gap-1.5 text-sm transition hover:text-rose-500"
                    aria-pressed={Boolean(post.isLiked)}
                  >
                    {post.isLiked ? (
                      <HeartSolidIcon className="h-5 w-5 text-rose-500" />
                    ) : (
                      <HeartOutlineIcon className="h-5 w-5" />
                    )}
                    {formatNumber(post.likeCount || 0)}
                  </button>
                  <span className="flex items-center gap-1.5 text-sm">
                    <ChatBubbleLeftIcon className="h-5 w-5" />
                    {formatNumber(post.commentCount || 0)}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm">
                    <EyeIcon className="h-5 w-5" />
                    {formatNumber(post.viewCount || 0)}
                  </span>
                </div>
              </motion.article>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ChannelDetail
