import React, { useState, useEffect } from 'react'
import { CameraIcon, TrashIcon } from '@heroicons/react/24/outline'
import Avatar from '../common/Avatar'
import Input from '../common/Input'
import Button from '../common/Button'
import useAuthStore from '../../store/useAuthStore'
import toast from 'react-hot-toast'

const AccountSettings = () => {
  const { user, updateProfile, updateAvatar } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    about: '',
  })

  // Initialize form data when user is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        about: user.about || 'Hey there! I\'m using GBChat',
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setAvatarFile(file)
    const result = await updateAvatar(file)
    if (result.success) {
      setAvatarFile(null)
    } else {
      setAvatarFile(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate
    if (!formData.name || formData.name.trim() === '') {
      toast.error('Name is required')
      return
    }

    setLoading(true)
    const result = await updateProfile(formData)
    setLoading(false)

    if (result.success) {
      toast.success('Profile updated!')
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Account Settings
        </h2>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Manage your account information and preferences
        </p>
      </div>

      {/* Avatar Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Profile Picture
        </h3>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <Avatar src={user?.avatar} alt={user?.name} size="xl" />
          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <div className="btn btn-primary flex items-center gap-2 text-sm md:text-base">
                <CameraIcon className="w-4 h-4 md:w-5 md:h-5" />
                Change Photo
              </div>
            </label>
            <Button variant="secondary" size="sm" icon={<TrashIcon className="w-4 h-4 md:w-5 md:h-5" />}>
              Remove
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm space-y-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
          Profile Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            disabled
          />
        </div>

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
            About
          </label>
          <textarea
            name="about"
            value={formData.about}
            onChange={handleChange}
            rows={3}
            maxLength={200}
            className="input-field resize-none w-full"
            placeholder="Hey there! I'm using GBChat"
          />
          <p className="mt-1 text-xs text-gray-500">{formData.about.length}/200</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
          <Button type="submit" variant="primary" loading={loading} className="w-full sm:w-auto">
            Save Changes
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 md:p-6 border border-red-200 dark:border-red-800">
        <h3 className="text-base md:text-lg font-semibold text-red-900 dark:text-red-400 mb-2">
          Danger Zone
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <Button variant="danger" onClick={handleDeleteAccount} className="w-full sm:w-auto">
          Delete Account
        </Button>
      </div>
    </div>
  )
}

export default AccountSettings