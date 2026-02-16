import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  PhotoIcon,
  VideoCameraIcon,
  FaceSmileIcon,
  PaintBrushIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import Modal from '../common/Modal'
import Button from '../common/Button'
import EmojiPicker from '../common/EmojiPicker'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const StoryCreator = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [caption, setCaption] = useState('')
  const [textColor, setTextColor] = useState('#ffffff')
  const [backgroundColor, setBackgroundColor] = useState('#000000')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)

  const colors = [
    '#000000',
    '#ffffff',
    '#ef4444',
    '#f59e0b',
    '#10b981',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
  ]

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    // Validate file
    const isImage = selectedFile.type.startsWith('image/')
    const isVideo = selectedFile.type.startsWith('video/')

    if (!isImage && !isVideo) {
      toast.error('Please select an image or video file')
      return
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      toast.error('File size must be less than 100MB')
      return
    }

    setFile(selectedFile)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleCreate = async () => {
    if (!file && !caption) {
      toast.error('Please select a file or add text')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      if (file) {
        formData.append('media', file)
      }
      formData.append('caption', caption)
      formData.append('textColor', textColor)
      formData.append('backgroundColor', backgroundColor)

      const { data } = await api.post('/stories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          // You can show progress here
          console.log(`Upload progress: ${progress}%`)
        },
      })

      toast.success('Story created successfully')
      onSuccess(data.story)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create story')
    } finally {
      setIsUploading(false)
    }
  }

  const isVideo = file?.type.startsWith('video/')

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Create Story"
      size="lg"
      closeOnOverlayClick={!isUploading}
    >
      <div className="space-y-4">
        {/* Preview Area */}
        <div
          className="relative aspect-[9/16] max-h-[600px] rounded-lg overflow-hidden"
          style={{ backgroundColor }}
        >
          {preview ? (
            <>
              {isVideo ? (
                <video
                  ref={videoRef}
                  src={preview}
                  className="w-full h-full object-cover"
                  controls
                />
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Caption Overlay */}
              {caption && (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <p
                    className="text-center text-2xl font-bold break-words max-w-full"
                    style={{ color: textColor }}
                  >
                    {caption}
                  </p>
                </div>
              )}

              {/* Remove File Button */}
              <button
                onClick={() => {
                  setFile(null)
                  setPreview(null)
                }}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              {caption ? (
                <p
                  className="text-center text-3xl font-bold break-words max-w-full px-4"
                  style={{ color: textColor }}
                >
                  {caption}
                </p>
              ) : (
                <div className="text-center">
                  <PhotoIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Select a photo or video
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upload Buttons */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<PhotoIcon className="w-5 h-5" />}
            onClick={() => fileInputRef.current?.click()}
            fullWidth
          >
            Photo/Video
          </Button>
        </div>

        {/* Caption Input */}
        <div className="relative">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            maxLength={200}
            rows={3}
            className="input-field resize-none pr-12"
          />
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute bottom-3 right-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <FaceSmileIcon className="w-5 h-5 text-gray-400" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2">
              <EmojiPicker
                onSelect={(emoji) => {
                  setCaption((prev) => prev + emoji)
                  setShowEmojiPicker(false)
                }}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          )}
        </div>

        {/* Color Pickers */}
        <div className="grid grid-cols-2 gap-4">
          {/* Text Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Text Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setTextColor(color)}
                  className={clsx(
                    'w-8 h-8 rounded-full border-2 transition-transform',
                    textColor === color
                      ? 'border-primary-500 scale-110'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Background
            </label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setBackgroundColor(color)}
                  className={clsx(
                    'w-8 h-8 rounded-full border-2 transition-transform',
                    backgroundColor === color
                      ? 'border-primary-500 scale-110'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isUploading}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            loading={isUploading}
            disabled={isUploading || (!file && !caption)}
            fullWidth
          >
            Share Story
          </Button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </Modal>
  )
}

export default StoryCreator