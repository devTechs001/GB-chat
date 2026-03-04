import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LockClosedIcon, LockOpenIcon, KeyIcon, ClockIcon } from '@heroicons/react/24/outline'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const FingerprintIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-4.824 1.589l.92-.92a8.002 8.002 0 00-1.836-1.598M6.188 7.374a3.996 3.996 0 012.588-1.374h.032a3.975 3.975 0 012.29 1.004m0 0a3.981 3.981 0 012.29-1.004h.032a3.996 3.996 0 012.588 1.374m-6.44 6.44a8.002 8.002 0 001.836 1.598l.92.92m-4.576-8.45a11.935 11.935 0 013.688-.548c1.306 0 2.553.193 3.688.548" />
  </svg>
)

const FingerprintIconSolid = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-4.824 1.589l.92-.92a8.002 8.002 0 00-1.836-1.598M6.188 7.374a3.996 3.996 0 012.588-1.374h.032a3.975 3.975 0 012.29 1.004m0 0a3.981 3.981 0 012.29-1.004h.032a3.996 3.996 0 012.588 1.374m-6.44 6.44a8.002 8.002 0 001.836 1.598l.92.92m-4.576-8.45a11.935 11.935 0 013.688-.548c1.306 0 2.553.193 3.688.548"/>
  </svg>
)

