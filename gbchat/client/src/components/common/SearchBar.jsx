import React, { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import useDebounce from '../../hooks/useDebounce'
import clsx from 'clsx'

const SearchBar = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  debounceDelay = 300,
  loading = false,
  className,
  autoFocus = false,
}) => {
  const [inputValue, setInputValue] = useState(value || '')
  const debouncedValue = useDebounce(inputValue, debounceDelay)

  useEffect(() => {
    if (debouncedValue !== value) {
      if (onSearch) {
        onSearch(debouncedValue)
      } else if (onChange) {
        onChange(debouncedValue)
      }
    }
  }, [debouncedValue])

  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  const handleClear = () => {
    setInputValue('')
    if (onChange) onChange('')
    if (onSearch) onSearch('')
  }

  return (
    <div className={clsx('relative', className)}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {loading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin" />
          ) : (
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          )}
        </div>
        
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={clsx(
            'w-full pl-10 pr-10 py-2.5 rounded-lg',
            'bg-gray-100 dark:bg-gray-800',
            'border border-transparent',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'text-gray-900 dark:text-white',
            'placeholder-gray-500 dark:placeholder-gray-400',
            'transition-all duration-200'
          )}
        />

        <AnimatePresence>
          {inputValue && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default SearchBar