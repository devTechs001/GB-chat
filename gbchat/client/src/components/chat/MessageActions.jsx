import React from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUturnLeftIcon,
  StarIcon,
  ArrowPathIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  FaceSmileIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import Tooltip from '../common/Tooltip'
import clsx from 'clsx'

const MessageActions = ({ message, isMine, onReply, onReact, className }) => {
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
      icon: message.isStarred ? StarSolidIcon : StarIcon,
      label: message.isStarred ? 'Unstar' : 'Star',
      onClick: () => {/* Handle star */},
      show: true,
    },
    {
      icon: DocumentDuplicateIcon,
      label: 'Copy',
      onClick: () => navigator.clipboard.writeText(message.content),
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
              className={clsx(
                'p-2 rounded-full transition-colors',
                action.danger
                  ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
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