import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  SwatchIcon,
  PhotoIcon,
  ArrowPathIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'
import useThemeStore from '../../store/useThemeStore'
import Button from '../common/Button'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const AppearanceSettings = () => {
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    chatWallpaper,
    setChatWallpaper,
    getAvailableThemes,
  } = useThemeStore()

  const [customColors, setCustomColors] = useState({
    primary: '#0ea5e9',
    secondary: '#64748b',
    accent: '#f97316',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
  })

  const [previewMode, setPreviewMode] = useState(false)
  const [selectedWallpaper, setSelectedWallpaper] = useState(null)

  const themes = [
    { id: 'light', name: 'Light', icon: SunIcon, preview: 'bg-white' },
    { id: 'dark', name: 'Dark', icon: MoonIcon, preview: 'bg-gray-900' },
    { id: 'auto', name: 'System', icon: ComputerDesktopIcon, preview: 'bg-gradient-to-r from-white to-gray-900' },
  ]

  const customThemes = [
    { id: 'ocean', name: 'Ocean', colors: ['#0891b2', '#0e7490', '#155e75'] },
    { id: 'sunset', name: 'Sunset', colors: ['#f97316', '#ea580c', '#dc2626'] },
    { id: 'forest', name: 'Forest', colors: ['#22c55e', '#16a34a', '#15803d'] },
    { id: 'lavender', name: 'Lavender', colors: ['#a78bfa', '#8b5cf6', '#7c3aed'] },
    { id: 'rose', name: 'Rose Gold', colors: ['#f43f5e', '#e11d48', '#be123c'] },
    { id: 'midnight', name: 'Midnight', colors: ['#3730a3', '#312e81', '#1e1b4b'] },
  ]

  const fontSizes = [
    { id: 'small', label: 'Small', size: '14px' },
    { id: 'medium', label: 'Medium', size: '16px' },
    { id: 'large', label: 'Large', size: '18px' },
    { id: 'xlarge', label: 'Extra Large', size: '20px' },
  ]

  const wallpapers = [
    { id: 'none', name: 'None', thumbnail: null },
    { id: 'default', name: 'Default', thumbnail: '/wallpapers/default-thumb.jpg', url: '/wallpapers/default.jpg' },
    { id: 'abstract', name: 'Abstract', thumbnail: '/wallpapers/abstract-thumb.jpg', url: '/wallpapers/abstract.jpg' },
    { id: 'gradient1', name: 'Gradient Blue', thumbnail: '/wallpapers/gradient1-thumb.jpg', url: '/wallpapers/gradient1.jpg' },
    { id: 'gradient2', name: 'Gradient Purple', thumbnail: '/wallpapers/gradient2-thumb.jpg', url: '/wallpapers/gradient2.jpg' },
    { id: 'pattern1', name: 'Pattern Dots', thumbnail: '/wallpapers/pattern1-thumb.jpg', url: '/wallpapers/pattern1.jpg' },
    { id: 'custom', name: 'Custom', thumbnail: null },
  ]

  const handleThemeChange = (themeId) => {
    setTheme(themeId)
    toast.success(`Theme changed to ${themes.find(t => t.id === themeId)?.name}`)
  }

  const handleCustomThemeApply = (themeData) => {
    // Apply custom theme
    Object.entries(themeData.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value)
    })
    toast.success(`Applied ${themeData.name} theme`)
  }

  const handleWallpaperUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Wallpaper size should be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setChatWallpaper(reader.result)
        toast.success('Custom wallpaper applied')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleResetToDefaults = () => {
    if (confirm('Are you sure you want to reset all appearance settings to defaults?')) {
      setTheme('light')
      setFontSize('medium')
      setChatWallpaper(null)
      toast.success('Appearance settings reset to defaults')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Appearance
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize how GBChat looks on your device
        </p>
      </div>

      {/* Theme Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Theme
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon
            return (
              <button
                key={themeOption.id}
                onClick={() => handleThemeChange(themeOption.id)}
                className={clsx(
                  'relative p-4 rounded-lg border-2 transition-all',
                  'hover:shadow-md',
                  theme === themeOption.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                {theme === themeOption.id && (
                  <div className="absolute top-2 right-2">
                    <CheckIcon className="w-5 h-5 text-primary-600" />
                  </div>
                )}
                <Icon className="w-8 h-8 mx-auto mb-2 text-gray-700 dark:text-gray-300" />
                <p className="font-medium text-gray-900 dark:text-white">
                  {themeOption.name}
                </p>
                <div className={clsx('mt-2 h-2 rounded-full', themeOption.preview)} />
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom Themes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Color Themes
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Exit Preview' : 'Preview'}
          </Button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {customThemes.map((customTheme) => (
            <motion.button
              key={customTheme.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCustomThemeApply(customTheme)}
              className="relative group"
            >
              <div className="aspect-square rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                <div className="h-full w-full flex">
                  {customTheme.colors.map((color, index) => (
                    <div
                      key={index}
                      className="flex-1"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                {customTheme.name}
              </p>
            </motion.button>
          ))}
        </div>

        {/* Custom Color Picker */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Custom Colors
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(customColors).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => setCustomColors(prev => ({
                    ...prev,
                    [key]: e.target.value
                  }))}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <div>
                  <p className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                    {key}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={() => handleCustomThemeApply({ name: 'Custom', colors: customColors })}
          >
            Apply Custom Theme
          </Button>
        </div>
      </div>

      {/* Font Size */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Font Size
        </h3>
        <div className="space-y-3">
          {fontSizes.map((size) => (
            <label
              key={size.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="fontSize"
                  value={size.id}
                  checked={fontSize === size.id}
                  onChange={() => setFontSize(size.id)}
                  className="w-4 h-4 text-primary-600"
                />
                <span
                  className="text-gray-900 dark:text-white"
                  style={{ fontSize: size.size }}
                >
                  {size.label}
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {size.size}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Chat Wallpaper */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Chat Wallpaper
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {wallpapers.map((wallpaper) => (
            <button
              key={wallpaper.id}
              onClick={() => {
                if (wallpaper.id === 'custom') {
                  document.getElementById('wallpaper-upload').click()
                } else {
                  setChatWallpaper(wallpaper.url)
                  setSelectedWallpaper(wallpaper.id)
                }
              }}
              className={clsx(
                'aspect-[9/16] rounded-lg overflow-hidden border-2 transition-all',
                selectedWallpaper === wallpaper.id
                  ? 'border-primary-500 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              )}
            >
              {wallpaper.thumbnail ? (
                <img
                  src={wallpaper.thumbnail}
                  alt={wallpaper.name}
                  className="w-full h-full object-cover"
                />
              ) : wallpaper.id === 'none' ? (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">None</span>
                </div>
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <PhotoIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </button>
          ))}
        </div>
        <input
          id="wallpaper-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleWallpaperUpload}
        />
      </div>

      {/* Additional Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Additional Options
        </h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                High Contrast Mode
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Increase contrast for better visibility
              </p>
            </div>
            <input
              type="checkbox"
              className="toggle-switch"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Reduce Motion
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Minimize animations and transitions
              </p>
            </div>
            <input
              type="checkbox"
              className="toggle-switch"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Compact Mode
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Reduce spacing for more content
              </p>
            </div>
            <input
              type="checkbox"
              className="toggle-switch"
            />
          </label>
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button
          variant="secondary"
          icon={<ArrowPathIcon className="w-5 h-5" />}
          onClick={handleResetToDefaults}
        >
          Reset to Defaults
        </Button>
      </div>
    </div>
  )
}

export default AppearanceSettings