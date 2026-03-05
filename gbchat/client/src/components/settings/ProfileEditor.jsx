import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CameraIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  SparklesIcon,
  ScissorsIcon,
  AdjustmentsHorizontalIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import Avatar from '../common/Avatar'
import Button from '../common/Button'
import Modal from '../common/Modal'
import AvatarCreator from '../enhanced/AvatarCreator'
import useAuthStore from '../../store/useAuthStore'
import toast from 'react-hot-toast'

// Supported image types
const ACCEPTED_IMAGE_TYPES = {
  'image/jpeg': '.jpg, .jpeg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'image/bmp': '.bmp',
}

const ACCEPTED_TYPES_STRING = Object.keys(ACCEPTED_IMAGE_TYPES).join(',')
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MIN_FILE_SIZE = 10 * 1024 // 10KB

const ProfileEditor = () => {
  const { user, updateAvatar, updateProfile } = useAuthStore()
  const fileInputRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showAvatarCreator, setShowAvatarCreator] = useState(false)
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false)
  const [avatarConfig, setAvatarConfig] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    about: '',
  })
  const [isEditing, setIsEditing] = useState(false)

  // Advanced editing tools state
  const [editTools, setEditTools] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    rotate: 0,
    flipH: false,
    flipV: false,
  })

  // Initialize form data from user
  React.useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        about: user.about || 'Hey there! I\'m using GBChat',
      })
    }
  }, [user])

  // Validate image file
  const validateImageFile = useCallback((file) => {
    // Check file type
    if (!ACCEPTED_IMAGE_TYPES[file.type]) {
      const supportedFormats = Object.keys(ACCEPTED_IMAGE_TYPES)
        .map(type => type.split('/')[1].toUpperCase())
        .join(', ')
      toast.error(`Unsupported file type. Please use: ${supportedFormats}`)
      return false
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image size should be less than 5MB')
      return false
    }

    if (file.size < MIN_FILE_SIZE) {
      toast.error('Image file is too small')
      return false
    }

    return true
  }, [])

  // Handle file selection
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!validateImageFile(file)) {
      e.target.value = ''
      return
    }

    setSelectedFile(file)

    // Create preview URL
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setShowModal(true)

    // Cleanup preview URL on unmount
    return () => URL.revokeObjectURL(objectUrl)
  }, [validateImageFile])

  // Handle drag and drop
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files[0]
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please drop an image file')
      return
    }

    if (!validateImageFile(file)) return

    setSelectedFile(file)
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setShowModal(true)
  }, [validateImageFile])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  // Upload avatar
  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      const result = await updateAvatar(selectedFile)
      if (result.success) {
        toast.success('Profile photo updated successfully!')
        handleCloseModal()
      } else {
        toast.error('Failed to upload profile photo')
      }
    } catch (error) {
      toast.error('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  // Remove current avatar
  const handleRemoveAvatar = async () => {
    if (!confirm('Are you sure you want to remove your profile photo?')) return

    // Create empty file to clear avatar
    const emptyFile = new File([''], 'empty.png', { type: 'image/png' })
    try {
      const result = await updateAvatar(emptyFile)
      if (result.success) {
        toast.success('Profile photo removed')
      }
    } catch (error) {
      toast.error('Failed to remove profile photo')
    }
  }

  // Close modal
  const handleCloseModal = useCallback(() => {
    setShowModal(false)
    setPreviewUrl(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Handle avatar creator save
  const handleAvatarCreatorSave = async (file, config) => {
    setIsUploading(true)
    try {
      const result = await updateAvatar(file)
      if (result.success) {
        setAvatarConfig(config)
        toast.success('Custom avatar created and saved!')
        setShowAvatarCreator(false)
      } else {
        toast.error('Failed to save custom avatar')
      }
    } catch (error) {
      toast.error('Failed to save custom avatar')
    } finally {
      setIsUploading(false)
    }
  }

  // Handle advanced editor tools
  const handleToolChange = (tool, value) => {
    setEditTools(prev => ({ ...prev, [tool]: value }))
  }

  const handleResetTools = () => {
    setEditTools({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      rotate: 0,
      flipH: false,
      flipV: false,
    })
  }

  const handleApplyEdits = async () => {
    if (!previewUrl) return

    try {
      // Create canvas to apply filters
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = previewUrl
      })

      canvas.width = img.width
      canvas.height = img.height

      // Apply transformations
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((editTools.rotate * Math.PI) / 180)
      ctx.scale(editTools.flipH ? -1 : 1, editTools.flipV ? -1 : 1)
      ctx.translate(-canvas.width / 2, -canvas.height / 2)

      // Apply filters
      ctx.filter = `
        brightness(${editTools.brightness}%)
        contrast(${editTools.contrast}%)
        saturate(${editTools.saturation}%)
        blur(${editTools.blur}px)
      `

      ctx.drawImage(img, 0, 0)
      ctx.restore()

      // Convert to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      const file = new File([blob], 'edited-avatar.png', { type: 'image/png' })

      const result = await updateAvatar(file)
      if (result.success) {
        toast.success('Photo edits applied successfully!')
        setShowAdvancedEditor(false)
        handleCloseModal()
      }
    } catch (error) {
      toast.error('Failed to apply edits')
    }
  }

  // Handle profile form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Save profile changes
  const handleSaveProfile = async (e) => {
    e.preventDefault()

    if (!formData.fullName.trim()) {
      toast.error('Full name is required')
      return
    }

    try {
      const result = await updateProfile({
        name: formData.fullName,
        phone: formData.phone,
        about: formData.about,
      })

      if (result.success) {
        toast.success('Profile updated successfully!')
        setIsEditing(false)
      }
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handleCancelEdit = () => {
    // Reset form data to user data
    setFormData({
      fullName: user.fullName || '',
      phone: user.phone || '',
      about: user.about || 'Hey there! I\'m using GBChat',
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Profile Editor
        </h2>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Manage your profile information and profile photo
        </p>
      </div>

      {/* Profile Photo Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Profile Photo
        </h3>

        <div
          className="flex flex-col sm:flex-row items-center gap-6"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {/* Avatar with overlay on hover */}
          <div className="relative group">
            <Avatar
              src={user?.avatar}
              alt={user?.fullName}
              size="xl"
              className="w-32 h-32 ring-4 ring-gray-100 dark:ring-gray-700"
            />

            {/* Hover overlay for upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Change profile photo"
            >
              <CameraIcon className="w-8 h-8 text-white" />
            </button>

            {/* Online status indicator */}
            <span
              className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                user?.status === 'online'
                  ? 'bg-green-500'
                  : user?.status === 'busy'
                  ? 'bg-red-500'
                  : user?.status === 'away'
                  ? 'bg-yellow-500'
                  : 'bg-gray-400'
              }`}
            />
          </div>

          {/* Upload instructions */}
          <div className="flex-1 text-center sm:text-left">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              {user?.fullName || 'Your Name'}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Upload a profile photo to help others recognize you
            </p>

            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <label className="cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES_STRING}
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
                <div className="btn btn-primary flex items-center gap-2 text-sm md:text-base">
                  <CameraIcon className="w-4 h-4 md:w-5 md:h-5" />
                  {user?.avatar ? 'Change Photo' : 'Upload Photo'}
                </div>
              </label>

              {/* Custom Avatar Creator Button */}
              <Button
                variant="secondary"
                size="sm"
                icon={<SparklesIcon className="w-4 h-4 md:w-5 md:h-5" />}
                onClick={() => setShowAvatarCreator(true)}
                disabled={isUploading}
              >
                Create Avatar
              </Button>

              {/* Advanced Editor Button */}
              {user?.avatar && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<AdjustmentsHorizontalIcon className="w-4 h-4 md:w-5 md:h-5" />}
                  onClick={() => setShowAdvancedEditor(true)}
                  disabled={isUploading}
                >
                  Edit Photo
                </Button>
              )}

              {user?.avatar && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<TrashIcon className="w-4 h-4 md:w-5 md:h-5" />}
                  onClick={handleRemoveAvatar}
                  disabled={isUploading}
                >
                  Remove
                </Button>
              )}
            </div>

            {/* Supported formats */}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              Supported formats: JPG, PNG, GIF, WEBP, SVG, BMP (Max 5MB)
            </p>
          </div>
        </div>
      </div>

      {/* Profile Information Form */}
      <form onSubmit={handleSaveProfile} className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
            Profile Information
          </h3>
          {!isEditing ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={<CheckIcon className="w-4 h-4" />}
              >
                Save
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="John Doe"
              className={`input-field w-full ${
                !isEditing
                  ? 'bg-gray-50 dark:bg-gray-900 cursor-not-allowed'
                  : ''
              }`}
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              placeholder="your@email.com"
              className="input-field w-full bg-gray-50 dark:bg-gray-900 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="+1 234 567 8900"
              className={`input-field w-full ${
                !isEditing
                  ? 'bg-gray-50 dark:bg-gray-900 cursor-not-allowed'
                  : ''
              }`}
            />
          </div>

          {/* About/Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              About
            </label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows={4}
              maxLength={200}
              placeholder="Tell others about yourself..."
              className={`input-field resize-none w-full ${
                !isEditing
                  ? 'bg-gray-50 dark:bg-gray-900 cursor-not-allowed'
                  : ''
              }`}
            />
            <p className="text-xs text-gray-400 mt-1">
              {formData.about.length}/200 characters
            </p>
          </div>
        </div>
      </form>

      {/* Profile Photo Preview Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        size="md"
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Preview Profile Photo
            </h3>
            <button
              onClick={handleCloseModal}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Image Preview */}
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 mb-4 rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-gray-700">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <CameraIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* File info */}
            {selectedFile && (
              <div className="text-center mb-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 w-full">
              <Button
                variant="secondary"
                fullWidth
                onClick={handleCloseModal}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleUpload}
                loading={isUploading}
                icon={<CheckIcon className="w-5 h-5" />}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Tip:</strong> For best results, use a square image at least 200x200 pixels.
            </p>
          </div>
        </div>
      </Modal>

      {/* Avatar Creator Modal */}
      {showAvatarCreator && (
        <AvatarCreator
          onClose={() => setShowAvatarCreator(false)}
          onSave={handleAvatarCreatorSave}
          initialAvatar={avatarConfig}
        />
      )}

      {/* Advanced Photo Editor Modal */}
      <Modal
        isOpen={showAdvancedEditor}
        onClose={() => setShowAdvancedEditor(false)}
        size="lg"
      >
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Photo Editor
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Adjust and enhance your profile photo
              </p>
            </div>
            <button
              onClick={() => setShowAdvancedEditor(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preview */}
            <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div
                className="relative w-48 h-48 rounded-lg overflow-hidden ring-4 ring-gray-200 dark:ring-gray-700"
                style={{
                  transform: `rotate(${editTools.rotate}deg) scaleX(${editTools.flipH ? -1 : 1}) scaleY(${editTools.flipV ? -1 : 1})`,
                  filter: `brightness(${editTools.brightness}%) contrast(${editTools.contrast}%) saturate(${editTools.saturation}%) blur(${editTools.blur}px)`,
                  transition: 'all 0.3s ease',
                }}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <PhotoIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Tools */}
            <div className="space-y-4">
              {/* Brightness */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Brightness: {editTools.brightness}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={editTools.brightness}
                  onChange={(e) => handleToolChange('brightness', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contrast: {editTools.contrast}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={editTools.contrast}
                  onChange={(e) => handleToolChange('contrast', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Saturation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Saturation: {editTools.saturation}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={editTools.saturation}
                  onChange={(e) => handleToolChange('saturation', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Blur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Blur: {editTools.blur}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={editTools.blur}
                  onChange={(e) => handleToolChange('blur', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Rotate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rotate: {editTools.rotate}°
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleToolChange('rotate', editTools.rotate - 90)}
                  >
                    -90°
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleToolChange('rotate', 0)}
                  >
                    0°
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleToolChange('rotate', editTools.rotate + 90)}
                  >
                    +90°
                  </Button>
                </div>
              </div>

              {/* Flip */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Flip
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={editTools.flipH ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleToolChange('flipH', !editTools.flipH)}
                  >
                    Horizontal
                  </Button>
                  <Button
                    variant={editTools.flipV ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleToolChange('flipV', !editTools.flipV)}
                  >
                    Vertical
                  </Button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={handleResetTools}
                  icon={<ArrowPathIcon className="w-5 h-5" />}
                >
                  Reset
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleApplyEdits}
                  icon={<CheckIcon className="w-5 h-5" />}
                >
                  Apply Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ProfileEditor
