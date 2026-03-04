import React, { useState } from 'react'
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
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import Tooltip from '../common/Tooltip'
import clsx from 'clsx'
import axios from 'axios'
import toast from 'react-hot-toast'

const MessageActions = ({ message, isMine, onReply, onReact, className, chatId, onSchedule }) => {
  const [isStarring, setIsStarring] = useState(false)
  const [isPinning, setIsPinning] = useState(false)

  const handleStar = async () => {
    try {
      setIsStarring(true)
      const token = localStorage.getItem('token')
      await axios.post(
        '/api/gb-features/star',
        { messageId: message._id, chatId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(message.isStarred ? 'Message unstarred' : 'Message starred')
    } catch (error) {
      toast.error('Failed to star message')
    } finally {
      setIsStarring(false)
    }
  }

  const handlePin = async () => {
    try {
      setIsPinning(true)
      const token = localStorage.getItem('token')
      await axios.post(
        '/api/gb-features/pin',
        { messageId: message._id, chatId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Message pinned')
    } catch (error) {
      toast.error('Failed to pin message')
    } finally {
      setIsPinning(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      toast.success('Message copied')
    } catch (error) {
      toast.error('Failed to copy message')
    }
  }

  const handleSchedule = () => {
    onSchedule?.(message)
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
      label: 'Pin',
      onClick: handlePin,
      show: true,
      loading: isPinning,
    },
    {
      icon: message.isStarred ? StarSolidIcon : StarIcon,
      label: message.isStarred ? 'Unstar' : 'Star',
      onClick: handleStar,
      show: true,
      loading: isStarring,
      solid: message.isStarred,
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
      show: message.type === 'text',
    },
    {
      icon: ArrowPathIcon,
      label: 'Forward',
      onClick: () => {/* Handle forward */},
      show: true,
    },
    {
      icon: TrashIcon,
      label: 'Delete',
      onClick: () => {/* Handle delete */},
      show: isMine,
      danger: true,
    },
  ]

  return (
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
              onClick={action.onClick}
              disabled={action.loading}
              className={clsx(
                'p-2 rounded-full transition-colors',
                action.danger
                  ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400',
                action.loading && 'opacity-50 cursor-wait'
              )}
            >
              <action.icon className="w-4 h-4" />
            </button>
          </Tooltip>
        ))}
    </motion.div>
  )
}

export default MessageActions