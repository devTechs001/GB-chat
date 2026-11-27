import React, { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckIcon, PhotoIcon, SparklesIcon } from '@heroicons/react/24/outline'
import {
  WALLPAPERS,
  WALLPAPER_CATEGORIES,
  DEFAULT_WALLPAPER_ID,
  resolveWallpaper,
  serializeWallpaper,
} from '../../lib/wallpapers'
import clsx from 'clsx'
import toast from 'react-hot-toast'

/**
 * WallpaperGallery — the one wallpaper UI.
 *
 * Renders each wallpaper with the *same* CSS the chat area will use, so what you
 * pick is exactly what you get (no thumbnails, no missing image files).
 *
 * Emits a serialized value (`{ kind: 'css'|'image', value }`) rather than a URL:
 * a 200 KB data-URI per chat used to exhaust localStorage.
 */
const WallpaperGallery = ({ value, onChange, columns = 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5' }) => {
  const [category, setCategory] = useState('all')
  const [preview, setPreview] = useState(null)
  const fileRef = useRef(null)

  const activeId = typeof value === 'string' ? value : value?.id || null

  const list = useMemo(
    () => (category === 'all' ? WALLPAPERS : WALLPAPERS.filter((entry) => entry.category === category)),
    [category]
  )

  const pick = (wallpaper) => {
    setPreview(wallpaper.id)
    onChange?.(serializeWallpaper(wallpaper), wallpaper)
  }

  const handleUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Please choose an image under 4 MB')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      const serialized = { kind: 'image', value: reader.result, id: 'custom' }
      setPreview('custom')
      onChange?.(serialized, { id: 'custom', name: 'Your image' })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-3">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5">
        {WALLPAPER_CATEGORIES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => (entry.id === 'custom' ? fileRef.current?.click() : setCategory(entry.id))}
            className={clsx(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              category === entry.id && entry.id !== 'custom'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            )}
          >
            {entry.id === 'custom' ? 'Upload' : entry.label}
          </button>
        ))}
      </div>

      {/* Swatches */}
      <div className={clsx('grid gap-2.5', columns)}>
        {list.map((wallpaper) => {
          const css = resolveWallpaper(wallpaper)
          const selected = activeId === wallpaper.id || preview === wallpaper.id
          return (
            <motion.button
              key={wallpaper.id}
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => pick(wallpaper)}
              aria-pressed={selected}
              aria-label={wallpaper.name}
              className={clsx(
                'group relative aspect-[3/4] overflow-hidden rounded-xl ring-1 transition-all',
                selected
                  ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900'
                  : 'ring-black/5 hover:ring-primary-300 dark:ring-white/10'
              )}
              style={{
                background: css?.background,
                backgroundSize: css?.backgroundSize,
                backgroundPosition: css?.backgroundPosition,
              }}
            >
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-2 pb-1.5 pt-6 text-left text-[11px] font-medium text-white">
                {wallpaper.name}
              </span>
              {selected && (
                <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white shadow">
                  <CheckIcon className="h-3 w-3" />
                </span>
              )}
            </motion.button>
          )
        })}

        {/* Upload tile */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex aspect-[3/4] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-primary-400 hover:text-primary-500 dark:border-gray-700"
        >
          <PhotoIcon className="h-6 w-6" />
          <span className="text-[11px] font-medium">Upload</span>
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

      <div className="flex items-center justify-between gap-2 pt-1">
        <p className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
          <SparklesIcon className="h-3.5 w-3.5 text-primary-500" />
          Generated backgrounds — no downloads, crisp on any screen.
        </p>
        <button
          type="button"
          onClick={() => {
            const defaultWallpaper = WALLPAPERS.find((entry) => entry.id === DEFAULT_WALLPAPER_ID)
            setPreview(DEFAULT_WALLPAPER_ID)
            onChange?.(serializeWallpaper(defaultWallpaper), defaultWallpaper)
          }}
          className="text-[11px] font-semibold text-primary-600 hover:underline dark:text-primary-400"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default WallpaperGallery
