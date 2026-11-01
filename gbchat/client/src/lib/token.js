/**
 * Single source of truth for the auth token in the browser.
 *
 * Historically the app stored the JWT in two places: a plain `token` key
 * (written by the auth store / api interceptor) and inside the zustand
 * `auth-storage` blob. Components that only knew about one of them silently
 * lost the Authorization header. Everything now goes through these helpers,
 * which read/write both and tolerate blocked storage (Safari private mode,
 * SSR, quota errors).
 */

const TOKEN_KEY = 'token'
const REFRESH_KEY = 'refreshToken'
const AUTH_STORAGE_KEY = 'auth-storage'

const safeLocalStorage = () => {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null
  } catch {
    return null
  }
}

const readAuthStorage = () => {
  const storage = safeLocalStorage()
  if (!storage) return null
  try {
    return JSON.parse(storage.getItem(AUTH_STORAGE_KEY) || 'null')
  } catch {
    return null
  }
}

/** Current access token, or null. */
export const getToken = () => {
  const storage = safeLocalStorage()
  if (!storage) return null

  try {
    const direct = storage.getItem(TOKEN_KEY)
    if (direct) return direct
  } catch {
    /* ignore */
  }

  return readAuthStorage()?.state?.token || null
}

/** Persist a new access token in both places. */
export const setToken = (token) => {
  const storage = safeLocalStorage()
  if (!storage) return
  try {
    if (token) storage.setItem(TOKEN_KEY, token)
    else storage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export const getRefreshToken = () => {
  const storage = safeLocalStorage()
  if (!storage) return null
  try {
    return storage.getItem(REFRESH_KEY) || readAuthStorage()?.state?.refreshToken || null
  } catch {
    return null
  }
}

export const setRefreshToken = (token) => {
  const storage = safeLocalStorage()
  if (!storage) return
  try {
    if (token) storage.setItem(REFRESH_KEY, token)
    else storage.removeItem(REFRESH_KEY)
  } catch {
    /* ignore */
  }
}

/** Clear every trace of the session token. */
export const clearTokens = () => {
  const storage = safeLocalStorage()
  if (!storage) return
  try {
    storage.removeItem(TOKEN_KEY)
    storage.removeItem(REFRESH_KEY)

    const stored = readAuthStorage()
    if (stored?.state) {
      storage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ ...stored, state: { ...stored.state, token: null, refreshToken: null } })
      )
    }
  } catch {
    /* ignore */
  }
}

/** Authorization header object, or {} when unauthenticated. */
export const authHeader = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default { getToken, setToken, getRefreshToken, setRefreshToken, clearTokens, authHeader }
