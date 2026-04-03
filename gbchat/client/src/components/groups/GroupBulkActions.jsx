import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  UserPlusIcon,
  ShareIcon,
  ArchiveBoxIcon,
  BellIcon,
  StarIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  LinkIcon,
  DocumentTextIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline'
import Button from '../common/Button'
import Input from '../common/Input'
import Modal from '../common/Modal'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const GroupBulkActions = ({ 
  selectedGroups, 
  onAction, 
  onClearSelection, 
  loading = false 
}) => {
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [inviteData, setInviteData] = useState({
    message: '',
    emails: '',
    link: '',
  })
  const [exportFormat, setExportFormat] = useState('json')

  const handleInvite = async () => {
    if (!inviteData.message.trim()) {
      toast.error('Please enter an invitation message')
      return
    }

    const emails = inviteData.emails
      .split(',')
      .map(email => email.trim())
      .filter(email => email && email.includes('@'))

    if (emails.length === 0 && !inviteData.link) {
      toast.error('Please add emails or generate a link')
      return
    }

    await onAction('invite', { ...inviteData, emails })
    setShowInviteModal(false)
    setInviteData({ message: '', emails: '', link: '' })
  }

  const handleExport = async () => {
    await onAction('export', { format: exportFormat })
    setShowExportModal(false)
  }

  const bulkActions = [
    {
      id: 'star',
      label: 'Star',
      icon: StarIcon,
      variant: 'secondary',
      description: 'Mark as favorite',
      color: 'text-yellow-600',
    },
    {
      id: 'mute',
      label: 'Mute',
      icon: BellIcon,
      variant: 'secondary',
      description: 'Silence notifications',
      color: 'text-gray-600',
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: ArchiveBoxIcon,
      variant: 'secondary',
      description: 'Hide from main list',
      color: 'text-blue-600',
    },
    {
      id: 'invite',
      label: 'Invite',
      icon: UserPlusIcon,
      variant: 'secondary',
      description: 'Add members',
      color: 'text-green-600',
      onClick: () => setShowInviteModal(true),
    },
    {
      id: 'export',
      label: 'Export',
      icon: ShareIcon,
      variant: 'secondary',
      description: 'Download data',
      color: 'text-purple-600',
      onClick: () => setShowExportModal(true),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: TrashIcon,
      variant: 'danger',
      description: 'Remove permanently',
      color: 'text-red-600',
    },
  ]

  if (selectedGroups.size === 0) return null

  return (
    <>
      {/* Bulk Actions Bar */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="border-b border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/20 overflow-hidden"
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-primary-900 dark:text-primary-100">
                {selectedGroups.size} group{selectedGroups.size !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={onClearSelection}
                className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
              >
                Clear selection
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              {bulkActions.map((action) => {
                const Icon = action.icon
                return (
                  <Button
                    key={action.id}
                    variant={action.variant}
                    size="sm"
                    onClick={() => {
                      if (action.onClick) {
                        action.onClick()
                      } else {
                        onAction(action.id)
                      }
                    }}
                    loading={loading}
                    title={action.description}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title={`Invite to ${selectedGroups.size} Group${selectedGroups.size !== 1 ? 's' : ''}`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Invitation Message
            </label>
            <textarea
              value={inviteData.message}
              onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
              className="input-field resize-none"
              placeholder="You're invited to join our group! Let's connect and share ideas..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Addresses
            </label>
            <textarea
              value={inviteData.emails}
              onChange={(e) => setInviteData(prev => ({ ...prev, emails: e.target.value }))}
              rows={3}
              className="input-field resize-none"
              placeholder="user1@example.com, user2@example.com, user3@example.com"
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate multiple emails with commas
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inviteData.link}
                onChange={(e) => setInviteData(prev => ({ ...prev, link: e.target.checked ? 'generated' : '' }))}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Generate invite link
              </span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={() => setShowInviteModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleInvite}
              loading={loading}
              fullWidth
            >
              Send Invitations
            </Button>
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title={`Export ${selectedGroups.size} Group${selectedGroups.size !== 1 ? 's' : ''}`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'json', label: 'JSON', description: 'Machine-readable format', icon: DocumentTextIcon },
                { id: 'csv', label: 'CSV', description: 'Spreadsheet format', icon: ArrowDownTrayIcon },
                { id: 'pdf', label: 'PDF', description: 'Print-friendly format', icon: PhotoIcon },
                { id: 'link', label: 'Share Link', description: 'Public shareable link', icon: LinkIcon },
              ].map((format) => {
                const Icon = format.icon
                return (
                  <label
                    key={format.id}
                    className={clsx(
                      'relative flex items-center p-3 border rounded-lg cursor-pointer transition-all',
                      exportFormat === format.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <input
                      type="radio"
                      name="exportFormat"
                      value={format.id}
                      checked={exportFormat === format.id}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="sr-only"
                    />
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{format.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{format.description}</div>
                    </div>
                    {exportFormat === format.id && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full" />
                    )}
                  </label>
                )
              })}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Export includes:</h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Group name and description</li>
              <li>• Member list and roles</li>
              <li>• Recent message statistics</li>
              <li>• Group settings and permissions</li>
              <li>• Creation and activity dates</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={() => setShowExportModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleExport}
              loading={loading}
              fullWidth
            >
              Export Groups
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default GroupBulkActions
