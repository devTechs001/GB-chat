import React from 'react'
import { useOutletContext } from 'react-router-dom'
import { Bars3Icon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

/**
 * PageHeader
 * One header for every routed page.
 *
 * props
 *  - title:     string            page title
 *  - subtitle:  string|node       small line under the title
 *  - icon:      heroicon          rendered in a soft tile (optional)
 *  - emoji:     string            alternative to `icon`
 *  - badge:     string|number     pill next to the title
 *  - actions:   node              right aligned actions (buttons)
 *  - children:  node              toolbar row (search / filters / tabs)
 *  - sticky:    bool              keep it pinned when the page scrolls
 *  - className: string
 */
const PageHeader = ({
  title,
  subtitle,
  icon: Icon,
  emoji,
  badge,
  actions,
  children,
  sticky = false,
  className,
}) => {
  const ctx = useOutletContext() || {}
  const { openSidebar } = ctx

  return (
    <header
      className={clsx(
        'page-header',
        sticky && 'sticky top-0 z-30',
        className
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3 md:px-6 md:py-4">
        {/* Navigation drawer trigger – mobile/tablet only */}
        <button
          type="button"
          onClick={openSidebar}
          aria-label="Open navigation"
          className="lg:hidden -ml-1 p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        {(Icon || emoji) && (
          <div className="hidden sm:flex w-10 h-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400">
            {Icon ? <Icon className="w-5 h-5" /> : <span className="text-lg leading-none">{emoji}</span>}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-gray-900 dark:text-white truncate">
              {title}
            </h1>
            {badge !== undefined && badge !== null && badge !== 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary-500 text-white text-[11px] font-bold leading-none">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {children && (
        <div className="px-4 pb-3 md:px-6 md:pb-4 space-y-3">{children}</div>
      )}
    </header>
  )
}

export default PageHeader
