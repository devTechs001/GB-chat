import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  XMarkIcon,
  MicrophoneIcon,
  CameraIcon,
  BellIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

const PERMISSIONS = [
  {
    key: 'microphone',
    label: 'Microphone',
    description: 'Record voice messages and make voice calls',
    icon: MicrophoneIcon,
    color: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  {
    key: 'camera',
    label: 'Camera',
    description: 'Take photos, record videos, and make video calls',
    icon: CameraIcon,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    description: 'Receive message alerts and call notifications',
    icon: BellIcon,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  {
    key: 'contacts',
    label: 'Contacts',
    description: 'Find friends who are using GBChat',
    icon: UserGroupIcon,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
]

const AppPermissions = ({ isOpen, onClose }) => {
  const [permissions, setPermissions] = useState({})

  useEffect(() => {
    if (isOpen) checkPermissions()
  }, [isOpen])

  const checkPermissions = async () => {
    const results = {}
    for (const p of PERMISSIONS) {
      try {
        if (p.key === 'notifications') {
          if ('Notification' in window) {
            results[p.key] = Notification.permission
          } else {
            results[p.key] = 'unsupported'
          }
        } else {
          const name = p.key === 'microphone' ? 'microphone' : 'camera'
          const result = await navigator.permissions.query({ name })
          results[p.key] = result.state
        }
      } catch {
        results[p.key] = 'prompt'
      }
    }
    setPermissions(results)
  }

  const requestPermission = async (key) => {
    try {
      if (key === 'notifications') {
        if ('Notification' in window) {
          const result = await Notification.requestPermission()
          setPermissions(p => ({ ...p, [key]: result }))
        }
      } else if (key === 'contacts') {
        if ('contacts' in navigator && 'ContactsManager' in window) {
          const contacts = await navigator.contacts.select(['name', 'email'], { multiple: true })
          setPermissions(p => ({ ...p, [key]: contacts.length > 0 ? 'granted' : 'denied' }))
        } else {
          setPermissions(p => ({ ...p, [key]: 'unsupported' }))
        }
      } else {
        const constraints = key === 'microphone' ? { audio: true } : { video: true }
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        stream.getTracks().forEach(t => t.stop())
        setPermissions(p => ({ ...p, [key]: 'granted' }))
      }
    } catch {
      setPermissions(p => ({ ...p, [key]: 'denied' }))
    }
  }

  const getStatusBadge = (state) => {
    switch (state) {
      case 'granted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
            <CheckCircleIcon className="w-3 h-3" />
            Allowed
          </span>
        )
      case 'denied':
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
            <ExclamationTriangleIcon className="w-3 h-3" />
            Blocked
          </span>
        )
      case 'prompt':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            Not Requested
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            Unavailable
          </span>
        )
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">App Permissions</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-1">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            GBChat needs these permissions to provide the best experience. You can change them anytime in your device settings.
          </p>

          {PERMISSIONS.map((perm) => {
            const Icon = perm.icon
            const state = permissions[perm.key] || 'prompt'

            return (
              <div
                key={perm.key}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', perm.bgColor)}>
                  <Icon className={clsx('w-5 h-5', perm.color)} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{perm.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{perm.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {getStatusBadge(state)}
                  {state !== 'granted' && state !== 'denied' && state !== 'blocked' && (
                    <button
                      onClick={() => requestPermission(perm.key)}
                      className="px-3 py-1 text-xs font-medium bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    >
                      Allow
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default AppPermissions
