import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

// Default WhatsApp-style wallpaper pattern
const DEFAULT_WALLPAPER = "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23dcfce7' fill-opacity='0.4'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm10-8a8 8 0 1 0 0 16 8 8 0 0 0 0-16z'/%3E%3Cpath d='M30 30c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm10-8a8 8 0 1 0 0 16 8 8 0 0 0 0-16z'/%3E%3Cpath d='M70 70c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm10-8a8 8 0 1 0 0 16 8 8 0 0 0 0-16z'/%3E%3Cpath d='M30 70c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm10-8a8 8 0 1 0 0 16 8 8 0 0 0 0-16z'/%3E%3Cpath d='M70 30c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm10-8a8 8 0 1 0 0 16 8 8 0 0 0 0-16z'/%3E%3C/g%3E%3C/svg%3E"

// Predefined wallpaper collection
const WALLPAPERS = [
  {
    id: 'default',
    name: 'WhatsApp Default',
    url: DEFAULT_WALLPAPER,
    type: 'pattern',
    preview: 'bg-[#e5e5e5]',
  },
  {
    id: 'dots',
    name: 'Polka Dots',
    url: "data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Ccircle cx='2' cy='2' r='2'/%3E%3Ccircle cx='12' cy='2' r='2'/%3E%3Ccircle cx='2' cy='12' r='2'/%3E%3Ccircle cx='12' cy='12' r='2'/%3E%3C/g%3E%3C/svg%3E",
    type: 'pattern',
    preview: 'bg-gray-200',
  },
  {
    id: 'stripes',
    name: 'Diagonal Stripes',
    url: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2325D366' fill-opacity='0.1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E",
    type: 'pattern',
    preview: 'bg-green-50',
  },
  {
    id: 'waves',
    name: 'Waves',
    url: "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2306b6d4' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E",
    type: 'pattern',
    preview: 'bg-cyan-50',
  },
  {
    id: 'gradient-blue',
    name: 'Blue Gradient',
    url: "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23dbeafe;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%2393c5fd;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grad)'/%3E%3C/svg%3E",
    type: 'gradient',
    preview: 'bg-gradient-to-br from-blue-100 to-blue-300',
  },
  {
    id: 'gradient-purple',
    name: 'Purple Gradient',
    url: "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f3e8ff;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23c084fc;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grad)'/%3E%3C/svg%3E",
    type: 'gradient',
    preview: 'bg-gradient-to-br from-purple-100 to-purple-300',
  },
  {
    id: 'gradient-sunset',
    name: 'Sunset Gradient',
    url: "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23fef3c7;stop-opacity:1' /%3E%3Cstop offset='50%25' style='stop-color:%23fdba74;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23f97316;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grad)'/%3E%3C/svg%3E",
    type: 'gradient',
    preview: 'bg-gradient-to-br from-yellow-100 via-orange-200 to-orange-400',
  },
  {
    id: 'gradient-forest',
    name: 'Forest Gradient',
    url: "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23dcfce7;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%2322c55e;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grad)'/%3E%3C/svg%3E",
    type: 'gradient',
    preview: 'bg-gradient-to-br from-green-100 to-green-400',
  },
  {
    id: 'dark-dots',
    name: 'Dark Dots',
    url: "data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231f2937' fill-opacity='0.3'%3E%3Ccircle cx='2' cy='2' r='2'/%3E%3Ccircle cx='12' cy='2' r='2'/%3E%3Ccircle cx='2' cy='12' r='2'/%3E%3Ccircle cx='12' cy='12' r='2'/%3E%3C/g%3E%3C/svg%3E",
    type: 'pattern',
    preview: 'bg-gray-700',
  },
  {
    id: 'dark-gradient',
    name: 'Dark Gradient',
    url: "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%231f2937;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23111827;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grad)'/%3E%3C/svg%3E",
    type: 'gradient',
    preview: 'bg-gradient-to-br from-gray-700 to-gray-900',
  },
  {
    id: 'nature-leaves',
    name: 'Nature Leaves',
    url: "data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2322c55e' fill-opacity='0.15'%3E%3Cpath d='M40 40 L50 30 L60 40 L50 50 Z'/%3E%3Cpath d='M20 20 L30 10 L40 20 L30 30 Z'/%3E%3Cpath d='M60 60 L70 50 L80 60 L70 70 Z'/%3E%3C/g%3E%3C/svg%3E",
    type: 'pattern',
    preview: 'bg-green-50',
  },
  {
    id: 'ocean-waves',
    name: 'Ocean Waves',
    url: "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230ea5e9' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E",
    type: 'pattern',
    preview: 'bg-blue-50',
  },
]

