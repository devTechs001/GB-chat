import React, { useState } from 'react'
import { Switch } from '@headlessui/react'
import {
  ArchiveBoxIcon,
  TrashIcon,
  ClockIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline'
import Button from '../common/Button'
import Modal from '../common/Modal'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const ChatSettings = () => {
  const [settings, setSettings] = useState({
    enterToSend: true,
    autoDownloadMedia: true,
    autoPlayVideos: false,
    showTypingIndicator: true,
    showReadReceipts: true,
    showOnlineStatus: true,
    archiveOnMute: false,
    saveToGallery: false,
    mediaQuality: 'auto', // auto, high, medium, low
  })

  const [showClearModal, setShowClearModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
    toast.success('Settings updated')
  }

  const handleMediaQualityChange = (quality) => {
    setSettings((prev) => ({ ...prev, mediaQuality: quality }))
    toast.success(`Media quality set to ${quality}`)
  }

  const handleClearAllChats = async () => {
    try {
      await api.post('/chats/clear-all')
      toast.success('All chats cleared')
      setShowClearModal(false)
    } catch (error) {
      toast.error('Failed to clear chats')
    }
  }

  const handleExportChats = async () => {
    setExportLoading(true)
    try {
      const { data } = await api.get('/chats/export', {
        responseType: 'blob',
      })
      
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `gbchat-export-${Date.now()}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast.success('Chats exported successfully')
      setShowExportModal(false)
    } catch (error) {
      toast.error('Failed to export chats')
    } finally {
      setExportLoading(false)
    }
  }

  const chatOptions = [
    {
      key: 'enterToSend',
      label: 'Enter to Send',
      description: 'Press Enter to send message (Shift+Enter for new line)',
    },
    {
      key: 'autoDownloadMedia',
      label: 'Auto-download Media',
      description: 'Automatically download photos and videos',
    },
    {
      key: 'autoPlayVideos',
      label: 'Auto-play Videos',
      description: 'Automatically play videos when scrolling',
    },
    {
      key: 'showTypingIndicator',
      label: 'Typing Indicator',
      description: 'Show when others are typing',
    },
    {
      key: 'showReadReceipts',
      label: 'Read Receipts',
      description: 'Let others know when you have read their messages',
    },
    {
      key: 'showOnlineStatus',
      label: 'Online Status',
      description: 'Show when you are online',
    },
    {
      key: 'archiveOnMute',
      label: 'Archive on Mute',
      description: 'Automatically archive muted chats',
    },
    {
      key: 'saveToGallery',
      label: 'Save to Gallery',
      description: 'Save received media to device gallery',
    },
  ]

  const mediaQualities = [
    { value: 'auto', label: 'Auto' },
    { value: 'high', label: 'High Quality' },
    { value: 'medium', label: 'Medium Quality' },
    { value: 'low', label: 'Low Quality (Data Saver)' },
  ]

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Chat Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your chat experience
        </p>
      </div>

      {/* Chat Behavior */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm divide-y divide-gray-200 dark:divide-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Chat Behavior
          </h3>
        </div>
        
        {chatOptions.map((option) => (
          <div key={option.key} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {option.label}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {option.description}
                </p>
              </div>
              <Switch
                checked={settings[option.key]}
                onChange={() => handleToggle(option.key)}
                className={clsx(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  settings[option.key]
                    ? 'bg-primary-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span
                  className={clsx(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    settings[option.key] ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </Switch>
            </div>
          </div>
        ))}
      </div>

      {/* Media Quality */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Media Quality
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Choose the quality for sending and receiving media
        </p>
        <div className="space-y-2">
          {mediaQualities.map((quality) => (
            <label
              key={quality.value}
              className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              <input
                type="radio"
                name="mediaQuality"
                value={quality.value}
                checked={settings.mediaQuality === quality.value}
                onChange={() => handleMediaQualityChange(quality.value)}
                className="w-4 h-4 text-primary-600"
              />
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                {quality.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Chat Management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Chat Management
        </h3>
        <div className="space-y-3">
          <Button
            variant="secondary"
            fullWidth
            icon={<DocumentArrowDownIcon className="w-5 h-5" />}
            onClick={() => setShowExportModal(true)}
          >
            Export All Chats
          </Button>
          
          <Button
            variant="secondary"
            fullWidth
            icon={<ArchiveBoxIcon className="w-5 h-5" />}
            onClick={() => {/* Archive all chats */}}
          >
            Archive All Chats
          </Button>
          
          <Button
            variant="danger"
            fullWidth
            icon={<TrashIcon className="w-5 h-5" />}
            onClick={() => setShowClearModal(true)}
          >
            Clear All Chats
          </Button>
        </div>
      </div>

      {/* Clear Chats Modal */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear All Chats"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to clear all chats? This will delete all messages
            from all conversations. This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowClearModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleClearAllChats}>
              Clear All Chats
            </Button>
          </div>
        </div>
      </Modal>

      {/* Export Chats Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Chats"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Export all your chats as a JSON file. This includes all messages,
            media links, and chat information.
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Note: Media files are not included in the export, only links to them.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleExportChats}
              loading={exportLoading}
            >
              Export
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ChatSettings