const ChatLockSettings = ({ chat, isOpen, onClose }) => {
  const [isLocked, setIsLocked] = useState(false)
  const [lockStatus, setLockStatus] = useState(null)
  const [showSetupForm, setShowSetupForm] = useState(false)
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [autoLockTimeout, setAutoLockTimeout] = useState(300000)
  const [isLoading, setIsLoading] = useState(false)

  const timeoutOptions = [
    { value: 60000, label: '1 minute' },
    { value: 300000, label: '5 minutes' },
    { value: 600000, label: '10 minutes' },
    { value: 1800000, label: '30 minutes' },
  ]

  useEffect(() => {
    if (isOpen && chat?._id) {
      fetchLockStatus()
    }
  }, [isOpen, chat])

  const fetchLockStatus = async () => {
    try {
      const { data } = await api.get(`/chat-lock/status/${chat._id}`)
      setLockStatus(data)
      setIsLocked(data.isLocked)
      setBiometricEnabled(data.biometricEnabled || false)
      setAutoLockTimeout(data.autoLockTimeout || 300000)
      setShowSetupForm(!data.exists)
    } catch (error) {
      console.error('Failed to fetch lock status:', error)
    }
  }

  const handleSetupLock = async () => {
    if (pin.length < 4) {
      toast.error('PIN must be at least 4 digits')
      return
    }

    if (pin !== confirmPin) {
      toast.error('PINs do not match')
      return
    }

    setIsLoading(true)
    try {
      await api.post('/chat-lock/lock', {
        chatId: chat._id,
        pin,
        biometricEnabled,
        autoLockTimeout
      })

      toast.success('Chat lock enabled!')
      setShowSetupForm(false)
      fetchLockStatus()
    } catch (error) {
      toast.error('Failed to set up lock')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleLock = async () => {
    if (!lockStatus?.exists) {
      setShowSetupForm(true)
      return
    }

    if (isLocked) {
      // Need to unlock with PIN
      const pin = prompt('Enter PIN to unlock:')
      if (!pin) return

      try {
        await api.post('/chat-lock/unlock', {
          chatId: chat._id,
          pin
        })

        setIsLocked(false)
        toast.success('Chat unlocked')
      } catch (error) {
        toast.error(error.response?.data?.message || 'Incorrect PIN')
      }
    } else {
      // Lock the chat
      try {
        await api.post(`/chat-lock/${chat._id}/toggle`)
        setIsLocked(true)
        toast.success('Chat locked')
      } catch (error) {
        toast.error('Failed to lock chat')
      }
    }
  }

  const handleUpdateSettings = async () => {
    if (newPin) {
      if (newPin.length < 4) {
        toast.error('New PIN must be at least 4 digits')
        return
      }

      const currentPin = prompt('Enter current PIN:')
      if (!currentPin) return

      try {
        await api.put(`/chat-lock/${chat._id}/settings`, {
          pin: currentPin,
          newPin,
          biometricEnabled,
          autoLockTimeout
        })

        setNewPin('')
        toast.success('Lock settings updated!')
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update settings')
      }
    } else {
      // Update without changing PIN
      try {
        await api.put(`/chat-lock/${chat._id}/settings`, {
          biometricEnabled,
          autoLockTimeout
        })

        toast.success('Settings updated!')
      } catch (error) {
        toast.error('Failed to update settings')
      }
    }
  }

  const handleRemoveLock = async () => {
    const pin = prompt('Enter PIN to remove lock:')
    if (!pin) return

    if (!confirm('Are you sure you want to remove the lock from this chat?')) return

    try {
      await api.delete('/chat-lock/remove', {
        data: { chatId: chat._id, pin }
      })

      setIsLocked(false)
      setShowSetupForm(true)
      setLockStatus(null)
      toast.success('Lock removed')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove lock')
    }
  }

  if (!isOpen) return null

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
        className="relative bg-white dark:bg-gray-900 w-full md:max-w-lg md:rounded-2xl shadow-2xl pointer-events-auto flex flex-col max-h-[90vh] md:max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-500 to-primary-600 md:rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                {isLocked ? (
                  <LockClosedIcon className="w-6 h-6 text-white" />
                ) : (
                  <LockOpenIcon className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Chat Lock Settings</h2>
                <p className="text-xs text-white/80">
                  {isLocked ? 'Chat is locked' : 'Chat is unlocked'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {showSetupForm ? (
            /* Setup Form */
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Set Up Chat Lock
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  Protect this chat with a PIN. You'll need to enter the PIN each time you want to view this conversation.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <KeyIcon className="w-4 h-4 inline mr-1" />
                  Set PIN (4-6 digits)
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter PIN"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm PIN
                </label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Confirm PIN"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FingerprintIconSolid className="w-5 h-5 text-primary-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable Biometric
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={biometricEnabled}
                    onChange={(e) => setBiometricEnabled(e.target.checked)}
                    className="w-4 h-4 text-primary-500 rounded"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <ClockIcon className="w-4 h-4 inline mr-1" />
                  Auto-Lock Timeout
                </label>
                <select
                  value={autoLockTimeout}
                  onChange={(e) => setAutoLockTimeout(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                >
                  {timeoutOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSetupLock}
                disabled={isLoading || pin.length < 4 || pin !== confirmPin}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'Setting Up...' : 'Enable Chat Lock'}
              </button>
            </div>
          ) : (
            /* Settings Form */
            <div className="space-y-4">
              {/* Toggle Lock */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  {isLocked ? (
                    <LockClosedIcon className="w-6 h-6 text-red-500" />
                  ) : (
                    <LockOpenIcon className="w-6 h-6 text-green-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {isLocked ? 'Chat Locked' : 'Chat Unlocked'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {isLocked ? 'Tap to unlock' : 'Tap to lock'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggleLock}
                  className={clsx(
                    'px-4 py-2 rounded-lg font-medium transition-all',
                    isLocked
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200'
                  )}
                >
                  {isLocked ? 'Unlock' : 'Lock'}
                </button>
              </div>

              {/* Change PIN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Change PIN
                </label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="New PIN (leave empty to keep current)"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                />
              </div>

              {/* Biometric */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <FingerprintIconSolid className="w-5 h-5 text-primary-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Biometric Unlock
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={biometricEnabled}
                  onChange={(e) => setBiometricEnabled(e.target.checked)}
                  className="w-4 h-4 text-primary-500 rounded"
                />
              </div>

              {/* Auto-Lock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Auto-Lock After
                </label>
                <select
                  value={autoLockTimeout}
                  onChange={(e) => setAutoLockTimeout(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                >
                  {timeoutOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Update Button */}
              <button
                onClick={handleUpdateSettings}
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'Updating...' : 'Update Settings'}
              </button>

              {/* Remove Lock Button */}
              <button
                onClick={handleRemoveLock}
                className="w-full py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
              >
                Remove Lock
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default ChatLockSettings
