import React from 'react'
import clsx from 'clsx'

const Loader = ({ size = 'md', fullScreen = false, className }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-dark-bg z-50 flex items-center justify-center">
        <div className={clsx('animate-spin rounded-full border-4 border-gray-200 border-t-primary-600', sizes.lg)} />
      </div>
    )
  }

  return (
    <div className={clsx('animate-spin rounded-full border-2 border-gray-200 border-t-primary-600', sizes[size], className)} />
  )
}

export default Loader