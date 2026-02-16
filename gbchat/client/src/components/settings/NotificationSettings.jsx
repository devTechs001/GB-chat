import React, { useState, useEffect } from 'react'
import { Switch } from '@headlessui/react'
import { BellIcon } from '@heroicons/react/24/outline'
import Button from '../common/Button'
import useNotificationStore from '../../store/useNotificationStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const NotificationSettings = () => {
  const { settings, updateSettings, requestPermission, permission } =
    useNotificationStore()

  const [formData, setFormData] = useState(settings)

  useEffect(() => {
    setFormData(settings)
  }, [settings])

  const handleToggle = (key) => {
    const newSettings = { ...formData, [key]: !formData[key] }
    setFormData(newSettings)
    updateSettings(newSettings)
  }

  const handleRequestPermission = async () => {
    const granted = await requestPermission()
    if (granted) {
      toast.success('Notifications enabled')
    } else {
      toast.error('Notification permission denied')
    }
  }

  const notificationOptions = [
    {
      key: 'enabled',
      label: 'Enable Notifications',
      description: 'Receive notifications for new messages and updates',
    },
    {
      key: 'sound',
      label: 'Sound',
      description: 'Play sound for notifications',
      disabled: !formData.enabled,
    },
    {
      key: 'vibration',
      label: 'Vibration',
      description: 'Vibrate for notifications',
      disabled: !formData.enabled,
    },
    {
      key: 'desktop',
      label: 'Desktop Notifications',
      description: 'Show desktop notifications',
      disabled: !formData.enabled,
    },
    {
      key: 'messagePreview',
      label: 'Message Preview',
      description: 'Show message content in notifications',
      disabled: !formData.enabled,
    },
    {
      key: 'groupMessages',
      label: 'Group Messages',
      description: 'Notifications for group messages',
      disabled: !formData.enabled,
    },
    {
      key: 'callNotifications',
      label: 'Call Notifications',
      description: 'Notifications for incoming calls',
      disabled: !formData.enabled,
    },
  ]

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Notification Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage how you receive notifications
        </p>
      </div>

      {/* Permission Status */}
      {permission !== 'granted' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <BellIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                Enable Browser Notifications
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Allow notifications to receive updates even when the app is closed
              </p>
              <Button
                size="sm"
                variant="primary"
                className="mt-3"
                onClick={handleRequestPermission}
              >
                Enable Notifications
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Options */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm divide-y divide-gray-200 dark:divide-gray-700">
        {notificationOptions.map((option) => (
          <div key={option.key} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3
                  className={clsx(
                    'font-medium',
                    option.disabled
                      ? 'text-gray-400 dark:text-gray-600'
                      : 'text-gray-900 dark:text-white'
                  )}
                >
                  {option.label}
                </h3>
                <p
                  className={clsx(
                    'text-sm mt-1',
                    option.disabled
                      ? 'text-gray-400 dark:text-gray-600'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {option.description}
                </p>
              </div>
              <Switch
                checked={formData[option.key]}
                onChange={() => handleToggle(option.key)}
                disabled={option.disabled}
                className={clsx(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  formData[option.key]
                    ? 'bg-primary-600'
                    : 'bg-gray-200 dark:bg-gray-700',
                  option.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <span
                  className={clsx(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    formData[option.key] ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </Switch>
            </div>
          </div>
        ))}
      </div>

      {/* Test Notification */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          Test Notifications
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Send a test notification to see how it looks
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            new Notification('GBChat Test', {
              body: 'This is a test notification',
              icon: '/logo.png',
            })
            toast.success('Test notification sent')
          }}
          disabled={permission !== 'granted'}
        >
          Send Test Notification
        </Button>
      </div>
    </div>
  )
}

export default NotificationSettings