import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  UserPlusIcon,
  StarIcon,
  BookmarkIcon,
  ClockIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

const actions = [
  {
    id: 'new-chat',
    label: 'New Chat',
    icon: ChatBubbleLeftRightIcon,
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    id: 'new-group',
    label: 'New Group',
    icon: UserGroupIcon,
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    id: 'add-contact',
    label: 'Add Contact',
    icon: UserPlusIcon,
    color: 'bg-purple-500 hover:bg-purple-600',
  },
  {
    id: 'starred-messages',
    label: 'Starred Messages',
    icon: StarIcon,
    color: 'bg-yellow-500 hover:bg-yellow-600',
  },
  {
    id: 'pinned-messages',
    label: 'Pinned Messages',
    icon: BookmarkIcon,
    color: 'bg-indigo-500 hover:bg-indigo-600',
  },
  {
    id: 'scheduled-messages',
    label: 'Scheduled',
    icon: ClockIcon,
    color: 'bg-pink-500 hover:bg-pink-600',
  },
  {
    id: 'gb-features',
    label: 'GB Features',
    icon: SparklesIcon,
    color: 'bg-gradient-to-r from-green-500 to-teal-500',
  },
]

const FeatureFAB = ({ onAction }) => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleAction = (actionId) => {
    if (actionId === 'gb-features') {
      navigate('/settings?section=gb-features')
    } else {
      onAction?.(actionId)
    }
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40">
      <AnimatePresence>
        {isOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col-reverse gap-2">
            {actions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleAction(action.id)}
                className={`${action.color} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 whitespace-nowrap transition-colors`}
              >
                <action.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{action.label}</span>
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <PlusIcon className="w-7 h-7" />
        </motion.div>
      </motion.button>
    </div>
  )
}

export default FeatureFAB
