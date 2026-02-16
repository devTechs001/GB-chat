import React from 'react'
import clsx from 'clsx'

const Avatar = ({
  src,
  alt = 'Avatar',
  size = 'md',
  status,
  onClick,
  className,
  fallback,
}) => {
  const sizes = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  }

  const statusSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
  }

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  }

  return (
    <div className={clsx('relative inline-block', className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          onClick={onClick}
          className={clsx(
            sizes[size],
            'rounded-full object-cover',
            onClick && 'cursor-pointer hover:opacity-90'
          )}
        />
      ) : (
        <div
          onClick={onClick}
          className={clsx(
            sizes[size],
            'rounded-full bg-gray-300 dark:bg-gray-600',
            'flex items-center justify-center text-gray-600 dark:text-gray-300',
            onClick && 'cursor-pointer hover:opacity-90'
          )}
        >
          {fallback || alt?.charAt(0)?.toUpperCase()}
        </div>
      )}
      
      {status && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-gray-800',
            statusSizes[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  )
}

export default Avatar