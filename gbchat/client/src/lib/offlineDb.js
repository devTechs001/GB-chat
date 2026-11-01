/**
 * offlineDb — the offline layer of the app.
 *
 * IndexedDB is the browser's SQLite-shaped store: the same idea (tables,
 * indexes, cursors, transactions) that a SQLite file gives you on device. We
 * keep three stores:
 *
 *   kv        small documents (profile, chat list) — key/value
 *   messages  one row per message, indexed by chatId and ordered by time
 *   outbox    messages composed while offline, replayed when the socket is back
 *
 * Everything degrades gracefully: if IndexedDB is unavailable (private mode,
 * very old browser, SSR) the helpers fall back to localStorage for `kv` and
 * simply no-op for the rest, so callers never need to branch.
 */

const DB_NAME = 'gbchat-offline'
const DB_VERSION = 1
const KV_STORE = 'kv'
const MESSAGE_STORE = 'messages'
const OUTBOX_STORE = 'outbox'

const LS_PREFIX = 'gbchat.offline.'

let dbPromise = null

const hasIndexedDb = () =>
  typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined'

const openDb = () => {
  if (!hasIndexedDb()) return Promise.resolve(null)
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve) => {
    let request
    try {
      request = window.indexedDB.open(DB_NAME, DB_VERSION)
    } catch {
      resolve(null)
      return
    }

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(KV_STORE)) {
        db.createObjectStore(KV_STORE, { keyPath: 'key' })
      }
      if (!db.objectStoreNames.contains(MESSAGE_STORE)) {
        const store = db.createObjectStore(MESSAGE_STORE, { keyPath: 'id' })
        store.createIndex('by_chat', 'chatId', { unique: false })
        store.createIndex('by_time', 'createdAt', { unique: false })
      }
      if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
        const store = db.createObjectStore(OUTBOX_STORE, { keyPath: 'id', autoIncrement: true })
        store.createIndex('by_chat', 'chatId', { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => resolve(null)
    request.onblocked = () => resolve(null)
  })

  return dbPromise
}

const tx = async (storeName, mode, run) => {
  const db = await openDb()
  if (!db) return null

  return new Promise((resolve) => {
    let request
    try {
      const transaction = db.transaction(storeName, mode)
      request = run(transaction.objectStore(storeName))
      transaction.oncomplete = () => resolve(request?.result ?? true)
      transaction.onerror = () => resolve(null)
      transaction.onabort = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

const lsGet = (key) => {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const lsSet = (key, value) => {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export const isSupported = () => hasIndexedDb()

/* ------------------------------------------------------------------ */
/* Key/value (profile, chat list, settings snapshots)                  */
/* ------------------------------------------------------------------ */

export const setValue = async (key, value) => {
  const db = await openDb()
  if (db) {
    await tx(KV_STORE, 'readwrite', (store) => store.put({ key, value, updatedAt: Date.now() }))
    return true
  }
  return lsSet(key, value)
}

export const getValue = async (key) => {
  const db = await openDb()
  if (!db) return lsGet(key)

  const record = await tx(KV_STORE, 'readonly', (store) => store.get(key))
  if (record && typeof record === 'object' && 'value' in record) return record.value
  return lsGet(key)
}

/* ------------------------------------------------------------------ */
/* Chats + messages                                                    */
/* ------------------------------------------------------------------ */

export const cacheChats = async (chats) => {
  if (!Array.isArray(chats)) return false
  return setValue('chats', { chats, cachedAt: Date.now() })
}

export const getCachedChats = async () => {
  const record = await getValue('chats')
  return Array.isArray(record?.chats) ? record.chats : []
}

export const cacheMessages = async (chatId, messages) => {
  if (!chatId || !Array.isArray(messages)) return false

  const rows = messages
    .filter((message) => message && (message._id || message.id))
    .map((message) => ({
      id: String(message._id || message.id),
      chatId: String(chatId),
      createdAt: message.createdAt || new Date().toISOString(),
      payload: message,
    }))

  if (!rows.length) return true

  const db = await openDb()
  if (!db) {
    // localStorage fallback: keep the last 200 messages per chat
    const key = `messages.${chatId}`
    const existing = lsGet(key) || []
    const merged = [...existing.filter((row) => !rows.some((r) => r.id === row.id)), ...rows]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(-200)
    return lsSet(key, merged)
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(MESSAGE_STORE, 'readwrite')
      const store = transaction.objectStore(MESSAGE_STORE)
      rows.forEach((row) => store.put(row))
      transaction.oncomplete = () => resolve(true)
      transaction.onerror = () => resolve(false)
    } catch {
      resolve(false)
    }
  })
}

export const getCachedMessages = async (chatId) => {
  if (!chatId) return []

  const db = await openDb()
  if (!db) {
    const rows = lsGet(`messages.${chatId}`) || []
    return rows.map((row) => row.payload)
  }

  const rows = await new Promise((resolve) => {
    try {
      const transaction = db.transaction(MESSAGE_STORE, 'readonly')
      const index = transaction.objectStore(MESSAGE_STORE).index('by_chat')
      const request = index.getAll(String(chatId))
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => resolve([])
    } catch {
      resolve([])
    }
  })

  return rows
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((row) => row.payload)
}

/* ------------------------------------------------------------------ */
/* Outbox — messages composed offline                                  */
/* ------------------------------------------------------------------ */

export const queueMessage = async (item) => {
  const db = await openDb()
  if (!db) {
    const queue = lsGet('outbox') || []
    queue.push({ ...item, queuedAt: Date.now() })
    lsSet('outbox', queue.slice(-100))
    return true
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(OUTBOX_STORE, 'readwrite')
      transaction.objectStore(OUTBOX_STORE).add({ ...item, queuedAt: Date.now() })
      transaction.oncomplete = () => resolve(true)
      transaction.onerror = () => resolve(false)
    } catch {
      resolve(false)
    }
  })
}

export const getOutbox = async () => {
  const db = await openDb()
  if (!db) return lsGet('outbox') || []

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(OUTBOX_STORE, 'readonly')
      const request = transaction.objectStore(OUTBOX_STORE).getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => resolve([])
    } catch {
      resolve([])
    }
  })
}

