import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, PhotoIcon, VideoCameraIcon, DocumentIcon, MicrophoneIcon } from '@heroicons/react/24/outline'
import api from '../../lib/api'
import clsx from 'clsx'

const MediaGallery = ({ isOpen, onClose, chatId }) => {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all') // all, images, videos, docs, audio

  useEffect(() => {
    if (isOpen && chatId) {
      fetchMedia()
    }
  }, [isOpen, chatId])

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/chats/${chatId}/media`)
      setMedia(data.media || data || [])
    } catch (error) {
      console.error('Failed to fetch media:', error)
      setMedia([])
    } finally {
      setLoading(false)
    }
  }

  const filteredMedia = filter === 'all' 
    ? media 
    : media.filter(m => {
        if (filter === 'images') return m.type === 'image'
        if (filter === 'videos') return m.type === 'video'
        if (filter === 'docs') return m.type === 'document'
        if (filter === 'audio') return m.type === 'audio' || m.type === 'voice'
        return true
      })

  const getMediaIcon = (type) => {
    switch (type) {
      case 'image': return PhotoIcon
      case 'video': return VideoCameraIcon
      case 'document': return DocumentIcon
      case 'audio':
      case 'voice': return MicrophoneIcon
      default: return DocumentIcon
    }
  }

  if (!isOpen || !chatId) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 pointer-events-auto"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative bg-white dark:bg-gray-900 w-full md:max-w-4xl md:rounded-2xl shadow-2xl pointer-events-auto flex flex-col max-h-[90vh] md:max-h-[80vh] overflow-hidden"
      >
        {/* Handle */}
        <div className="md:hidden flex items-center justify-center py-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Media, Links & Docs</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'images', label: 'Images' },
              { id: 'videos', label: 'Videos' },
              { id: 'docs', label: 'Docs' },
              { id: 'audio', label: 'Audio' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={clsx(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                  filter === f.id
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <PhotoIcon className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm">No media found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredMedia.map((item, idx) => {
                const Icon = getMediaIcon(item.type)
                return (
                  <div
                    key={item._id || idx}
                    className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 relative group cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt="Media"
                        className="w-full h-full object-cover"
                      />
                    ) : item.type === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-12 h-12 text-gray-400" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2">
                        <Icon className="w-10 h-10 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500 truncate text-center">{item.name || 'Document'}</p>
                      </div>
                    )}
                    
                    {/* Type badge */}
                    <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                      {item.type}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default MediaGallery
