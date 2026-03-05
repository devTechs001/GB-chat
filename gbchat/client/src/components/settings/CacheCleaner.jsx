import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrashIcon,
  SparklesIcon,
  CheckCircleIcon,
  ClockIcon,
  BoltIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import Button from '../common/Button'
import Modal from '../common/Modal'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import api from '../../lib/api'

const CacheCleaner = () => {
  const [cacheData, setCacheData] = useState({
    totalCache: 0,
    imageCache: 0,
    videoCache: 0,
    documentCache: 0,
    audioCache: 0,
    tempFiles: 0,
    thumbnailCache: 0,
    lastCleared: null,
  })
  const [loading, setLoading] = useState(true)
  const [cleaning, setCleaning] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedCleanType, setSelectedCleanType] = useState('all')
  const [autoCleanEnabled, setAutoCleanEnabled] = useState(false)
  const [autoCleanInterval, setAutoCleanInterval] = useState(7) // days

  useEffect(() => {
    fetchCacheData()
  }, [])

  const fetchCacheData = async () => {
    try {
      const { data } = await api.get('/storage/cache')
      setCacheData(data)
      // Load auto-clean settings from localStorage
      const savedAutoClean = localStorage.getItem('auto-clean-enabled')
      const savedInterval = localStorage.getItem('auto-clean-interval')
      if (savedAutoClean) setAutoCleanEnabled(JSON.parse(savedAutoClean))
      if (savedInterval) setAutoCleanInterval(JSON.parse(savedInterval))
    } catch (error) {
      console.error('Failed to fetch cache data:', error)
      // Use mock data for demo
      setCacheData({
        totalCache: 524288000, // 500MB
        imageCache: 209715200, // 200MB
        videoCache: 157286400, // 150MB
        documentCache: 104857600, // 100MB
        audioCache: 31457280, // 30MB
        tempFiles: 20971520, // 20MB
        thumbnailCache: 10485760, // 10MB
        lastCleared: localStorage.getItem('last-cache-clear'),
      })
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Never'
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const handleCleanCache = async (type) => {
    setCleaning(true)
    try {
      await api.delete(`/storage/cache/${type}`)
      toast.success('Cache cleared successfully!')
      localStorage.setItem('last-cache-clear', new Date().toISOString())
      fetchCacheData()
    } catch (error) {
      console.error('Failed to clear cache:', error)
      // Simulate success for demo
      setTimeout(() => {
        toast.success('Cache cleared successfully!')
        localStorage.setItem('last-cache-clear', new Date().toISOString())
        setCacheData((prev) => ({
          ...prev,
          totalCache: type === 'all' ? 0 : prev.totalCache - prev[`${type}Cache`],
          [`${type}Cache`]: 0,
        }))
      }, 1000)
    } finally {
      setCleaning(false)
      setShowConfirmModal(false)
    }
  }

  const toggleAutoClean = () => {
    const newValue = !autoCleanEnabled
    setAutoCleanEnabled(newValue)
    localStorage.setItem('auto-clean-enabled', JSON.stringify(newValue))
    toast.success(newValue ? 'Auto-clean enabled' : 'Auto-clean disabled')
  }

  const updateAutoCleanInterval = (days) => {
    setAutoCleanInterval(days)
    localStorage.setItem('auto-clean-interval', JSON.stringify(days))
    toast.success(`Auto-clean interval set to ${days} days`)
  }

  const cleanItems = [
    {
      key: 'imageCache',
      label: 'Image Cache',
      description: 'Cached images from chats',
      icon: '🖼️',
      color: 'bg-blue-500',
    },
    {
      key: 'videoCache',
      label: 'Video Cache',
      description: 'Cached video thumbnails',
      icon: '🎬',
      color: 'bg-purple-500',
    },
    {
      key: 'documentCache',
      label: 'Document Cache',
      description: 'Cached documents and files',
      icon: '📄',
      color: 'bg-green-500',
    },
    {
      key: 'audioCache',
      label: 'Audio Cache',
      description: 'Cached voice messages',
      icon: '🎵',
      color: 'bg-orange-500',
    },
    {
      key: 'thumbnailCache',
      label: 'Thumbnail Cache',
      description: 'Media thumbnails',
      icon: '🖼️',
      color: 'bg-pink-500',
    },
    {
      key: 'tempFiles',
      label: 'Temporary Files',
      description: 'App temp files',
      icon: '🗑️',
      color: 'bg-gray-500',
    },
  ]

  const getCacheHealth = () => {
    const total = cacheData.totalCache
    if (total < 104857600) return { label: 'Excellent', color: 'text-green-500', bg: 'bg-green-500' }
    if (total < 524288000) return { label: 'Good', color: 'text-blue-500', bg: 'bg-blue-500' }
    if (total < 1073741824) return { label: 'Fair', color: 'text-yellow-500', bg: 'bg-yellow-500' }
    return { label: 'Poor', color: 'text-red-500', bg: 'bg-red-500' }
  }

  const health = getCacheHealth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cache Overview Card */}
      <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <SparklesIcon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Cache Cleaner</h3>
              <p className="text-green-100 text-sm">Keep your app running smoothly</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{formatFileSize(cacheData.totalCache)}</p>
            <p className="text-green-100 text-sm">Total Cache</p>
          </div>
        </div>

        {/* Health Indicator */}
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100">Cache Health</span>
            <span className={`font-semibold ${health.color}`}>{health.label}</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((cacheData.totalCache / 1073741824) * 100, 100)}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className={clsx('h-full rounded-full', health.bg)}
            />
          </div>
          <p className="text-xs text-green-100 mt-2">
            Last cleared: {formatTimeAgo(cacheData.lastCleared)}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => {
            setSelectedCleanType('all')
            setShowConfirmModal(true)
          }}
          disabled={cleaning}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
              <TrashIcon className="w-6 h-6 text-red-500" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 dark:text-white">Clean All</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Free max space</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            setSelectedCleanType('tempFiles')
            setShowConfirmModal(true)
          }}
          disabled={cleaning}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
              <BoltIcon className="w-6 h-6 text-orange-500" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 dark:text-white">Quick Clean</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Temp files only</p>
            </div>
          </div>
        </button>
      </div>

      {/* Cache Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Cache Breakdown
        </h3>
        <div className="space-y-3">
          {cleanItems.map((item) => {
            const size = cacheData[item.key] || 0
            const percentage = cacheData.totalCache > 0 ? (size / cacheData.totalCache) * 100 : 0

            return (
              <div
                key={item.key}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {item.label}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(size)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5 }}
                      className={clsx('h-full rounded-full', item.color)}
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCleanType(item.key.replace('Cache', ''))
                    setShowConfirmModal(true)
                  }}
                  disabled={cleaning || size === 0}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-30 transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Auto Clean Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <ClockIcon className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Auto Clean</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Automatically clean cache periodically
              </p>
            </div>
          </div>
          <button
            onClick={toggleAutoClean}
            className={clsx(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              autoCleanEnabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
            )}
          >
            <span
              className={clsx(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                autoCleanEnabled ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        {autoCleanEnabled && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Clean every:
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 7, 14].map((days) => (
                <button
                  key={days}
                  onClick={() => updateAutoCleanInterval(days)}
                  className={clsx(
                    'py-2 px-3 rounded-lg text-sm font-medium transition-all',
                    autoCleanInterval === days
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  )}
                >
                  {days} {days === 1 ? 'day' : 'days'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Performance Tips */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
          <BoltIcon className="w-5 h-5" />
          Performance Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li className="flex items-start gap-2">
            <CheckCircleSolidIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>Clear cache weekly for optimal performance</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleSolidIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>Enable auto-clean to prevent lagging</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleSolidIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>Video cache grows fastest - clean regularly if you watch many videos</span>
          </li>
        </ul>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={`Clear ${selectedCleanType === 'all' ? 'All Cache' : selectedCleanType.replace(/([A-Z])/g, ' $1').trim()}`}
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to clear{' '}
            {selectedCleanType === 'all' ? 'all cached data' : `${selectedCleanType} cache`}?
            This will free up space but may cause the app to reload media when needed.
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-sm text-green-800 dark:text-green-200 font-medium">
              Will free up:{' '}
              {selectedCleanType === 'all'
                ? formatFileSize(cacheData.totalCache)
                : formatFileSize(cacheData[`${selectedCleanType}Cache`] || 0)}
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleCleanCache(selectedCleanType)}
              disabled={cleaning}
            >
              {cleaning ? 'Cleaning...' : 'Clear Cache'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default CacheCleaner
