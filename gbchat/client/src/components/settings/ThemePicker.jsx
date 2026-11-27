import React from 'react'
import { motion } from 'framer-motion'
import { CheckIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import useThemeStore from '../../store/useThemeStore'
import clsx from 'clsx'

/**
 * ThemePicker — the compact theme switcher.
 *
 * `AppearanceSettings` renders the full appearance page (wallpapers, bubble
 * shapes, effects). This is the small surface: a one-tap light/dark toggle plus
 * the palette swatches, sized to drop into a popover, a profile menu or a
 * settings row.
 *
 * Previously this file was zero bytes and imported by nothing — an empty module
 * waiting to break the first import someone added.
 */
const ThemePicker = ({ compact = false, showLabels = true, className, onSelect }) => {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  const getThemeList = useThemeStore((state) => state.getThemeList)

  const allThemes = getThemeList ? getThemeList() : []
  const current = allThemes.find((entry) => entry.id === theme)
  const isDark = current?.mode === 'dark'

  const pick = (id) => {
    setTheme(id)
    onSelect?.(id)
  }

  /**
   * The quick toggle picks the first light/dark theme in the registry rather
   * than hard-coding ids — a renamed or added theme keeps working.
   */
  const toggleMode = () => {
    const target = allThemes.find((entry) => entry.mode === (isDark ? 'light' : 'dark'))
    if (target) pick(target.id)
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleMode}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        title={isDark ? 'Light theme' : 'Dark theme'}
        className={clsx(
          'relative inline-flex h-9 w-9 items-center justify-center rounded-full',
          'border border-gray-200 bg-white text-gray-600 transition-colors',
          'hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
          className
        )}
      >
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          initial={{ rotate: -30, opacity: 0, scale: 0.8 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center"
        >
          {isDark ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
        </motion.span>
      </button>
    )
  }

  return (
    <div className={clsx('space-y-3', className)}>
      {showLabels && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Theme</h3>
          <button
            type="button"
            onClick={toggleMode}
            className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {isDark ? <SunIcon className="h-3.5 w-3.5" /> : <MoonIcon className="h-3.5 w-3.5" />}
            {isDark ? 'Light' : 'Dark'}
          </button>
        </div>
      )}

      <div
        role="radiogroup"
        aria-label="Theme"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        {allThemes.map((entry) => {
          const selected = entry.id === theme
          return (
            <button
              key={entry.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => pick(entry.id)}
              className={clsx(
                'group relative overflow-hidden rounded-xl border p-2 text-left transition-all',
                selected
                  ? 'border-primary-500 ring-2 ring-primary-500/40'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
              )}
            >
              {/* Live swatch from the theme's own palette — never a stock image */}
              <span className="mb-1.5 flex h-8 overflow-hidden rounded-lg ring-1 ring-black/5 dark:ring-white/10">
                {(entry.swatch || [entry.primary]).map((color, index) => (
                  <span key={index} className="flex-1" style={{ backgroundColor: color }} />
                ))}
              </span>
              <span className="flex items-center justify-between gap-1">
                <span className="truncate text-xs font-medium text-gray-800 dark:text-gray-100">
                  {entry.name}
                </span>
                {selected && <CheckIcon className="h-3.5 w-3.5 shrink-0 text-primary-600 dark:text-primary-400" />}
              </span>
              {showLabels && entry.description && (
                <span className="mt-0.5 block truncate text-[11px] text-gray-500 dark:text-gray-400">
                  {entry.description}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ThemePicker
