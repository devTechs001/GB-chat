import React from 'react'
import { SparklesIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

/**
 * EmptyState
 * Shared empty / zero-data state so every list looks the same.
 */
const EmptyState = ({ icon: Icon, emoji, title, description, action, className, compact = false }) => {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center px-6',
        compact ? 'py-10' : 'py-16',
        className
      )}
    >
      <div
        className={clsx(
          'rounded-2xl bg-gradient-to-br from-primary-500/15 to-primary-600/5',
          'flex items-center justify-center mb-4 text-primary-500',
          compact ? 'w-14 h-14' : 'w-20 h-20'
        )}
      >
        {Icon ? (
          <Icon className={compact ? 'w-7 h-7' : 'w-10 h-10'} />
        ) : (
          <SparklesIcon className={compact ? 'w-6 h-6' : 'w-8 h-8'} />
        )}
      </div>
      {title && (
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export default EmptyState
