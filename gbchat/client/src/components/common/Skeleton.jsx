import React from 'react'
import clsx from 'clsx'

/** Base shimmer block */
export const Skeleton = ({ className }) => (
  <div
    className={clsx(
      'animate-pulse rounded-lg bg-gray-200/80 dark:bg-gray-800',
      className
    )}
  />
)

/** Row used by chat / contact / call lists */
export const ListRowSkeleton = ({ avatar = true }) => (
  <div className="flex items-center gap-3 px-4 py-3">
    {avatar && <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />}
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
    </div>
    <Skeleton className="h-3 w-8" />
  </div>
)

export const ListSkeleton = ({ rows = 6, avatar = true }) => (
  <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
    {Array.from({ length: rows }).map((_, index) => (
      <ListRowSkeleton key={index} avatar={avatar} />
    ))}
  </div>
)

export const CardGridSkeleton = ({ cards = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: cards }).map((_, index) => (
      <div
        key={index}
        className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-3"
      >
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    ))}
  </div>
)

export const SettingsSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="rounded-2xl border border-gray-200/70 dark:border-gray-800 p-5 space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
  </div>
)

export default Skeleton