const WallpaperSelector = ({ isOpen, onClose, onSelect, currentWallpaper }) => {
  const [selectedCategory, setSelectedCategory] = React.useState('all')
  
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'pattern', label: 'Patterns' },
    { id: 'gradient', label: 'Gradients' },
  ]

  const filteredWallpapers = selectedCategory === 'all' 
    ? WALLPAPERS 
    : WALLPAPERS.filter(w => w.type === selectedCategory)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 pointer-events-auto"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative bg-white dark:bg-gray-900 w-full md:max-w-2xl md:rounded-2xl shadow-2xl pointer-events-auto flex flex-col max-h-[90vh] md:max-h-[80vh] overflow-hidden"
      >
        {/* Handle for mobile */}
        <div className="md:hidden flex items-center justify-center py-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-500 to-primary-600 md:rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Choose Wallpaper</h2>
              <p className="text-xs text-white/80">Customize your chat background</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mt-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={clsx(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  selectedCategory === cat.id
                    ? 'bg-white text-primary-600 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Wallpaper Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredWallpapers.map((wallpaper) => (
              <button
                key={wallpaper.id}
                onClick={() => {
                  onSelect(wallpaper.url)
                  onClose()
                }}
                className={clsx(
                  'relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:shadow-lg',
                  currentWallpaper === wallpaper.url
                    ? 'border-primary-500 ring-2 ring-primary-500/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                )}
              >
                {/* Preview */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url('${wallpaper.url}')`,
                    backgroundSize: wallpaper.type === 'pattern' ? 'auto' : 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                
                {/* Check mark for selected */}
                {currentWallpaper === wallpaper.url && (
                  <div className="absolute top-2 right-2 bg-primary-500 text-white rounded-full p-1 shadow-lg">
                    <CheckIcon className="w-4 h-4" />
                  </div>
                )}

                {/* Name overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-white text-xs font-medium truncate">{wallpaper.name}</p>
                </div>
              </button>
            ))}

            {/* Custom URL option */}
            <CustomWallpaperOption onSelect={onSelect} onClose={onClose} />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 md:rounded-b-2xl">
          <button
            onClick={() => {
              onSelect(null)
              onClose()
            }}
            className="w-full py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Reset to Default
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// Custom URL input option
const CustomWallpaperOption = ({ onSelect, onClose }) => {
  const [showInput, setShowInput] = React.useState(false)
  const [url, setUrl] = React.useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (url.trim()) {
      onSelect(url.trim())
      setUrl('')
      setShowInput(false)
      onClose()
    }
  }

  if (showInput) {
    return (
      <div className="col-span-2 md:col-span-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-primary-500">
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Custom Wallpaper URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/wallpaper.jpg"
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
            autoFocus
          />
          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              className="flex-1 py-2 bg-primary-500 text-white rounded-lg font-medium text-sm hover:bg-primary-600"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => {
                setShowInput(false)
                setUrl('')
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowInput(true)}
      className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
    >
      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Custom URL</span>
    </button>
  )
}

export default WallpaperSelector
export { WALLPAPERS, DEFAULT_WALLPAPER }
