import React, { useState } from 'react'
import {
  CameraIcon,
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ChartBarIcon,
  TagIcon,
  MapPinIcon,
  LinkIcon,
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  GlobeAltIcon,
  HashtagIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  PhotoIcon,
  GiftIcon,
  TrophyIcon,
  FireIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Button from '../common/Button'
import Avatar from '../common/Avatar'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const GroupSettings = ({ group, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: group.name || '',
    description: group.description || '',
    settings: {
      allowMemberAdd: group.settings?.allowMemberAdd ?? true,
      allowMemberRemove: group.settings?.allowMemberRemove ?? false,
      allowEditInfo: group.settings?.allowEditInfo ?? false,
      approveMembers: group.settings?.approveMembers ?? false,
      muteAll: group.settings?.muteAll ?? false,
      allowReactions: group.settings?.allowReactions ?? true,
      allowPolls: group.settings?.allowPolls ?? true,
      allowEvents: group.settings?.allowEvents ?? true,
      allowFileSharing: group.settings?.allowFileSharing ?? true,
      allowVoiceMessages: group.settings?.allowVoiceMessages ?? true,
      allowVideoCalls: group.settings?.allowVideoCalls ?? true,
      allowScreenShare: group.settings?.allowScreenShare ?? true,
      messageRetention: group.settings?.messageRetention ?? 'forever',
      maxMembers: group.settings?.maxMembers ?? 256,
      slowMode: group.settings?.slowMode ?? 0,
      welcomeMessage: group.settings?.welcomeMessage || '',
      groupRules: group.settings?.groupRules || [],
      tags: group.settings?.tags || [],
      location: group.settings?.location || '',
      website: group.settings?.website || '',
      schedule: group.settings?.schedule || {},
    },
  })
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(group.avatar)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [newRule, setNewRule] = useState('')
  const [newTag, setNewTag] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSettingChange = (key) => {
    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: !prev.settings[key],
      },
    }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      setAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Group name is required')
      return
    }

    setLoading(true)
    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('description', formData.description)
      data.append('settings', JSON.stringify(formData.settings))
      if (avatar) {
        data.append('avatar', avatar)
      }

      const response = await api.patch(`/groups/${group._id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success('Group settings updated')
      onUpdate?.(response.data.group)
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update group')
    } finally {
      setLoading(false)
    }
  }

  const handleAddRule = () => {
    if (newRule.trim()) {
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          groupRules: [...prev.settings.groupRules, newRule.trim()]
        }
      }))
      setNewRule('')
    }
  }

  const handleRemoveRule = (index) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        groupRules: prev.settings.groupRules.filter((_, i) => i !== index)
      }
    }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.settings.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          tags: [...prev.settings.tags, newTag.trim()]
        }
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        tags: prev.settings.tags.filter(tag => tag !== tagToRemove)
      }
    }))
  }

  const tabs = [
    { id: 'basic', label: 'Basic', icon: CogIcon },
    { id: 'permissions', label: 'Permissions', icon: ShieldCheckIcon },
    { id: 'features', label: 'Features', icon: UserGroupIcon },
    { id: 'moderation', label: 'Moderation', icon: ExclamationTriangleIcon },
    { id: 'advanced', label: 'Advanced', icon: ChartBarIcon },
  ]

  const settingsOptions = [
    {
      key: 'allowMemberAdd',
      label: 'Allow members to add others',
      description: 'Members can add new people to this group',
      category: 'permissions'
    },
    {
      key: 'allowMemberRemove',
      label: 'Allow members to remove others',
      description: 'Members can remove other members from this group',
      category: 'permissions'
    },
    {
      key: 'allowEditInfo',
      label: 'Allow members to edit group info',
      description: 'Members can change group name, photo, and description',
      category: 'permissions'
    },
    {
      key: 'approveMembers',
      label: 'Approve new members',
      description: 'Admins must approve new members before they can join',
      category: 'permissions'
    },
    {
      key: 'muteAll',
      label: 'Only admins can send messages',
      description: 'Convert group to announcement-only mode',
      category: 'permissions'
    },
    {
      key: 'allowReactions',
      label: 'Allow reactions',
      description: 'Members can react to messages with emojis',
      category: 'features'
    },
    {
      key: 'allowPolls',
      label: 'Allow polls',
      description: 'Members can create and participate in polls',
      category: 'features'
    },
    {
      key: 'allowEvents',
      label: 'Allow events',
      description: 'Members can create and manage group events',
      category: 'features'
    },
    {
      key: 'allowFileSharing',
      label: 'Allow file sharing',
      description: 'Members can share files and documents',
      category: 'features'
    },
    {
      key: 'allowVoiceMessages',
      label: 'Allow voice messages',
      description: 'Members can send voice notes',
      category: 'features'
    },
    {
      key: 'allowVideoCalls',
      label: 'Allow video calls',
      description: 'Members can start video calls in the group',
      category: 'features'
    },
    {
      key: 'allowScreenShare',
      label: 'Allow screen sharing',
      description: 'Members can share their screen during calls',
      category: 'features'
    },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Group Settings" size="xl">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Basic Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex justify-center">
                <label className="relative cursor-pointer group">
                  <Avatar
                    src={avatarPreview}
                    alt={formData.name}
                    size="xl"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <CameraIcon className="w-8 h-8 text-white" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>

              {/* Name */}
              <Input
                label="Group Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                maxLength={100}
              />

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  className="input-field resize-none"
                  placeholder="What's this group about?"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.description.length}/500
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.settings.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-primary-900 dark:hover:text-primary-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Add a tag..."
                    className="flex-1 input-field text-sm"
                  />
                  <Button onClick={handleAddTag} size="sm">
                    Add
                  </Button>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <MapPinIcon className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.settings.location}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, location: e.target.value }
                  }))}
                  placeholder="City, Country"
                  className="input-field"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <LinkIcon className="w-4 h-4 inline mr-1" />
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.settings.website}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, website: e.target.value }
                  }))}
                  placeholder="https://example.com"
                  className="input-field"
                />
              </div>
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Group Permissions</h3>
              {settingsOptions.filter(option => option.category === 'permissions').map((option) => (
                <label
                  key={option.key}
                  className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.settings[option.key]}
                    onChange={() => handleSettingChange(option.key)}
                    className="mt-1 w-4 h-4 text-primary-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Group Features</h3>
              {settingsOptions.filter(option => option.category === 'features').map((option) => (
                <label
                  key={option.key}
                  className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.settings[option.key]}
                    onChange={() => handleSettingChange(option.key)}
                    className="mt-1 w-4 h-4 text-primary-600 rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}

              {/* Max Members */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maximum Members
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={formData.settings.maxMembers}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, maxMembers: parseInt(e.target.value) || 256 }
                  }))}
                  className="input-field"
                />
              </div>

              {/* Slow Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <ClockIcon className="w-4 h-4 inline mr-1" />
                  Slow Mode (seconds between messages)
                </label>
                <input
                  type="number"
                  min="0"
                  max="21600"
                  value={formData.settings.slowMode}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, slowMode: parseInt(e.target.value) || 0 }
                  }))}
                  placeholder="0 = disabled"
                  className="input-field"
                />
              </div>
            </div>
          )}

          {/* Moderation Tab */}
          {activeTab === 'moderation' && (
            <div className="space-y-6">
              {/* Welcome Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Welcome Message
                </label>
                <textarea
                  value={formData.settings.welcomeMessage}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, welcomeMessage: e.target.value }
                  }))}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Message sent to new members when they join..."
                />
              </div>

              {/* Group Rules */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Group Rules
                </label>
                <div className="space-y-2 mb-3">
                  {formData.settings.groupRules.map((rule, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                        {index + 1}. {rule}
                      </span>
                      <button
                        onClick={() => handleRemoveRule(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddRule()}
                    placeholder="Add a new rule..."
                    className="flex-1 input-field text-sm"
                  />
                  <Button onClick={handleAddRule} size="sm">
                    Add
                  </Button>
                </div>
              </div>

              {/* Message Retention */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message Retention
                </label>
                <select
                  value={formData.settings.messageRetention}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, messageRetention: e.target.value }
                  }))}
                  className="input-field"
                >
                  <option value="forever">Keep forever</option>
                  <option value="1day">1 day</option>
                  <option value="7days">7 days</option>
                  <option value="30days">30 days</option>
                  <option value="1year">1 year</option>
                </select>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Advanced Settings</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      These settings require technical knowledge. Changes may affect group behavior significantly.
                    </p>
                  </div>
                </div>
              </div>

              {/* Group Statistics */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Group Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {group.members?.length || 0}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Members</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {group.messageCount || 0}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Messages</div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-3">Danger Zone</h3>
                <div className="space-y-3">
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
                        // Handle group deletion
                      }
                    }}
                  >
                    Delete Group
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            fullWidth
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default GroupSettings