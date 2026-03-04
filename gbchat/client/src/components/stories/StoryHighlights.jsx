/**
 * StoryHighlights Component
 * Features:
 * - Save stories as highlights
 * - Custom highlight covers
 * - Highlight categories
 * - Edit and reorder highlights
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon, 
  PencilIcon, 
  StarIcon,
  HeartIcon,
  CameraIcon,
  TrashIcon 
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import Avatar from '../common/Avatar'
import Button from '../common/Button'
import Modal from '../common/Modal'
import clsx from 'clsx'

const StoryHighlights = ({ highlights = [], onAddHighlight, onEditHighlight, onDeleteHighlight }) => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedHighlight, setSelectedHighlight] = useState(null)

  const defaultHighlightCategories = [
    { id: 'travel', name: 'Travel', icon: '✈️', color: 'from-blue-400 to-blue-600' },
    { id: 'food', name: 'Food', icon: '🍕', color: 'from-orange-400 to-orange-600' },
    { id: 'friends', name: 'Friends', icon: '👥', color: 'from-green-400 to-green-600' },
    { id: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦', color: 'from-purple-400 to-purple-600' },
    { id: 'work', name: 'Work', icon: '💼', color: 'from-gray-400 to-gray-600' },
    { id: 'fitness', name: 'Fitness', icon: '💪', color: 'from-red-400 to-red-600' },
    { id: 'music', name: 'Music', icon: '🎵', color: 'from-pink-400 to-pink-600' },
    { id: 'memories', name: 'Memories', icon: '💫', color: 'from-yellow-400 to-yellow-600' },
  ]

  return (
    <>
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <StarSolidIcon className="w-5 h-5 text-yellow-500" />
            Highlights
          </h2>
          <Button
            variant="primary"
            size="sm"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            Add Highlight
          </Button>
        </div>

        {/* Highlights Grid */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {highlights.map((highlight, index) => (
            <HighlightCard
              key={highlight._id || index}
              highlight={highlight}
              onClick={() => setSelectedHighlight(highlight)}
              onEdit={() => onEditHighlight?.(highlight)}
              onDelete={() => onDeleteHighlight?.(highlight)}
            />
          ))}

          {/* Add Highlight Placeholder */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="flex-shrink-0 flex flex-col items-center gap-2"
          >
            <div className="w-16 h-20 md:w-20 md:h-24 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800/50">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <PlusIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">New</span>
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Add</span>
          </motion.button>
        </div>
      </div>

      {/* Create/Edit Highlight Modal */}
      {showCreateModal && (
        <CreateHighlightModal
          categories={defaultHighlightCategories}
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => {
            onAddHighlight?.(data)
            setShowCreateModal(false)
          }}
        />
      )}

      {/* Highlight Detail Modal */}
      {selectedHighlight && (
        <HighlightDetailModal
          highlight={selectedHighlight}
          onClose={() => setSelectedHighlight(null)}
          onEdit={() => {
            setSelectedHighlight(null)
            onEditHighlight?.(selectedHighlight)
          }}
          onDelete={() => {
            onDeleteHighlight?.(selectedHighlight)
            setSelectedHighlight(null)
          }}
        />
      )}
    </>
  )
}

const HighlightCard = ({ highlight, onClick, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      className="relative flex-shrink-0 group"
    >
      <div
        onClick={onClick}
        className={clsx(
          'w-16 h-20 md:w-20 md:h-24 rounded-2xl overflow-hidden cursor-pointer',
          'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-900',
          'hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300'
        )}
      >
        {/* Gradient Background */}
        <div className={clsx(
          'absolute inset-0 bg-gradient-to-br',
          highlight.color || 'from-purple-500 to-pink-500'
        )} />
        
        {/* Cover Image or Icon */}
        {highlight.coverImage ? (
          <img
            src={highlight.coverImage}
            alt={highlight.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">
            {highlight.icon || '⭐'}
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      {/* Title */}
      <p className="mt-2 text-xs text-center font-medium text-gray-900 dark:text-white truncate max-w-[80px]">
        {highlight.title}
      </p>

      {/* Story Count */}
      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
        {highlight.storyCount || 0} stories
      </p>

      {/* Edit/Delete Menu */}
      <div
        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation()
          setShowMenu(!showMenu)
        }}
      >
        <PencilIcon className="w-4 h-4 text-gray-600 dark:text-gray-400 hover:text-primary-500 cursor-pointer" />
      </div>
    </motion.div>
  )
}

const CreateHighlightModal = ({ categories, onClose, onSubmit }) => {
  const [title, setTitle] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [customColor, setCustomColor] = useState('')

  const handleSubmit = () => {
    if (!title.trim()) return
    
    onSubmit({
      title,
      icon: selectedCategory.icon,
      color: customColor || selectedCategory.color,
      categoryId: selectedCategory.id,
    })
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Create Highlight"
      size="md"
    >
      <div className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Highlight Name
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter highlight name"
            maxLength={20}
            className="input-field w-full"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-1">{title.length}/20</p>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Choose a Category
          </label>
          <div className="grid grid-cols-4 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className={clsx(
                  'flex flex-col items-center gap-2 p-3 rounded-xl transition-all',
                  selectedCategory.id === category.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500'
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Color Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Or Choose Custom Color
          </label>
          <div className="flex gap-2 flex-wrap">
            {[
              'from-blue-400 to-blue-600',
              'from-purple-400 to-purple-600',
              'from-pink-400 to-pink-600',
              'from-red-400 to-red-600',
              'from-orange-400 to-orange-600',
              'from-green-400 to-green-600',
              'from-teal-400 to-teal-600',
              'from-indigo-400 to-indigo-600',
            ].map((color) => (
              <button
                key={color}
                onClick={() => setCustomColor(color)}
                className={clsx(
                  'w-10 h-10 rounded-full bg-gradient-to-br',
                  color,
                  customColor === color ? 'ring-2 ring-offset-2 ring-primary-500' : ''
                )}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={!title.trim()}
            fullWidth
          >
            Create Highlight
          </Button>
        </div>
      </div>
    </Modal>
  )
}

const HighlightDetailModal = ({ highlight, onClose, onEdit, onDelete }) => {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={highlight.title}
      size="lg"
    >
      <div className="space-y-4">
        {/* Stories Grid */}
        <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
          {highlight.stories?.map((story, index) => (
            <motion.div
              key={story._id || index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-[9/16] rounded-lg overflow-hidden cursor-pointer hover:opacity-80"
            >
              <img
                src={story.thumbnail || story.url}
                alt={`Story ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onEdit} fullWidth icon={<PencilIcon className="w-4 h-4" />}>
            Edit Highlight
          </Button>
          <Button 
            variant="danger" 
            onClick={onDelete} 
            fullWidth 
            icon={<TrashIcon className="w-4 h-4" />}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default StoryHighlights
