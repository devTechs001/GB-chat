import React, { useState } from 'react'
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
  const [imgError, setImgError] = useState(false)

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

  const showFallback = !src || imgError
  const initial = (fallback || alt?.charAt(0) || '?').toString().charAt(0).toUpperCase()

  // Deterministic per-name hue so every contact keeps the same colour across
  // sessions (a flat grey blob gives no way to tell people apart in a list).
  const hue = [...(alt || '?')].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 360, 7)
  const fallbackStyle = showFallback
    ? {
        backgroundImage: `linear-gradient(135deg, hsl(${hue} 72% 58%), hsl(${(hue + 38) % 360} 68% 46%))`,
        color: '#fff',
      }
    : undefined

  return (
    <div className={clsx('relative inline-block', className)}>
      {showFallback ? (
        <div
          onClick={onClick}
          aria-label={alt}
          role={onClick ? 'button' : undefined}
          style={fallbackStyle}
          className={clsx(
            sizes[size],
            'rounded-full flex items-center justify-center font-semibold select-none',
            'ring-1 ring-black/5 dark:ring-white/10',
            size === 'xs' || size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg',
            onClick && 'cursor-pointer transition hover:brightness-105 active:scale-95'
          )}
        >
          {initial}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onClick={onClick}
          onError={() => setImgError(true)}
          className={clsx(
            sizes[size],
            'rounded-full object-cover bg-gray-200 dark:bg-gray-700',
            'ring-1 ring-black/5 dark:ring-white/10',
            onClick && 'cursor-pointer transition hover:brightness-105 active:scale-95'
          )}
        />
      )}
      
      {status && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-gray-900',
            statusSizes[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  )
}

export default Avatar