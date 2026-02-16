import React from 'react'
import { motion } from 'framer-motion'
import Avatar from '../common/Avatar'

const TypingIndicator = ({ users }) => {
  if (!users || users.length === 0) return null

  const userName = users[0]?.name || 'Someone'
  const moreCount = users.length - 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-2 px-4 py-2"
    >
      <Avatar src={users[0]?.avatar} alt={userName} size="xs" />
      <div className="flex items-center gap-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-2xl">
        <motion.div
          className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
        />
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {userName}
        {moreCount > 0 && ` and ${moreCount} other${moreCount > 1 ? 's' : ''}`} typing...
      </span>
    </motion.div>
  )
}

export default TypingIndicator