import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PhotoIcon,
  ArrowPathIcon,
  CheckIcon,
  PaintBrushIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  FilmIcon,
  TrashIcon,
  ArrowUpCircleIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline'
import useThemeStore from '../../store/useThemeStore'
import WallpaperGallery from './WallpaperGallery'
import { resolveWallpaper, serializeWallpaper } from '../../lib/wallpapers'
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
    resetAppearance,
  } = useThemeStore()

  const [selectedWallpaper, setSelectedWallpaper] = useState(null)
  const [autoCacheClean, setAutoCacheClean] = useState(false)
  const [autoUpdate, setAutoUpdate] = useState(false)
  const [updateEmail, setUpdateEmail] = useState('')
  const [messageStatusStyle, setMessageStatusStyle] = useState('default')
  const [wallpaperBlur, setWallpaperBlur] = useState(0)
  const [wallpaperOpacity, setWallpaperOpacity] = useState(50)

  const allThemes = getAvailableThemes()

  const fontSizes = [
    { id: 'small', label: 'Small', size: '14px' },
    { id: 'medium', label: 'Medium', size: '16px' },
    { id: 'large', label: 'Large', size: '18px' },
    { id: 'xlarge', label: 'Extra Large', size: '20px' },
  ]

  const bubbleStyles = [
    { id: 'modern', name: 'Modern', preview: 'rounded-2xl', description: 'Clean rounded corners' },
    { id: 'classic', name: 'Classic', preview: 'rounded-lg', description: 'Subtle rounding' },
    { id: 'minimal', name: 'Minimal', preview: 'rounded-md', description: 'Slight rounding' },
    { id: 'rounded', name: 'Bubble', preview: 'rounded-3xl', description: 'Fully rounded' },
    { id: 'sharp', name: 'Sharp', preview: 'rounded-none', description: 'No rounding' },
    { id: 'organic', name: 'Organic', preview: 'rounded-2xl', description: 'Natural curves' },
  ]

  const messageStatusStyles = [
    { id: 'default', name: 'Default', icon: 'double' },
    { id: 'minimal', name: 'Minimal', icon: 'single' },
    { id: 'dots', name: 'Dots', icon: 'dot' },
    { id: 'bars', name: 'Bars', icon: 'bar' },
    { id: 'circles', name: 'Circles', icon: 'circle' },
  ]

  const chatEffects = [
    { id: 'none', name: 'None', icon: SparklesIcon },
    { id: 'particles', name: 'Particles', icon: SparklesIcon },
    { id: 'snow', name: 'Snow', icon: MoonIcon },
    { id: 'hearts', name: 'Hearts', icon: SparklesIcon },
    { id: 'stars', name: 'Stars', icon: SunIcon },
  ]

  const messageAnimations = [
    { id: 'slide', name: 'Slide In' },
    { id: 'fade', name: 'Fade In' },
    { id: 'pop', name: 'Pop In' },
    { id: 'none', name: 'None' },
  ]

  const handleThemeChange = (themeId) => {
    setTheme(themeId)
    const themeData = allThemes[themeId]
    toast.success(`Theme changed to ${themeData?.name || themeId}`)
  }

  /**
   * Apply a wallpaper chosen in the gallery. The value is serialized
   * ({ kind, value }) and mirrored into `global-wallpaper` in the shape the
   * chat area reads, so the background changes immediately as well as on the
   * next launch.
   */
  const applyWallpaper = (serialized, wallpaper) => {
    setChatWallpaper(serialized)
    setSelectedWallpaper(wallpaper?.id || serialized?.id || 'custom')
    try {
      const css = resolveWallpaper(serialized)
      localStorage.setItem('global-wallpaper', JSON.stringify(serializeWallpaper(serialized)))
      window.dispatchEvent(
        new CustomEvent('global-wallpaper-change', { detail: { wallpaper: css } })
      )
    } catch {
      /* private mode / quota — the store copy still applies */
    }
    toast.success(wallpaper?.name ? `${wallpaper.name} applied` : 'Wallpaper applied')
  }

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all appearance settings to defaults?')) {
      resetAppearance()
      toast.success('Appearance settings reset to defaults')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <PaintBrushIcon className="w-6 h-6 text-primary-500" />
          Appearance
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize how GBChat looks — themes, effects, and more
        </p>
      </div>

      {/* Theme Selection Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Themes</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {Object.keys(allThemes).length} themes — each one changes the whole app palette.
        </p>
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
              {/* Palette preview: accent, surface, canvas */}
              <div
                className="w-full h-10 rounded-lg mb-2 flex overflow-hidden ring-1 ring-black/5"
                style={{ background: themeData.background }}
              >
                <span className="w-1/4 h-full" style={{ background: themeData.primary }} />
                <span
                  className="w-1/4 h-full"
                  style={{ background: themeData.surface }}
                />
                <span
                  className="flex-1 h-full border-l border-black/10"
                  style={{ background: themeData.surfaceAlt }}
                />
              </div>
              <div className="flex items-center gap-1.5">
                {themeData.mode === 'dark' ? (
                  <MoonIcon className="w-3.5 h-3.5 text-gray-400" />
                ) : (
                  <SunIcon className="w-3.5 h-3.5 text-amber-500" />
                )}
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary-500" />
          Bubble style
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-primary-500" />
          Chat effects
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
              <effect.icon className="w-6 h-6 mx-auto mb-1.5 text-primary-500" />
              <p className="text-xs font-medium text-gray-900 dark:text-white">{effect.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Message Animations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FilmIcon className="w-5 h-5 text-primary-500" />
          Message animations
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
        <WallpaperGallery value={selectedWallpaper || chatWallpaper} onChange={applyWallpaper} />
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

      {/* Wallpaper Customization */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          <PhotoIcon className="w-5 h-5 text-primary-500" />
          Wallpaper customization
        </h3>
        <div className="space-y-6">
          {/* Wallpaper Opacity */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Wallpaper Opacity
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">{wallpaperOpacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={wallpaperOpacity}
              onChange={(e) => setWallpaperOpacity(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Wallpaper Blur */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Wallpaper Blur
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">{wallpaperBlur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={wallpaperBlur}
              onChange={(e) => setWallpaperBlur(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Message Status Style */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          <CheckBadgeIcon className="w-5 h-5 text-primary-500" />
          Message status styles
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {messageStatusStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => setMessageStatusStyle(style.id)}
              className={clsx(
                'p-4 rounded-xl border-2 transition-all text-center',
                messageStatusStyle === style.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              )}
            >
              <div className="flex items-center justify-center gap-0.5 mb-1 h-7 text-primary-500">
                {style.icon === 'double' && (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    <CheckIcon className="w-4 h-4 -ml-2" />
                  </>
                )}
                {style.icon === 'single' && <CheckIcon className="w-4 h-4" />}
                {style.icon === 'dot' && <span className="w-2 h-2 rounded-full bg-current" />}
                {style.icon === 'bar' && (
                  <span className="w-6 h-1.5 rounded-full bg-current" />
                )}
                {style.icon === 'circle' && (
                  <span className="w-4 h-4 rounded-full border-2 border-current" />
                )}
              </div>
              <p className="text-xs font-medium text-gray-900 dark:text-white">{style.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Auto Cache Cleaner */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          <TrashIcon className="w-5 h-5 text-primary-500" />
          Auto cache cleaner
        </h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <ArrowPathIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Auto Cache Cleaner</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Automatically clear cache every {autoCacheClean ? '24 hours' : 'week'}
                </p>
              </div>
            </div>
            <div
              onClick={() => setAutoCacheClean(!autoCacheClean)}
              className={clsx(
                'w-14 h-7 rounded-full transition-colors cursor-pointer relative',
                autoCacheClean ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
              )}
            >
              <div
                className={clsx(
                  'w-5 h-5 bg-white rounded-full shadow-md transform transition-transform absolute top-1',
                  autoCacheClean ? 'translate-x-8' : 'translate-x-1'
                )}
              />
            </div>
          </label>

          {autoCacheClean && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-300">
                <CheckCircleIcon className="w-4 h-4 inline mr-1 text-emerald-500" />
            Auto cache cleaner is enabled. Cache will be cleared automatically to free up space.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Auto Update Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          <ArrowUpCircleIcon className="w-5 h-5 text-primary-500" />
          Auto update settings
        </h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <ArrowPathIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Auto Update</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Automatically update GBChat when new versions are available
                </p>
              </div>
            </div>
            <div
              onClick={() => setAutoUpdate(!autoUpdate)}
              className={clsx(
                'w-14 h-7 rounded-full transition-colors cursor-pointer relative',
                autoUpdate ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
              )}
            >
              <div
                className={clsx(
                  'w-5 h-5 bg-white rounded-full shadow-md transform transition-transform absolute top-1',
                  autoUpdate ? 'translate-x-8' : 'translate-x-1'
                )}
              />
            </div>
          </label>

          {autoUpdate && (
            <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email for update notifications
                </span>
                <input
                  type="email"
                  value={updateEmail}
                  onChange={(e) => setUpdateEmail(e.target.value)}
                  placeholder="your-email@gmail.com"
                  className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </label>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <BellIcon className="w-4 h-4 inline mr-1 text-amber-500" />
            You'll receive email notifications at {updateEmail || 'your email'} when new updates are available
              </p>
            </div>
          )}
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