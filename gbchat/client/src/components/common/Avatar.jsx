import React, { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { initialsOf, gradientFor } from '../../lib/avatar'

/**
 * Avatar — the single identity primitive for the whole app.
 *
 * Round 12 changes:
 *  - **No square frames.** Every avatar renders inside a perfect circle with
 *    `overflow-hidden`, so an uploaded image can never show a squared-off
 *    corner (several holders used `rounded-lg`/`rounded-xl`, which made a
 *    circular photo sit in a rounded square).
 *  - **Round holder behind the image**, so a JPEG with a white background or a
 *    transparent PNG both look intentional.
 *  - **Initials that read well**: two letters ("Ada Lovelace" → "AL") instead
 *    of one, in a gradient derived from the name — deterministic, so the same
 *    person keeps the same colour everywhere.
 *  - **Sizes as a scale**, including `2xs` for dense lists and `2xl` for
 *    profile headers.
 *  - `ring` prop for the gradient story ring, `badge` for arbitrary overlays,
 *    `shape` only for genuinely non-avatar uses (logos) — defaults to circle.
 */

const SIZES = {
  '2xs': 'w-6 h-6 text-[9px]',
  xs: 'w-8 h-8 text-[11px]',
  sm: 'w-10 h-10 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-24 h-24 text-2xl',
}

const STATUS_SIZES = {
  '2xs': 'w-1.5 h-1.5 ring-1',
  xs: 'w-2 h-2 ring-2',
  sm: 'w-2.5 h-2.5 ring-2',
  md: 'w-3 h-3 ring-2',
  lg: 'w-4 h-4 ring-[3px]',
  xl: 'w-5 h-5 ring-[3px]',
  '2xl': 'w-6 h-6 ring-[3px]',
}

const STATUS_COLORS = {
  online: 'bg-emerald-500',
  offline: 'bg-gray-400 dark:bg-gray-600',
  away: 'bg-amber-400',
  busy: 'bg-rose-500',
  dnd: 'bg-rose-500',
}

const Avatar = ({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  status,
  onClick,
  className,
  fallback,
  ring = false,
  ringSeen = false,
  badge,
  shape = 'circle',
  loading = 'lazy',
}) => {
  const [imgError, setImgError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // A new src must get a fresh chance: without this, one broken URL would keep
  // the initials forever even after the profile was fixed.
  useEffect(() => {
    setImgError(false)
    setLoaded(false)
  }, [src])

  const label = name || alt || 'Avatar'
  const initials = initialsOf(fallback || label)
  const gradient = useMemo(() => gradientFor(label), [label])
  const showFallback = !src || imgError

  const shapeClass = shape === 'square' ? 'rounded-xl' : 'rounded-full'
  const sizeClass = SIZES[size] || SIZES.md

  const inner = showFallback ? (
    <div
      style={{ backgroundImage: gradient }}
      className={clsx(
        sizeClass,
        shapeClass,
        'flex items-center justify-center font-semibold tracking-tight text-white select-none',
        'shadow-inner ring-1 ring-black/5 dark:ring-white/10'
      )}
    >
      {initials}
    </div>
  ) : (
    <img
      src={src}
      alt={label}
      loading={loading}
      decoding="async"
      draggable={false}
      onLoad={() => setLoaded(true)}
      onError={() => setImgError(true)}
      className={clsx(
        sizeClass,
        shapeClass,
        'object-cover bg-gray-200 dark:bg-gray-700',
        'ring-1 ring-black/5 dark:ring-white/10',
        'transition-opacity duration-300',
        loaded ? 'opacity-100' : 'opacity-0'
      )}
    />
  )

  return (
    <div
      className={clsx(
        'relative inline-block shrink-0',
        onClick && 'cursor-pointer transition-transform duration-150 hover:scale-[1.03] active:scale-95',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? label : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onClick(event)
              }
            }
          : undefined
      }
    >
      {ring ? (
        <span
          className={clsx(
            'block rounded-full bg-gradient-to-tr p-[2px]',
            ringSeen
              ? 'from-gray-300 via-gray-300 to-gray-400 dark:from-gray-700 dark:via-gray-700 dark:to-gray-600'
              : 'from-amber-400 via-rose-500 to-purple-600'
          )}
        >
          {/* The inner holder is what keeps the photo circular even when the
              ring is present — no square edge can show through. */}
          <span className="block rounded-full bg-gray-50 p-[2px] dark:bg-gray-950">{inner}</span>
        </span>
      ) : (
        inner
      )}

      {status && (
        <span
          aria-label={status}
          title={status}
          className={clsx(
            'absolute bottom-0 right-0 block rounded-full ring-white dark:ring-gray-900',
            STATUS_SIZES[size] || STATUS_SIZES.md,
            STATUS_COLORS[status] || STATUS_COLORS.offline
          )}
        />
      )}

      {badge}
    </div>
  )
}

export default Avatar
