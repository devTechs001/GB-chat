import React, { useState } from 'react'
import { CheckIcon, PhotoIcon } from '@heroicons/react/24/outline'
import Modal from '../common/Modal'
import Button from '../common/Button'
import useThemeStore from '../../store/useThemeStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const WallpaperPicker = ({ isOpen, onClose }) => {
  const { chatWallpaper, setChatWallpaper } = useThemeStore()
  const [selectedWallpaper, setSelectedWallpaper] = useState(chatWallpaper)

  const wallpapers = [
    { id: 'none', name: 'None', color: null, url: null },
    { id: 'default', name: 'Default', color: '#ece5dd' },
    { id: 'dark', name: 'Dark', color: '#0b141a' },
    { id: 'blue', name: 'Blue', color: '#1e3a5f' },
    { id: 'green', name: 'Green', color: '#1a3a2a' },
    { id: 'purple', name: 'Purple', color: '#2a1a3a' },
    { id: 'gradient1', name: 'Gradient 1', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'gradient2', name: 'Gradient 2', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 'gradient3', name: 'Gradient 3', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  ]

  const handleSelect = (wallpaper) => {
    setSelectedWallpaper(wallpaper.id)
  }

  const handleCustomUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedWallpaper({
          id: 'custom',
          url: reader.result,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleApply = () => {
    const wallpaper = wallpapers.find((w) => w.id === selectedWallpaper) || selectedWallpaper
    setChatWallpaper(wallpaper)
    toast.success('Wallpaper applied')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chat Wallpaper" size="lg">
      <div className="space-y-6">
        {/* Wallpaper Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {wallpapers.map((wallpaper) => (
            <button
              key={wallpaper.id}
              onClick={() => handleSelect(wallpaper)}
              className={clsx(
                'aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all',
                selectedWallpaper === wallpaper.id
                  ? 'border-primary-500 ring-2 ring-primary-500/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              )}
            >
              <div
                className="w-full h-full relative"
                style={{
                  backgroundColor: wallpaper.color,
                  background: wallpaper.gradient,
                }}
              >
                {wallpaper.id === 'none' && (
                  <div className="w-full h-full bg-white dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-xs text-gray-500">None</span>
                  </div>
                )}
                
                {selectedWallpaper === wallpaper.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                      <CheckIcon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}

          {/* Custom Upload */}
          <label className={clsx(
            'aspect-[3/4] rounded-lg overflow-hidden border-2 border-dashed cursor-pointer',
            'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
            'flex flex-col items-center justify-center gap-2'
          )}>
            <PhotoIcon className="w-8 h-8 text-gray-400" />
            <span className="text-xs text-gray-500">Upload</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCustomUpload}
            />
          </label>
        </div>

        {/* Preview */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preview
          </p>
          <div
            className="aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
            style={{
              backgroundColor: wallpapers.find((w) => w.id === selectedWallpaper)?.color,
              background: wallpapers.find((w) => w.id === selectedWallpaper)?.gradient,
              backgroundImage: typeof selectedWallpaper === 'object'
                ? `url(${selectedWallpaper.url})`
                : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="w-full h-full p-4 flex flex-col justify-end gap-2">
              {/* Sample messages */}
              <div className="self-start max-w-[60%] bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow">
                <p className="text-sm">Hey! How are you?</p>
              </div>
              <div className="self-end max-w-[60%] bg-primary-500 text-white px-3 py-2 rounded-lg shadow">
                <p className="text-sm">I'm doing great, thanks!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleApply} fullWidth>
            Apply Wallpaper
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default WallpaperPicker