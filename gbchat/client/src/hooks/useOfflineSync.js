import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../lib/api'
import offlineDb from '../lib/offlineDb'
import toast from 'react-hot-toast'

/**
 * useOfflineSync
 *
 * Owns the "composed while offline" queue:
 *   • tracks navigator.onLine
 *   • replays the outbox as soon as the browser reports it is back
 *   • exposes counts so the UI can show "3 waiting to send"
 *
 * Messages are replayed in the order they were written; anything that still
 * fails stays in the queue (a 4xx would loop forever, so those are dropped
 * after the server rejects them).
 */
const useOfflineSync = ({ autoFlush = true } = {}) => {
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  )
  const [queued, setQueued] = useState(0)
  const [flushing, setFlushing] = useState(false)
  const flushRef = useRef(null)

  const refresh = useCallback(async () => {
    try {
      const items = await offlineDb.getOutbox()
      setQueued(items.length)
      return items.length
    } catch {
      setQueued(0)
      return 0
    }
  }, [])

  const flush = useCallback(async ({ silent = false } = {}) => {
    if (flushRef.current) return flushRef.current

    const run = (async () => {
      setFlushing(true)
      let sent = 0
      let failed = 0

      try {
        const items = await offlineDb.getOutbox()

        for (const item of items) {
          try {
            // Reuse the key written when the message was composed, so a retry
            // that already reached the server returns that message instead of
            // creating a duplicate.
            await api.post(`/messages/${item.chatId}`, {
              text: item.text || '',
              type: item.type || 'text',
              clientMessageId: item.clientMessageId,
            })
            await offlineDb.removeOutboxItem(item.id)
            sent += 1
          } catch (error) {
            const status = error?.response?.status
            if (status && status >= 400 && status < 500) {
              // The server will never accept it — drop it rather than loop.
              await offlineDb.removeOutboxItem(item.id)
            }
            failed += 1
          }
        }
      } finally {
        await refresh()
        setFlushing(false)
        flushRef.current = null
      }

      if (!silent && (sent || failed)) {
        if (sent && !failed) toast.success(`${sent} queued message${sent === 1 ? '' : 's'} sent`)
        else if (sent) toast.success(`${sent} sent · ${failed} still waiting`)
        else toast.error(`${failed} queued message${failed === 1 ? '' : 's'} could not be sent`)
      }

      return { sent, failed }
    })()

    flushRef.current = run
    return run
  }, [refresh])

  useEffect(() => {
    refresh()
    // Housekeeping: once a day, drop cache older than 30 days / 500 msgs per chat.
    offlineDb.pruneIfDue().catch(() => {})

    const goOnline = () => {
      setOnline(true)
      if (autoFlush) flush({ silent: true })
    }
    const goOffline = () => setOnline(false)

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [autoFlush, flush, refresh])

  return { online, queued, flushing, flush, refresh }
}

export default useOfflineSync
