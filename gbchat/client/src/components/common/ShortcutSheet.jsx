import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CommandLineIcon, XMarkIcon } from '@heroicons/react/24/outline'

const GROUPS = [
  {
    title: 'Navigate',
    items: [
      { keys: ['Alt', '1'], label: 'Chats' },
      { keys: ['Alt', '2'], label: 'Stories' },
      { keys: ['Alt', '3'], label: 'Channels' },
      { keys: ['Alt', '4'], label: 'Groups' },
      { keys: ['Alt', '5'], label: 'Settings' },
      { keys: ['Alt', 'Backspace'], label: 'Back' },
    ],
  },
  {
    title: 'Find & act',
    items: [
      { keys: ['⌘', 'K'], label: 'Search conversations', alt: 'Ctrl + K on Windows' },
      { keys: ['N'], label: 'New story (on Stories)' },
      { keys: ['R'], label: 'Refresh stories (on Stories)' },
      { keys: ['Esc'], label: 'Close a dialog or viewer' },
      { keys: ['←', '→'], label: 'Previous / next story' },
    ],
  },
  {
    title: 'Appearance',
    items: [
      { keys: ['Shift', '?'], label: 'This sheet' },
      { keys: ['Alt', 'W'], label: 'Toggle the wallpaper panel' },
    ],
  },
]

/**
 * ShortcutSheet — opened with Shift+? (or the account menu item), closed with
 * Escape / backdrop. Purely informational, so it costs one small component.
 */
const ShortcutSheet = () => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const show = () => setOpen(true)
    const hide = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('gbchat:shortcuts', show)
    window.addEventListener('keydown', hide)
    return () => {
      window.removeEventListener('gbchat:shortcuts', show)
      window.removeEventListener('keydown', hide)
    }
  }, [])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900"
          >
            <header className="flex items-center gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                <CommandLineIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Keyboard shortcuts</h2>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Nothing fires while you are typing in a field
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </header>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-5 py-4">
              {GROUPS.map((group) => (
                <section key={group.title}>
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {group.title}
                  </h3>
                  <ul className="space-y-1.5">
                    {group.items.map((item) => (
                      <li key={item.label} className="flex items-center justify-between gap-3">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {item.label}
                          {item.alt && (
                            <span className="ml-1 text-[11px] text-gray-400">({item.alt})</span>
                          )}
                        </span>
                        <span className="flex flex-none items-center gap-1">
                          {item.keys.map((key) => (
                            <kbd
                              key={key}
                              className="rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-sans text-[11px] font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            >
                              {key}
                            </kbd>
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ShortcutSheet
