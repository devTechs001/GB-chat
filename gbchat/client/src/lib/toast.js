// lib/toast.js
//
// Thin wrapper over react-hot-toast so call sites can do `toast.success(...)`
// without caring which toast library is installed, and so a single helper can
// add the app's consistent behaviour:
//
//  - errors never leave the screen before the user can read them,
//  - an identical message fired twice within a second does not stack
//    (the "Failed to load" storm when five requests fail at once),
//  - promise helpers keep the loading → success/error transitions uniform.
//
// This file was previously zero bytes and imported by nothing, which is exactly
// the kind of half-finished surface that makes a codebase hard to trust.
import { toast as hot } from 'react-hot-toast'

const base = {
  position: 'top-center',
  duration: 3200,
}

const dedupe = (message, options = {}) => ({
  ...base,
  ...options,
  id: options.id || `${options.type || 'toast'}:${message}`,
})

const api = {
  success: (message, options = {}) => hot.success(message, dedupe(message, { ...options, type: 'success' })),

  error: (message, options = {}) =>
    hot.error(message, dedupe(message, { duration: 5000, ...options, type: 'error' })),

  info: (message, options = {}) => hot(message, dedupe(message, { icon: 'ℹ️', ...options })),

  loading: (message, options = {}) => hot.loading(message, dedupe(message, { ...options })),

  custom: (message, options = {}) => hot(message, { ...base, ...options }),

  dismiss: (id) => hot.dismiss(id),

  clear: () => hot.dismiss(),

  /**
   * Run an async action with loading → success/error toasts.
   * Returns the resolved value, or `undefined` when it threw (already reported).
   */
  promise: async (action, { loading = 'Working…', success = 'Done', error } = {}) => {
    const id = hot.loading(loading, base)
    try {
      const result = await action()
      hot.success(typeof success === 'function' ? success(result) : success, { ...base, id })
      return result
    } catch (err) {
      const message =
        (typeof error === 'function' ? error(err) : error) ||
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong'
      hot.error(message, { ...base, id, duration: 5000 })
      return undefined
    }
  },
}

export { api as toast }
export const { success, error, info, loading, dismiss, clear, promise } = api
export default api
