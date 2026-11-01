import { API_URL, isDemoMode } from './api'
import { getToken } from './token'

/**
 * Client crash reporting.
 *
 * A render error in a user's browser is invisible to the server. This posts a
 * compact report (message, stack, route, component, request id) to
 * `POST /api/system/client-error`, which keeps the last 100 in a bounded ring —
 * enough to answer "did this deploy break everyone?" without a SaaS.
 *
 * Rules:
 *  - never throw, never recurse into itself
 *  - dedupe: the same crash from one session is reported once a minute
 *  - `keepalive` so a report survives the tab being closed mid-unload
 */

const DEDUPE_WINDOW_MS = 60_000
const MAX_STACK = 4000
const recent = new Map()
let installed = false

const apiBase = () => (API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL)

const fingerprint = (message, stack) =>
  `${message}|${String(stack || '').split('\n').slice(0, 3).join(' ')}`.slice(0, 300)

const shouldSend = (key) => {
  const now = Date.now()
  const last = recent.get(key) || 0
  if (now - last < DEDUPE_WINDOW_MS) return false
  recent.set(key, now)
  // Keep the map small in long-lived tabs.
  if (recent.size > 50) {
    for (const [k, at] of recent) if (now - at > DEDUPE_WINDOW_MS) recent.delete(k)
  }
  return true
}

export const reportClientError = ({
  message,
  stack,
  component,
  kind = 'error',
  name,
  force = false,
} = {}) => {
  try {
    if (isDemoMode()) return false
    if (!message && !stack) return false
    if (!force && !shouldSend(fingerprint(message, stack))) return false

    const token = getToken()
    const body = JSON.stringify({
      message: String(message || 'Unknown error').slice(0, 500),
      stack: String(stack || '').slice(0, MAX_STACK),
      name: name ? String(name).slice(0, 120) : undefined,
      component: component ? String(component).slice(0, 200) : undefined,
      kind,
      route: `${window.location.pathname}${window.location.search}`.slice(0, 200),
      userAgent: navigator.userAgent,
      appVersion: import.meta.env.VITE_APP_VERSION || 'web',
    })

    fetch(`${apiBase()}/system/client-error`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
      keepalive: true,
    }).catch(() => {})

    return true
  } catch {
    return false
  }
}

/** Console noise is always on; reporting is throttled by `reportClientError`. */
const handleError = (event) => {
  // Resource load failures (img/script) surface here without an `error` object.
  const error = event?.error
  reportClientError({
    message: error?.message || event?.message,
    stack: error?.stack,
    name: error?.name,
    kind: 'error',
  })
}

const handleRejection = (event) => {
  const reason = event?.reason
  reportClientError({
    message: reason?.message || String(reason || 'Unhandled promise rejection'),
    stack: reason?.stack,
    name: reason?.name,
    kind: 'unhandledrejection',
  })
}

/** Idempotent: safe to call from main.jsx on every boot. */
export const installGlobalErrorHandlers = () => {
  if (installed || typeof window === 'undefined') return
  installed = true
  window.addEventListener('error', handleError)
  window.addEventListener('unhandledrejection', handleRejection)
}

export default { reportClientError, installGlobalErrorHandlers }
