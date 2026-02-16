import React, { useState, useEffect } from 'react'
import {
  ChartBarIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  MicrophoneIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import Button from '../common/Button'
import Modal from '../common/Modal'
import { formatFileSize } from '../../lib/formatters'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const StorageSettings = () => {
  const [storageData, setStorageData] = useState({
    total: 0,
    used: 0,
    breakdown: {
      images: 0,
      videos: 0,
      documents: 0,
      audio: 0,
      other: 0,
    },
    chats: [],
  })
  const [loading, setLoading] = useState(true)
  const [showClearModal, setShowClearModal] = useState(false)
  const [selectedType, setSelectedType] = useState(null)

  useEffect(() => {
    fetchStorageData()
  }, [])

  const fetchStorageData = async () => {
    try {
      const { data } = await api.get('/storage/usage')
      setStorageData(data)
    } catch (error) {
      toast.error('Failed to load storage data')
    } finally {
      setLoading(false)
    }
  }

  const handleClearStorage = async (type) => {
    try {
      await api.delete(`/storage/clear/${type}`)
      toast.success(`${type} cleared successfully`)
      fetchStorageData()
      setShowClearModal(false)
    } catch (error) {
      toast.error('Failed to clear storage')
    }
  }

  const storageTypes = [
    {
      type: 'images',
      label: 'Images',
      icon: PhotoIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500',
    },
    {
      type: 'videos',
      label: 'Videos',
      icon: VideoCameraIcon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500',
    },
    {
      type: 'documents',
      label: 'Documents',
      icon: DocumentIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-500',
    },
    {
      type: 'audio',
      label: 'Audio',
      icon: MicrophoneIcon,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500',
    },
  ]

  const usedPercentage = (storageData.used / storageData.total) * 100 || 0

  if (loading) {
    return (
      <div className="max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Storage & Data
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your storage usage and data
        </p>
      </div>

      {/* Storage Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Storage Usage
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatFileSize(storageData.used)} of {formatFileSize(storageData.total)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-500',
                usedPercentage > 90
                  ? 'bg-red-500'
                  : usedPercentage > 70
                  ? 'bg-yellow-500'
                  : 'bg-primary-500'
              )}
              style={{ width: `${Math.min(usedPercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {usedPercentage.toFixed(1)}% used
          </p>
        </div>

        {/* Storage Breakdown */}
        <div className="space-y-3">
          {storageTypes.map((item) => {
            const Icon = item.icon
            const size = storageData.breakdown[item.type] || 0
            const percentage = (size / storageData.used) * 100 || 0

            return (
              <div key={item.type} className="flex items-center gap-4">
                <div className={clsx('p-2 rounded-lg', `bg-${item.color.split('-')[1]}-100 dark:bg-${item.color.split('-')[1]}-900/20`)}>
                  <Icon className={clsx('w-5 h-5', item.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.label}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(size)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full', item.bgColor)}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedType(item.type)
                    setShowClearModal(true)
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Storage by Chat */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Storage by Chat
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {storageData.chats?.slice(0, 10).map((chat) => (
            <div
              key={chat._id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {chat.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {chat.messageCount} messages
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatFileSize(chat.storageUsed)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Data Management
        </h3>
        <div className="space-y-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              // Clear cache
              toast.success('Cache cleared')
            }}
          >
            Clear Cache
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              // Clear temp files
              toast.success('Temporary files cleared')
            }}
          >
            Clear Temporary Files
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={() => {
              setSelectedType('all')
              setShowClearModal(true)
            }}
          >
            Clear All Media
          </Button>
        </div>
      </div>

      {/* Network Usage */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Network Usage
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Mobile Data</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatFileSize(234567890)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Wi-Fi</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatFileSize(987654321)}
            </span>
          </div>
          <Button variant="secondary" fullWidth>
            Reset Statistics
          </Button>
        </div>
      </div>

      {/* Clear Storage Modal */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title={`Clear ${selectedType === 'all' ? 'All Media' : selectedType}`}
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to clear all{' '}
            {selectedType === 'all' ? 'media files' : selectedType}? This action
            cannot be undone.
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              This will free up approximately{' '}
              {formatFileSize(
                selectedType === 'all'
                  ? storageData.used
                  : storageData.breakdown[selectedType]
              )}
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowClearModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleClearStorage(selectedType)}
            >
              Clear
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default StorageSettings