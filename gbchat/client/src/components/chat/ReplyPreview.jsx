import React from 'react'
import { XMarkIcon, PhotoIcon, DocumentIcon, MicrophoneIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

const ReplyPreview = ({ message, onCancel }) => {
  const getMessageIcon = () => {
    switch (message.type) {
      case 'image':
        return <PhotoIcon className="w-4 h-4 text-gray-400" />
      case 'document':
        return <DocumentIcon className="w-4 h-4 text-gray-400" />
      case 'voice':
      case 'audio':
        return <MicrophoneIcon className="w-4 h-4 text-gray-400" />
      default:
        return null
    }
  }

  const getMessagePreview = () => {
    switch (message.type) {
      case 'image':
        return '📷 Photo'
      case 'video':
        return '🎬 Video'
      case 'document':
        return '📄 Document'
      case 'voice':
        return '🎤 Voice message'
      case 'audio':
        return '🎵 Audio'
      case 'location':
        return '📍 Location'
      default:
        return message.content
    }
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-l-4 border-primary-500">
      {/* Color bar */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-primary-600 dark:text-primary-400">
          Replying to {message.sender?.name || 'Unknown'}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
          {getMessageIcon()}
          {getMessagePreview()}
        </p>
      </div>

      {/* Thumbnail for media */}
      {message.type === 'image' && message.media?.[0]?.url && (
        <img
          src={message.media[0].thumbnail || message.media[0].url}
          alt=""
          className="w-10 h-10 rounded object-cover"
        />
      )}

      {/* Cancel button */}
      <button
        onClick={onCancel}
        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
      >
        <XMarkIcon className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  )
}

export default ReplyPreview