import { getToken } from '../../lib/token'
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUturnLeftIcon,
  StarIcon,
  ArrowPathIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  FaceSmileIcon,
  ClockIcon,
  BookmarkIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import Tooltip from '../common/Tooltip'
import Modal from '../common/Modal'
import Avatar from '../common/Avatar'
import api from '../../lib/api'
import clsx from 'clsx'
import axios from 'axios'
import toast from 'react-hot-toast'

/**
 * Message action bar.
 *
 * Round 11: three buttons were wired to empty arrow functions — Forward and
 * Delete did nothing at all, and Pin/Star fired the same POST every time with
 * no way back (there was no unpin call and `starred` was never read from the
 * server). All four now talk to real endpoints:
 *
 *   POST /api/gb-features/pin      + /unpin
 *   POST /api/gb-features/star     + /unstar
 *   POST /api/messages/:id/forward  { chatIds: [] }
 *   DELETE /api/messages/:id       { forEveryone }
 */
const MessageActions = ({ message, isMine, onReply, onReact, className, chatId, onSchedule, onDeleted }) => {
  const [isStarring, setIsStarring] = useState(false)
  const [isPinning, setIsPinning] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isStarred, setIsStarred] = useState(Boolean(message.isStarred))
  const [isPinned, setIsPinned] = useState(Boolean(message.isPinned))
  const [showForward, setShowForward] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const messageId = message._id || message.id
  const targetChatId = chatId || message.chat?._id || message.chat

  // A message list can be re-rendered with fresh server data; keep local toggles
  // from drifting away from it.
  useEffect(() => {
    setIsStarred(Boolean(message.isStarred))
    setIsPinned(Boolean(message.isPinned))
  }, [message.isStarred, message.isPinned])

  const gbFeature = async (action, body) => {
    const token = getToken()
    await axios.post(`/api/gb-features/${action}`, body, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  }

  const handleStar = async () => {
    const next = !isStarred
    try {
      setIsStarring(true)
      await gbFeature(next ? 'star' : 'unstar', { messageId, chatId: targetChatId })
      setIsStarred(next)
      toast.success(next ? 'Message starred' : 'Message unstarred')
    } catch (error) {
      toast.error(
        error?.response?.data?.message || `Failed to ${next ? 'star' : 'unstar'} message`
      )
    } finally {
      setIsStarring(false)
    }
  }

  const handlePin = async () => {
    const next = !isPinned
    try {
      setIsPinning(true)
      await gbFeature(next ? 'pin' : 'unpin', { messageId, chatId: targetChatId })
      setIsPinned(next)
      toast.success(next ? 'Message pinned' : 'Message unpinned')
    } catch (error) {
      toast.error(error?.response?.data?.message || `Failed to ${next ? 'pin' : 'unpin'} message`)
    } finally {
      setIsPinning(false)
    }
  }

  const handleCopy = async () => {
    try {
      const contentToCopy = typeof message.content === 'object' && message.content !== null
        ? message.content.text || JSON.stringify(message.content)
        : message.content || ''
      await navigator.clipboard.writeText(contentToCopy)
      toast.success('Message copied')
    } catch (error) {
      toast.error('Failed to copy message')
    }
  }

  const handleSchedule = () => {
    onSchedule?.(message)
  }

  const handleDelete = async (forEveryone) => {
    try {
      setIsDeleting(true)
      await api.delete(`/messages/${messageId}`, { data: { forEveryone } })
      toast.success(forEveryone ? 'Deleted for everyone' : 'Deleted for you')
      setConfirmDelete(false)
      onDeleted?.(messageId, forEveryone)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not delete the message')
    } finally {
      setIsDeleting(false)
    }
  }

  const actions = [
    {
      icon: FaceSmileIcon,
      label: 'React',
      onClick: () => onReact?.(message),
      show: true,
    },
    {
      icon: ArrowUturnLeftIcon,
      label: 'Reply',
      onClick: () => onReply?.(message),
      show: true,
    },
    {
      icon: BookmarkIcon,
      label: isPinned ? 'Unpin' : 'Pin',
      onClick: handlePin,
      show: true,
      loading: isPinning,
      active: isPinned,
    },
    {
      icon: isStarred ? StarSolidIcon : StarIcon,
      label: isStarred ? 'Unstar' : 'Star',
      onClick: handleStar,
      show: true,
      loading: isStarring,
      solid: isStarred,
    },
    {
      icon: ClockIcon,
      label: 'Schedule',
      onClick: handleSchedule,
      show: true,
    },
    {
      icon: DocumentDuplicateIcon,
      label: 'Copy',
      onClick: handleCopy,
      show: message.type === 'text' || typeof message.content === 'string',
    },
    {
      icon: ArrowPathIcon,
      label: 'Forward',
      onClick: () => setShowForward(true),
      show: true,
    },
    {
      icon: TrashIcon,
      label: 'Delete',
      onClick: () => setConfirmDelete(true),
      show: isMine,
      danger: true,
      loading: isDeleting,
    },
  ]

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={clsx(
          'flex items-center gap-1 bg-white dark:bg-gray-800 rounded-full shadow-lg p-1',
          className
        )}
      >
        {actions
          .filter((action) => action.show)
          .map((action, index) => (
            <Tooltip key={index} content={action.label} position="top">
              <button
                type="button"
                onClick={action.onClick}
                disabled={action.loading}
                aria-label={action.label}
                aria-pressed={action.active === undefined ? undefined : action.active}
                className={clsx(
                  'p-2 rounded-full transition-colors',
                  action.danger
                    ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400',
                  action.active && 'text-amber-500 dark:text-amber-400',
                  action.loading && 'opacity-50 cursor-wait'
                )}
              >
                <action.icon className="w-4 h-4" />
              </button>
            </Tooltip>
          ))}
      </motion.div>

      <ForwardModal
        isOpen={showForward}
        onClose={() => setShowForward(false)}
        messageId={messageId}
        currentChatId={targetChatId}
      />

      <Modal isOpen={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete message" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Choose how this message should be removed.
        </p>
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={() => handleDelete(false)}
            disabled={isDeleting}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            Delete for me
            <TrashIcon className="h-4 w-4 text-gray-400" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(true)}
            disabled={isDeleting}
            className="flex w-full items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            Delete for everyone
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </Modal>
    </>
  )
}