export const removeOutboxItem = async (id) => {
  const db = await openDb()
  if (!db) {
    const queue = (lsGet('outbox') || []).filter((item) => item.id !== id)
    return lsSet('outbox', queue)
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(OUTBOX_STORE, 'readwrite')
      transaction.objectStore(OUTBOX_STORE).delete(id)
      transaction.oncomplete = () => resolve(true)
      transaction.onerror = () => resolve(false)
    } catch {
      resolve(false)
    }
  })
}

export const clearOutbox = async () => {
  const db = await openDb()
  if (!db) {
    lsSet('outbox', [])
    return true
  }
  return tx(OUTBOX_STORE, 'readwrite', (store) => store.clear())
}

/* ------------------------------------------------------------------ */
/* Housekeeping                                                        */
/* ------------------------------------------------------------------ */

export const getStats = async () => {
  const db = await openDb()
  const chats = await getCachedChats()
  const outbox = await getOutbox()

  if (!db) {
    let messages = 0
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(LS_PREFIX + 'messages.'))
        .forEach((key) => {
          try {
            messages += (JSON.parse(localStorage.getItem(key)) || []).length
          } catch {
            /* ignore */
          }
        })
    } catch {
      /* ignore */
    }
    return { engine: 'localStorage', supported: false, chats: chats.length, messages, queued: outbox.length }
  }

  const count = (storeName) =>
    new Promise((resolve) => {
      try {
        const transaction = db.transaction(storeName, 'readonly')
        const request = transaction.objectStore(storeName).count()
        request.onsuccess = () => resolve(request.result || 0)
        request.onerror = () => resolve(0)
      } catch {
        resolve(0)
      }
    })

  const [messages, queued] = await Promise.all([count(MESSAGE_STORE), count(OUTBOX_STORE)])

  return {
    engine: 'IndexedDB',
    supported: true,
    chats: chats.length,
    messages,
    queued,
    cachedAt: (await getValue('chats'))?.cachedAt || null,
  }
}

/**
 * Evict old data so a long-lived install cannot grow without bound.
 *
 *   maxAgeDays        drop messages older than this (default 30)
 *   maxPerChat        keep at most N messages per chat (default 500)
 *
 * Chats, profile and queued (unsent) messages are never pruned — losing an
 * outbox item would lose the user's words.
 */
