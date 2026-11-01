import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

/**
 * RouteErrorBoundary — one crash must not blank the whole app.
 *
 * Without this, a render error in Profile / Stories / Channels / Settings
 * propagated to the root and left a white screen with no way back. The shell
 * (sidebar, bottom nav) stays mounted because the boundary sits *inside* the
 * layout, around the routed content only.
 *
 * `resetKey` (the pathname) clears the error when the user navigates, so a
 * broken page is not sticky.
 */
class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    this.setState({ info })
    console.error('[RouteErrorBoundary]', error, info?.componentStack)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null, info: null })
    }
  }

  copyDetails = async () => {
    const { error, info } = this.state
    const text = [
      `path: ${window.location.pathname}${window.location.search}`,
      `message: ${error?.message || 'unknown'}`,
      `stack: ${error?.stack || '-'}`,
      `component: ${info?.componentStack || '-'}`,
      `ua: ${navigator.userAgent}`,
    ].join('\n')

    try {
      await navigator.clipboard.writeText(text)
      toast.success('Error details copied')
    } catch {
      toast.error('Could not copy')
    }
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center gap-4 overflow-y-auto px-6 py-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
          <ExclamationTriangleIcon className="h-7 w-7" />
        </span>

        <div className="max-w-md">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            This screen ran into a problem
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            The rest of the app is still working — your messages and data are unaffected.
          </p>
          <p className="mt-2 break-words rounded-xl bg-gray-100 px-3 py-2 text-left font-mono text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {error.message || String(error)}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => this.setState({ error: null, info: null })}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Try again
          </button>
          <button
            type="button"
            onClick={this.props.onHome}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <HomeIcon className="h-4 w-4" />
            Back to chats
          </button>
          <button
            type="button"
            onClick={this.copyDetails}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <ClipboardDocumentIcon className="h-4 w-4" />
            Copy details
          </button>
        </div>
      </div>
    )
  }
}

/** Convenience wrapper so App can render it without prop plumbing. */
export const RoutedErrorBoundary = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <RouteErrorBoundary resetKey={location.pathname} onHome={() => navigate('/chats')}>
      {children}
    </RouteErrorBoundary>
  )
}

export default RouteErrorBoundary
