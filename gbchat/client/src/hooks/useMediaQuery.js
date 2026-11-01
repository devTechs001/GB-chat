import { useEffect, useState } from 'react'

/**
 * useMediaQuery
 * Resolves synchronously on the first render (no mobile->desktop flash) and
 * keeps itself in sync with the browser.
 */
const getMatches = (query) => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia(query).matches
}

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => getMatches(query))

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined
    }

    const media = window.matchMedia(query)
    const listener = (event) => setMatches(event.matches)

    // Sync immediately in case the query changed between renders
    setMatches(media.matches)

    if (media.addEventListener) {
      media.addEventListener('change', listener)
      return () => media.removeEventListener('change', listener)
    }

    // Legacy Safari
    media.addListener(listener)
    return () => media.removeListener(listener)
  }, [query])

  return matches
}

export default useMediaQuery
