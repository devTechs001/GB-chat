import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusIcon } from '@heroicons/react/24/outline'
import EmojiPicker from '../common/EmojiPicker'
import Avatar from '../common/Avatar'
import clsx from 'clsx'

const MessageReactions = ({ reactions = [], messageId, onReact, className }) => {
  const [showPicker, setShowPicker] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = []
    }
    acc[reaction.emoji].push(reaction)
    return acc
  }, {})

  const handleReact = (emoji) => {
    onReact?.(messageId, emoji)
    setShowPicker(false)
  }

  if (reactions.length === 0 && !showPicker) return null

  return (
    <div className={clsx('flex items-center gap-1', className)}>
      <AnimatePresence>
        {Object.entries(groupedReactions).map(([emoji, users]) => (
          <motion.button
            key={emoji}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setShowDetails(true)}
            className={clsx(
              'flex items-center gap-1 px-2 py-1 rounded-full text-sm',
              'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
              'hover:border-primary-500 dark:hover:border-primary-500',
              'transition-colors'
            )}
          >
            <span>{emoji}</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {users.length}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>

      {/* Add Reaction Button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className={clsx(
            'p-1 rounded-full transition-colors',
            'hover:bg-gray-100 dark:hover:bg-gray-700',
            'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          )}
        >
          <PlusIcon className="w-4 h-4" />
        </button>

        {showPicker && (
          <EmojiPicker
            onSelect={handleReact}
            onClose={() => setShowPicker(false)}
            position="top"
          />
        )}
      </div>

      {/* Reaction Details Modal */}
      {showDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowDetails(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-sm w-full mx-4"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Reactions
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Object.entries(groupedReactions).map(([emoji, users]) => (
                <div key={emoji}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {users.length}
                    </span>
                  </div>
                  <div className="ml-10 space-y-2">
                    {users.map((user) => (
                      <div key={user._id} className="flex items-center gap-2">
                        <Avatar src={user.avatar} alt={user.name} size="xs" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {user.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default MessageReactions