const ForwardModal = ({ isOpen, onClose, messageId, currentChatId }) => {
  const [chats, setChats] = useState([])
  const [selected, setSelected] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    setLoading(true)
    api
      .get('/chats')
      .then(({ data }) => {
        if (cancelled) return
        const list = Array.isArray(data?.data) ? data.data : data?.chats || []
        setChats(list.filter((chat) => String(chat._id) !== String(currentChatId)))
      })
      .catch(() => !cancelled && setChats([]))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [isOpen, currentChatId])

  useEffect(() => {
    if (!isOpen) {
      setSelected([])
      setQuery('')
    }
  }, [isOpen])

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const filtered = chats.filter((chat) => {
    if (!query) return true
    const name = chat.name || chat.groupInfo?.name || chat.participants?.[0]?.fullName || ''
    return name.toLowerCase().includes(query.toLowerCase())
  })

  const send = async () => {
    if (!selected.length) return
    try {
      setSending(true)
      await api.post(`/messages/${messageId}/forward`, { chatIds: selected })
      toast.success(`Forwarded to ${selected.length} chat${selected.length === 1 ? '' : 's'}`)
      onClose()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not forward the message')
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Forward message" size="md">
      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search chats"
          className="input w-full pl-9"
        />
      </div>

      <div className="mt-3 max-h-72 space-y-1 overflow-y-auto">
        {loading && <p className="py-8 text-center text-sm text-gray-500">Loading chats…</p>}
        {!loading && filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">No chats to forward to yet.</p>
        )}
        {filtered.map((chat) => {
          const name = chat.name || chat.groupInfo?.name || chat.participants?.[0]?.fullName || 'Chat'
          const avatar = chat.avatar || chat.groupInfo?.avatar || chat.participants?.[0]?.avatar
          const checked = selected.includes(chat._id)
          return (
            <button
              key={chat._id}
              type="button"
              onClick={() => toggle(chat._id)}
              className={clsx(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors',
                checked ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              <Avatar src={avatar} alt={name} size="sm" />
              <span className="flex-1 truncate text-sm font-medium text-gray-800 dark:text-gray-100">{name}</span>
              <span
                className={clsx(
                  'flex h-5 w-5 items-center justify-center rounded-full border',
                  checked
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'border-gray-300 dark:border-gray-600'
                )}
              >
                {checked && <CheckIcon className="h-3.5 w-3.5" />}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs text-gray-500">{selected.length} selected</span>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            <XMarkIcon className="h-4 w-4" />
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!selected.length || sending}
            onClick={send}
          >
            {sending ? 'Forwarding…' : 'Forward'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default MessageActions
