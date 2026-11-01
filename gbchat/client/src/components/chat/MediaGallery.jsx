import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, PhotoIcon, VideoCameraIcon, DocumentIcon, MicrophoneIcon } from '@heroicons/react/24/outline'
import api from '../../lib/api'
import clsx from 'clsx'

const TYPE_GROUPS = {
  image: 'images',
  video: 'videos',
  document: 'docs',
  audio: 'audio',
  voice: 'audio',
}

/** Server returns Message docs: { type, content: { media: {...} }, createdAt } */
const normalizeMedia = (message, index) => {
  const file = message?.content?.media || {}
  return {
    _id: message?._id || `media-${index}`,
    type: message?.type || 'document',
    url: file.url || message?.url || '',
    thumbnail: file.thumbnail || file.url || '',
    name: file.filename || message?.name || 'Attachment',
    size: file.fileSize || 0,
    duration: file.duration || 0,
    createdAt: message?.createdAt,
    sender: message?.sender,
  }
}

const MediaGallery = ({ isOpen, onClose, chatId }) => {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null)
  const [filter, setFilter] = useState('all') // all, images, videos, docs, audio

  useEffect(() => {
    if (isOpen && chatId) {
      fetchMedia()
    }
  }, [isOpen, chatId])

  const fetchMedia = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/chats/${chatId}/media`)
      const list = Array.isArray(data) ? data : data?.media || []
      setMedia(list.map(normalizeMedia))
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load shared media')
      setMedia([])
    } finally {
      setLoading(false)
    }
  }

  const filteredMedia =
    filter === 'all' ? media : media.filter((item) => TYPE_GROUPS[item.type] === filter)

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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg bg-gray-200/70 dark:bg-gray-800 animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500 gap-2">
              <p className="text-sm">{error}</p>
              <button
                onClick={fetchMedia}
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                Try again
              </button>
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
                  <button
                    type="button"
                    key={item._id || idx}
                    onClick={() => (item.url ? setPreview(item) : null)}
                    className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 relative group cursor-pointer hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {item.type === 'image' && item.url ? (
                      <img
                        src={item.thumbnail || item.url}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : item.type === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900/5 dark:bg-black/30">
                        <Icon className="w-12 h-12 text-gray-400" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2">
                        <Icon className="w-10 h-10 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500 truncate text-center w-full px-1">
                          {item.name}
                        </p>
                      </div>
                    )}

                    <span className="absolute top-2 right-2 bg-black/60 text-white px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide">
                      {item.type}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Preview lightbox */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 z-10 flex items-center justify-center p-4 pointer-events-auto"
            onClick={() => setPreview(null)}
          >
            <button
              onClick={() => setPreview(null)}
              aria-label="Close preview"
              className="absolute top-4 right-4 p-2 rounded-full text-white bg-white/10 hover:bg-white/20"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            {preview.type === 'image' ? (
              <img
                src={preview.url}
                alt={preview.name}
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            ) : preview.type === 'video' ? (
              <video src={preview.url} controls className="max-h-full max-w-full rounded-lg" />
            ) : (
              <div className="flex flex-col items-center gap-3 text-white">
                {React.createElement(getMediaIcon(preview.type), { className: 'w-16 h-16' })}
                <p className="text-sm">{preview.name}</p>
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-primary-600 text-white text-sm"
                >
                  Open file
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MediaGallery
