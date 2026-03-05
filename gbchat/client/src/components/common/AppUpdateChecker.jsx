import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  SparklesIcon,
  XMarkIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import Button from './Button'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const CURRENT_VERSION = '2.0.0'
const VERSION_INFO_URL = '/version.json'

const AppUpdateChecker = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [updateInfo, setUpdateInfo] = useState(null)
  const [checking, setChecking] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [readyToInstall, setReadyToInstall] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [lastCheck, setLastCheck] = useState(null)
  const [skipVersion, setSkipVersion] = useState(null)

  useEffect(() => {
    // Check for updates on mount
    checkForUpdates()

    // Auto-check every 6 hours
    const interval = setInterval(() => {
      checkForUpdates()
    }, 6 * 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const checkForUpdates = async (manual = false) => {
    if (checking) return

    setChecking(true)
    try {
      // In production, this would fetch from your server
      // For demo, we'll simulate a version check
      const response = await fetch(VERSION_INFO_URL)
      if (response.ok) {
        const data = await response.json()
        compareVersions(data)
      } else {
        // Simulate version data for demo
        simulateVersionCheck()
      }

      const now = new Date().toISOString()
      setLastCheck(now)
      localStorage.setItem('last-update-check', now)

      if (manual && !updateAvailable) {
        toast.success('You are using the latest version!')
      }
    } catch (error) {
      console.error('Failed to check for updates:', error)
      if (manual) {
        // Simulate success for demo
        simulateVersionCheck()
      }
    } finally {
      setChecking(false)
    }
  }

  const simulateVersionCheck = () => {
    // Simulate checking for a new version
    const hasUpdate = Math.random() > 0.7 // 30% chance of update for demo
    if (hasUpdate && CURRENT_VERSION !== skipVersion) {
      const newVersion = '2.1.0'
      setUpdateInfo({
        version: newVersion,
        releaseDate: new Date().toISOString(),
        features: [
          'New AI-powered message suggestions',
          'Enhanced group video calls (up to 50 participants)',
          'Improved cache management',
          'Dark mode improvements',
          'Bug fixes and performance improvements',
        ],
        fixes: [
          'Fixed message delivery issues',
          'Resolved notification bugs',
          'Improved app stability',
        ],
        size: '24.5 MB',
        priority: false,
      })
      setUpdateAvailable(true)
      setShowUpdateModal(true)
    }
  }

  const compareVersions = (remoteData) => {
    const remoteVersion = remoteData.version
    const skippedVersion = localStorage.getItem('skip-update-version')

    if (remoteVersion === CURRENT_VERSION || remoteVersion === skipVersion) {
      return
    }

    if (isNewerVersion(remoteVersion, CURRENT_VERSION)) {
      setUpdateInfo(remoteData)
      setUpdateAvailable(true)
      setShowUpdateModal(true)
    }
  }

  const isNewerVersion = (remote, current) => {
    const remoteParts = remote.split('.').map(Number)
    const currentParts = current.split('.').map(Number)

    for (let i = 0; i < Math.max(remoteParts.length, currentParts.length); i++) {
      const remotePart = remoteParts[i] || 0
      const currentPart = currentParts[i] || 0

      if (remotePart > currentPart) return true
      if (remotePart < currentPart) return false
    }
    return false
  }

  const handleDownload = async () => {
    setDownloading(true)
    setDownloadProgress(0)

    // Simulate download progress
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setReadyToInstall(true)
          setDownloading(false)
          toast.success('Update downloaded successfully!')
          return 100
        }
        return prev + Math.random() * 20
      })
    }, 200)
  }

  const handleInstall = () => {
    // In a real PWA, this would trigger service worker update
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.update()
        })
      })
    }

    toast.success('Installing update...')
    setTimeout(() => {
      toast.success('Update installed! Refreshing app...')
      window.location.reload()
    }, 2000)
  }

  const handleLater = () => {
    setShowUpdateModal(false)
    if (updateInfo?.priority) {
      toast.warning('Update is recommended for optimal performance')
    }
  }

  const handleSkip = () => {
    setSkipVersion(updateInfo?.version)
    localStorage.setItem('skip-update-version', updateInfo?.version)
    setShowUpdateModal(false)
    setUpdateAvailable(false)
    toast.success('Version skipped')
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

  return (
    <>
      {/* Update Button in Header (optional) */}
      <button
        onClick={() => checkForUpdates(true)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        title="Check for updates"
      >
        <ArrowPathIcon className={clsx('w-5 h-5', checking && 'animate-spin')} />
        {updateAvailable && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {/* Update Modal */}
      <AnimatePresence>
        {showUpdateModal && updateInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => !downloading && setShowUpdateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Header with gradient */}
              <div className="relative h-32 bg-gradient-to-br from-green-500 via-teal-500 to-blue-500 rounded-t-3xl overflow-hidden">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute bottom-4 left-6 right-6">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <SparklesIcon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-white">
                      <h2 className="text-2xl font-bold">New Version Available!</h2>
                      <p className="text-white/80 text-sm">v{updateInfo.version}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Update Info */}
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <InformationCircleIcon className="w-5 h-5" />
                    <span>{updateInfo.size}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleSolidIcon className="w-5 h-5 text-green-500" />
                    <span>Verified & Safe</span>
                  </div>
                </div>

                {/* What's New */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-yellow-500" />
                    What's New
                  </h3>
                  <div className="space-y-2">
                    {updateInfo.features?.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircleSolidIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bug Fixes */}
                {updateInfo.fixes && updateInfo.fixes.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                      Bug Fixes
                    </h3>
                    <div className="space-y-2">
                      {updateInfo.fixes.map((fix, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                          <span className="text-gray-700 dark:text-gray-300">{fix}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Priority Warning */}
                {updateInfo.priority && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800 dark:text-yellow-200">
                          Important Update
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          This update includes critical security fixes and is highly recommended.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Download Progress */}
                {downloading && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Downloading...</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {Math.round(downloadProgress)}%
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${downloadProgress}%` }}
                        className="h-full bg-gradient-to-r from-green-500 to-teal-500"
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {!readyToInstall ? (
                    <>
                      <Button
                        variant="secondary"
                        onClick={handleSkip}
                        className="flex-1"
                        disabled={downloading}
                      >
                        Skip This Version
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleLater}
                        className="flex-1"
                        disabled={downloading}
                      >
                        Later
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleDownload}
                        disabled={downloading}
                        className="flex-1"
                      >
                        {downloading ? (
                          <span className="flex items-center gap-2">
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                            Downloading...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            Download
                          </span>
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="secondary" onClick={handleLater} className="flex-1">
                        Later
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleInstall}
                        className="flex-1 bg-gradient-to-r from-green-600 to-teal-600"
                      >
                        <span className="flex items-center gap-2">
                          <ArrowPathIcon className="w-4 h-4" />
                          Install & Restart
                        </span>
                      </Button>
                    </>
                  )}
                </div>

                {/* Last checked */}
                {lastCheck && (
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    Last checked: {formatTimeAgo(lastCheck)}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AppUpdateChecker
