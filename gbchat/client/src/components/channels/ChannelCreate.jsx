import React, { useState } from 'react'
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'
import Input from '../common/Input'
import TextArea from '../common/TextArea'
import Button from '../common/Button'
import Avatar from '../common/Avatar'
import toast from 'react-hot-toast'

const ChannelCreate = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    description: '',
    category: '',
    avatar: null,
  })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Channel name is required'
    } else if (formData.name.length < 3) {
      newErrors.name = 'Channel name must be at least 3 characters'
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(formData.username)) {
      newErrors.username = 'Username must be 3-30 characters and contain only letters, numbers, and underscores'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('Image size must be less than 5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
        setFormData(prev => ({ ...prev, avatar: file }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    
    try {
      // Simulate API call to create channel
      setTimeout(() => {
        setIsLoading(false)
        toast.success('Channel created successfully!')
        onClose()
      }, 1500)
    } catch (error) {
      setIsLoading(false)
      toast.error('Failed to create channel')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Channel</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {avatarPreview ? (
              <Avatar
                src={avatarPreview}
                alt="Channel avatar preview"
                size="xl"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <PhotoIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-md cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <PhotoIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </label>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Click to upload avatar (optional)
          </p>
        </div>

        {/* Name */}
        <Input
          label="Channel Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Enter channel name"
          required
        />

        {/* Username */}
        <Input
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          placeholder="Enter username (e.g., my_channel)"
          prefix="@"
          required
        />

        {/* Description */}
        <TextArea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          placeholder="Describe your channel..."
          rows={3}
          required
        />

        {/* Category */}
        <Input
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="e.g., Technology, Gaming, Music"
        />

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            Create Channel
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ChannelCreate