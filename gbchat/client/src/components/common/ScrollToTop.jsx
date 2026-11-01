import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop
 *
 * React Router keeps the scroll position of the previous page, which lands you
 * halfway down a profile / settings pane after every navigation. This resets
 * the closest scrollable ancestor (the app shell scrolls inner panes, not the
 * window) whenever the pathname changes — query-string changes such as
 * `?chat=<id>` intentionally keep their position.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      window.scrollTo({ top: 0, behavior: 'auto' })
    } catch {
      window.scrollTo(0, 0)
    }

    // The shell uses inner scroll containers; reset any pane that is
    // currently scrolled so a new route always starts at the top.
    document
      .querySelectorAll('[data-scroll-container="true"], main, .overflow-y-auto')
      .forEach((node) => {
        if (node.scrollTop > 0) node.scrollTop = 0
      })
  }, [pathname])

  return null
}

export default ScrollToTop
