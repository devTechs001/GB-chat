import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  XMarkIcon,
  PencilIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
  TrashIcon,
  BellIcon,
  BellSlashIcon,
  PhotoIcon,
  LinkIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline'
import Avatar from '../common/Avatar'
import Button from '../common/Button'
import IconButton from '../common/IconButton'
import Modal from '../common/Modal'
import GroupMembers from './GroupMembers'
import GroupSettings from './GroupSettings'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

const GroupInfo = ({ group, isOpen, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('members') // members, media, links, docs
  const [showSettings, setShowSettings] = useState(false)
  const [isMuted, setIsMuted] = useState(group.isMuted)

  const handleLeaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return

    try {
      await api.post(`/groups/${group._id}/leave`)
      toast.success('Left group successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to leave group')
    }
  }

  const handleDeleteGroup = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this group? This action cannot be undone.'
      )
    )
      return

    try {
      await api.delete(`/groups/${group._id}`)
      toast.success('Group deleted successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to delete group')
    }
  }

  const handleToggleMute = async () => {
    try {
      if (isMuted) {
        await api.post(`/groups/${group._id}/unmute`)
        toast.success('Notifications unmuted')
      } else {
        await api.post(`/groups/${group._id}/mute`)
        toast.success('Notifications muted')
      }
      setIsMuted(!isMuted)
    } catch (error) {
      toast.error('Failed to update notification settings')
    }
  }

  const tabs = [
    { id: 'members', label: 'Members', count: group.members?.length },
    { id: 'media', label: 'Media', icon: PhotoIcon },
    { id: 'links', label: 'Links', icon: LinkIcon },
    { id: 'docs', label: 'Docs', icon: DocumentIcon },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="relative max-h-[80vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full z-10"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center pt-8 pb-6">
          <div className="relative inline-block">
            <Avatar
              src={group.avatar}
              alt={group.name}
              size="xl"
              className="mx-auto"
            />
            {group.isAdmin && (
              <button className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full">
                <PencilIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
            {group.name}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Group · {group.members?.length} members
          </p>
          {group.description && (
            <p className="text-gray-600 dark:text-gray-400 mt-2 px-4">
              {group.description}
            </p>
          )}
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Created {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center gap-4 mb-6">
          <IconButton
            icon={<UserPlusIcon />}
            variant="secondary"
            size="lg"
            tooltip="Add Members"
            onClick={() => {/* Open add members modal */}}
          />
          <IconButton
            icon={isMuted ? <BellSlashIcon /> : <BellIcon />}
            variant="secondary"
            size="lg"
            tooltip={isMuted ? 'Unmute' : 'Mute'}
            onClick={handleToggleMute}
          />
          {group.isAdmin && (
            <IconButton
              icon={<PencilIcon />}
              variant="secondary"
              size="lg"
              tooltip="Edit Group"
              onClick={() => setShowSettings(true)}
            />
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                )}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-1 text-gray-400">({tab.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 min-h-[300px]">
          {activeTab === 'members' && (
            <GroupMembers
              group={group}
              onUpdate={onUpdate}
            />
          )}
          {activeTab === 'media' && (
            <div className="text-center py-8 text-gray-500">
              No media shared yet
            </div>
          )}
          {activeTab === 'links' && (
            <div className="text-center py-8 text-gray-500">
              No links shared yet
            </div>
          )}
          {activeTab === 'docs' && (
            <div className="text-center py-8 text-gray-500">
              No documents shared yet
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <Button
            variant="danger"
            fullWidth
            icon={<ArrowRightOnRectangleIcon className="w-5 h-5" />}
            onClick={handleLeaveGroup}
          >
            Leave Group
          </Button>
          
          {group.isAdmin && (
            <Button
              variant="danger"
              fullWidth
              icon={<TrashIcon className="w-5 h-5" />}
              onClick={handleDeleteGroup}
            >
              Delete Group
            </Button>
          )}
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <GroupSettings
            group={group}
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            onUpdate={onUpdate}
          />
        )}
      </div>
    </Modal>
  )
}

export default GroupInfo