import React, { useState } from 'react'
import { CameraIcon, TrashIcon } from '@heroicons/react/24/outline'
import Avatar from '../common/Avatar'
import Input from '../common/Input'
import Button from '../common/Button'
import useAuthStore from '../../store/useAuthStore'
import toast from 'react-hot-toast'

const AccountSettings = () => {
  const { user, updateProfile, updateAvatar } = useAuthStore()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    website: user?.website || '',
    location: user?.location || '',
  })
  const [loading, setLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      const result = await updateAvatar(file)
      if (result.success) {
        setAvatarFile(null)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await updateProfile(formData)
    setLoading(false)

    if (!result.success) {
      // Errors are already shown via toast in the store
    }
  }

  const handleDeleteAccount = async () => {
    if (
      confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      // Implement account deletion
      toast.error('Account deletion not implemented yet')
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Account Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account information and preferences
        </p>
      </div>

      {/* Avatar Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Profile Picture
        </h3>
        <div className="flex items-center gap-6">
          <Avatar src={user?.avatar} alt={user?.name} size="xl" />
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <div className="btn btn-primary flex items-center gap-2">
                <CameraIcon className="w-5 h-5" />
                Change Photo
              </div>
            </label>
            <Button variant="secondary" icon={<TrashIcon className="w-5 h-5" />}>
              Remove
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Profile Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
          />
          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="johndoe"
          />
        </div>

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john@example.com"
        />

        <Input
          label="Phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+1 234 567 8900"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            maxLength={200}
            className="input-field resize-none"
            placeholder="Tell us about yourself..."
          />
          <p className="mt-1 text-xs text-gray-500">{formData.bio.length}/200</p>
        </div>

        <Input
          label="Website"
          name="website"
          type="url"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://example.com"
        />

        <Input
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="City, Country"
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" variant="primary" loading={loading}>
            Save Changes
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-2">
          Danger Zone
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <Button variant="danger" onClick={handleDeleteAccount}>
          Delete Account
        </Button>
      </div>
    </div>
  )
}

export default AccountSettings