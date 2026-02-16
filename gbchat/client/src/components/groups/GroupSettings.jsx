import React, { useState } from 'react'
import { CameraIcon } from '@heroicons/react/24/outline'
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
    },
  })
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(group.avatar)
  const [loading, setLoading] = useState(false)

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

  const settingsOptions = [
    {
      key: 'allowMemberAdd',
      label: 'Allow members to add others',
      description: 'Members can add new people to this group',
    },
    {
      key: 'allowMemberRemove',
      label: 'Allow members to remove others',
      description: 'Members can remove other members from this group',
    },
    {
      key: 'allowEditInfo',
      label: 'Allow members to edit group info',
      description: 'Members can change group name, photo, and description',
    },
    {
      key: 'approveMembers',
      label: 'Approve new members',
      description: 'Admins must approve new members before they can join',
    },
    {
      key: 'muteAll',
      label: 'Only admins can send messages',
      description: 'Convert group to announcement-only mode',
    },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Group Settings" size="lg">
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

        {/* Settings */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">
            Group Permissions
          </h3>
          
          {settingsOptions.map((option) => (
            <label
              key={option.key}
              className="flex items-start gap-3 cursor-pointer"
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