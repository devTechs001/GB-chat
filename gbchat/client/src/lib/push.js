import api, { isDemoMode } from './api'

/**
 * Web Push client.
 *
 * Three states matter and each needs its own affordance in the UI:
 *   unsupported  — no Push API (iOS Safari < 16.4 in-browser, some embedded views)
 *   blocked      — Notification.permission === 'denied'; only the browser can undo it
 *   subscribed   — a PushSubscription exists *and* the server has it
 *
 * `enable()` is the only function that asks for permission, and it is only ever
 * called from a click — asking on load is what gets apps permanently blocked.
 */

export const isPushSupported = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window

export const getPermission = () =>
  typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'

/** VAPID keys arrive as base64url; PushManager wants a Uint8Array. */
export const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const bytes = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i)
  return bytes
}

const readyRegistration = async () => {
  if (!isPushSupported()) return null
  try {
    return await navigator.serviceWorker.ready
  } catch {
    return null
  }
}

/** The browser's current subscription, or null. */
export const getSubscription = async () => {
  const registration = await readyRegistration()
  if (!registration) return null
  try {
    return await registration.pushManager.getSubscription()
  } catch {
    return null
  }
}

export const fetchPushStatus = async () => {
  const { data } = await api.get('/push/status')
  return data
}

const toPayload = (subscription) => ({
  endpoint: subscription.endpoint,
  expirationTime: subscription.expirationTime ?? null,
  keys: {
    p256dh: subscription.toJSON?.().keys?.p256dh,
    auth: subscription.toJSON?.().keys?.auth,
  },
})

/** Register this browser with the server. Idempotent. */
export const registerSubscription = async (subscription) => {
  const { data } = await api.post('/push/subscribe', { subscription: toPayload(subscription) })
  return data
}

/**
 * Ask for permission, subscribe, and tell the server.
 * Returns { ok, status, message } — never throws, the UI just renders status.
 */
export const enablePush = async () => {
  if (isDemoMode()) {
    return { ok: false, status: 'demo', message: 'Push is unavailable in demo mode' }
  }
  if (!isPushSupported()) {
    return { ok: false, status: 'unsupported', message: 'This browser does not support push notifications' }
  }

  try {
    const { data } = await api.get('/push/public-key')
    if (!data?.enabled || !data.publicKey) {
      return {
        ok: false,
        status: 'unconfigured',
        message: data?.reason || 'Push notifications are not configured on the server',
      }
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      return {
        ok: false,
        status: permission === 'denied' ? 'blocked' : 'dismissed',
        message:
          permission === 'denied'
            ? 'Notifications are blocked for this site — enable them in the browser settings'
            : 'Permission was not granted',
      }
    }

    const registration = await readyRegistration()
    if (!registration) {
      return { ok: false, status: 'unsupported', message: 'Service worker is not available' }
    }

    let subscription = await registration.pushManager.getSubscription()
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      })
    }

    await registerSubscription(subscription)
    return { ok: true, status: 'subscribed', message: 'Push notifications enabled on this device' }
  } catch (error) {
    const message =
      error?.response?.data?.message || error?.message || 'Could not enable push notifications'
    return { ok: false, status: 'error', message }
  }
}

/** Unsubscribe locally and drop the row on the server. */
export const disablePush = async () => {
  const subscription = await getSubscription()
  if (!subscription) return { ok: true, status: 'unsubscribed', message: 'No subscription on this device' }

  const endpoint = subscription.endpoint
  try {
    await subscription.unsubscribe()
  } catch {
    /* the browser may already have dropped it */
  }

  try {
    await api.delete('/push/subscribe', { data: { endpoint } })
  } catch {
    /* the server row will be cleaned up on the next failed send (404/410) */
  }

  return { ok: true, status: 'unsubscribed', message: 'Push notifications disabled on this device' }
}

/**
 * On app load: if this browser already has a subscription (returning visitor,
 * or an account switch on a shared device) make sure the server knows about it.
 */
export const syncPushSubscription = async () => {
  if (!isPushSupported() || getPermission() !== 'granted') return { synced: false }
  const subscription = await getSubscription()
  if (!subscription) return { synced: false }
  try {
    await registerSubscription(subscription)
    return { synced: true }
  } catch {
    return { synced: false }
  }
}

export const sendTestPush = async () => {
  const { data } = await api.post('/push/test')
  return data
}

export default {
  isPushSupported,
  getPermission,
  getSubscription,
  enablePush,
  disablePush,
  syncPushSubscription,
  sendTestPush,
  fetchPushStatus,
  urlBase64ToUint8Array,
}
