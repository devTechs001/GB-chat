import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
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
    bubbleStyle,
    setBubbleStyle,
    chatEffect,
    setChatEffect,
    messageAnimation,
    setMessageAnimation,
    getAvailableThemes,
  } = useThemeStore()

  const [selectedWallpaper, setSelectedWallpaper] = useState(null)

  const allThemes = getAvailableThemes()

  const fontSizes = [
    { id: 'small', label: 'Small', size: '14px' },
    { id: 'medium', label: 'Medium', size: '16px' },
    { id: 'large', label: 'Large', size: '18px' },
    { id: 'xlarge', label: 'Extra Large', size: '20px' },
  ]

  const bubbleStyles = [
    { id: 'modern', name: 'Modern', preview: 'rounded-2xl' },
    { id: 'classic', name: 'Classic', preview: 'rounded-lg' },
    { id: 'minimal', name: 'Minimal', preview: 'rounded-md' },
    { id: 'rounded', name: 'Bubble', preview: 'rounded-3xl' },
  ]

  const chatEffects = [
    { id: 'none', name: 'None', emoji: '🚫' },
    { id: 'particles', name: 'Particles', emoji: '✨' },
    { id: 'snow', name: 'Snow', emoji: '❄️' },
    { id: 'hearts', name: 'Hearts', emoji: '💕' },
    { id: 'stars', name: 'Stars', emoji: '⭐' },
  ]

  const messageAnimations = [
    { id: 'slide', name: 'Slide In' },
    { id: 'fade', name: 'Fade In' },
    { id: 'pop', name: 'Pop In' },
    { id: 'none', name: 'None' },
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
    const themeData = allThemes[themeId]
    toast.success(`Theme changed to ${themeData?.name || themeId}`)
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
      setBubbleStyle('modern')
      setChatEffect('none')
      setMessageAnimation('slide')
      toast.success('Appearance settings reset to defaults')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🎨 Appearance
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize how GBChat looks — themes, effects, and more
        </p>
      </div>

      {/* Theme Selection Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Themes
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(allThemes).map(([themeId, themeData]) => (
            <motion.button
              key={themeId}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleThemeChange(themeId)}
              className={clsx(
                'relative p-3 rounded-xl border-2 transition-all text-left',
                theme === themeId
                  ? 'border-primary-500 shadow-lg ring-2 ring-primary-500/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
              )}
            >
              {theme === themeId && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                  <CheckIcon className="w-3 h-3 text-white" />
                </div>
              )}
              {/* Color preview strip */}
              <div
                className="w-full h-8 rounded-lg mb-2"
                style={{ background: `linear-gradient(135deg, ${themeData.primary}, ${themeData.background})` }}
              />
              <div className="flex items-center gap-1.5">
                <span className="text-base">{themeData.emoji}</span>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {themeData.name}
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {themeData.description}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bubble Style */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          💬 Bubble Style
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {bubbleStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => setBubbleStyle(style.id)}
              className={clsx(
                'p-4 rounded-xl border-2 transition-all',
                bubbleStyle === style.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              )}
            >
              <div className={clsx('w-full h-6 bg-primary-500 mb-2', style.preview)} />
              <p className="text-sm font-medium text-gray-900 dark:text-white">{style.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Effects */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          ✨ Chat Effects
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {chatEffects.map((effect) => (
            <button
              key={effect.id}
              onClick={() => setChatEffect(effect.id)}
              className={clsx(
                'p-3 rounded-xl border-2 transition-all text-center',
                chatEffect === effect.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              )}
            >
              <span className="text-2xl block mb-1">{effect.emoji}</span>
              <p className="text-xs font-medium text-gray-900 dark:text-white">{effect.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Message Animations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🎬 Message Animations
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {messageAnimations.map((anim) => (
            <button
              key={anim.id}
              onClick={() => setMessageAnimation(anim.id)}
              className={clsx(
                'p-3 rounded-xl border-2 transition-all',
                messageAnimation === anim.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              )}
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white">{anim.name}</p>
            </button>
          ))}
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