export const prune = async ({ maxAgeDays = 30, maxPerChat = 500 } = {}) => {
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000
  const db = await openDb()
  let removed = 0

  if (!db) {
    // localStorage fallback: trim each `messages.<chatId>` array in place
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(LS_PREFIX + 'messages.'))
        .forEach((key) => {
          let rows = []
          try {
            rows = JSON.parse(localStorage.getItem(key)) || []
          } catch {
            rows = []
          }
          const kept = rows
            .filter((row) => new Date(row.createdAt).getTime() >= cutoff)
            .slice(-maxPerChat)
          removed += rows.length - kept.length
          localStorage.setItem(key, JSON.stringify(kept))
        })
    } catch {
      /* ignore */
    }
    return { removed, engine: 'localStorage' }
  }

  const groups = await new Promise((resolve) => {
    const byChat = new Map()
    try {
      const transaction = db.transaction(MESSAGE_STORE, 'readonly')
      const request = transaction.objectStore(MESSAGE_STORE).openCursor()
      request.onsuccess = () => {
        const cursor = request.result
        if (!cursor) return resolve(byChat)
        const row = cursor.value
        if (!byChat.has(row.chatId)) byChat.set(row.chatId, [])
        byChat.get(row.chatId).push(row)
        cursor.continue()
      }
      request.onerror = () => resolve(byChat)
    } catch {
      resolve(byChat)
    }
  })

  const doomed = []
  for (const rows of groups.values()) {
    const sorted = rows.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    const fresh = sorted.filter((row) => new Date(row.createdAt).getTime() >= cutoff)
    const overflow = fresh.length > maxPerChat ? fresh.slice(0, fresh.length - maxPerChat) : []
    const stale = sorted.length - fresh.length
    doomed.push(...overflow, ...sorted.slice(0, stale))
  }

  if (doomed.length) {
    await new Promise((resolve) => {
      try {
        const transaction = db.transaction(MESSAGE_STORE, 'readwrite')
        const store = transaction.objectStore(MESSAGE_STORE)
        doomed.forEach((row) => store.delete(row.id))
        transaction.oncomplete = () => resolve(true)
        transaction.onerror = () => resolve(false)
      } catch {
        resolve(false)
      }
    })
  }

  removed = doomed.length
  return { removed, engine: 'IndexedDB', maxAgeDays, maxPerChat }
}

/**
 * Run `prune` at most once a day, tracked in the kv store. Called on boot by
 * `useOfflineSync`, so most installs never pay for it twice.
 */
export const pruneIfDue = async (options = {}) => {
  const last = await getValue('lastPruneAt')
  const now = Date.now()
  if (last && now - Number(last) < 24 * 60 * 60 * 1000) return { skipped: true, removed: 0 }

  const result = await prune(options)
  await setValue('lastPruneAt', now)
  return result
}

export const clearAll = async () => {
  const db = await openDb()
  if (db) {
    await Promise.all(
      [KV_STORE, MESSAGE_STORE, OUTBOX_STORE].map((store) =>
        tx(store, 'readwrite', (objectStore) => objectStore.clear())
      )
    )
  }
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(LS_PREFIX))
      .forEach((key) => localStorage.removeItem(key))
  } catch {
    /* ignore */
  }
  return true
}

/**
 * Local backup file: everything we hold offline, in one JSON document.
 * Mirrors the server export so either file can be re-imported anywhere.
 */
export const buildLocalExport = async () => {
  const chats = await getCachedChats()
  const messages = []
  for (const chat of chats) {
    const cached = await getCachedMessages(chat._id || chat.id)
    messages.push(...cached)
  }
  return {
    version: 1,
    source: 'browser-offline-cache',
    exportedAt: new Date().toISOString(),
    profile: (await getValue('profile')) || null,
    chats,
    messages,
    contacts: (await getValue('contacts')) || [],
  }
}

export const importLocalExport = async (payload) => {
  if (!payload || !Array.isArray(payload.chats)) {
    throw new Error('That file is not a GBChat backup')
  }

  await cacheChats(payload.chats)
  if (payload.profile) await setValue('profile', payload.profile)
  if (Array.isArray(payload.contacts)) await setValue('contacts', payload.contacts)

  const byChat = new Map()
  for (const message of payload.messages || []) {
    const chatId =
      typeof message.chat === 'object' && message.chat ? message.chat._id : message.chat
    if (!chatId) continue
    if (!byChat.has(String(chatId))) byChat.set(String(chatId), [])
    byChat.get(String(chatId)).push(message)
  }
  for (const [chatId, messages] of byChat) {
    await cacheMessages(chatId, messages)
  }

  return {
    chats: payload.chats.length,
    messages: payload.messages?.length || 0,
    contacts: payload.contacts?.length || 0,
  }
}

export default {
  isSupported,
  setValue,
  getValue,
  cacheChats,
  getCachedChats,
  cacheMessages,
  getCachedMessages,
  queueMessage,
  getOutbox,
  removeOutboxItem,
  clearOutbox,
  getStats,
  prune,
  pruneIfDue,
  clearAll,
  buildLocalExport,
  importLocalExport,
}
