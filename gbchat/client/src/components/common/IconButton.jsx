import React from 'react'
import clsx from 'clsx'
import Tooltip from './Tooltip'

const IconButton = ({
  icon,
  onClick,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  loading = false,
  tooltip,
  className,
  ...props
}) => {
  const variants = {
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400',
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
    danger: 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400',
  }

  const sizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const button = (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        'rounded-full transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <div className={clsx('animate-spin rounded-full border-2 border-current border-t-transparent', iconSizes[size])} />
      ) : (
        React.cloneElement(icon, { className: iconSizes[size] })
      )}
    </button>
  )

  if (tooltip) {
    return (
      <Tooltip content={tooltip} position="bottom">
        {button}
      </Tooltip>
    )
  }

  return button
}

export default IconButton