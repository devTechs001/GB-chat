import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SignalSlashIcon,
  ArrowPathIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline'
import useOfflineSync from '../../hooks/useOfflineSync'

/**
 * OfflineBanner — a thin status strip under the app header.
 *
 * It only appears when something is actually wrong or pending:
 *   • the browser reports no connection (cached data is being shown)
 *   • messages were composed offline and are waiting to send
 *
 * Tapping it opens Backup & offline, where the queue can be inspected.
 */
const OfflineBanner = () => {
  const navigate = useNavigate()
  const { online, queued, flushing, flush } = useOfflineSync()

  const visible = !online || queued > 0

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="overflow-hidden"
        >
          <div
            className={
              !online
                ? 'flex items-center gap-2 bg-amber-50 px-3 py-1.5 text-[12px] font-medium text-amber-800 dark:bg-amber-900/25 dark:text-amber-200'
                : 'flex items-center gap-2 bg-primary-50 px-3 py-1.5 text-[12px] font-medium text-primary-700 dark:bg-primary-900/25 dark:text-primary-200'
            }
          >
            {!online ? (
              <>
                <SignalSlashIcon className="h-4 w-4 flex-none" />
                <span className="min-w-0 flex-1 truncate">
                  Offline — showing cached chats
                  {queued > 0 ? ` · ${queued} message${queued === 1 ? '' : 's'} queued` : ''}
                </span>
              </>
            ) : (
              <>
                <ArrowPathIcon className="h-4 w-4 flex-none" />
                <span className="min-w-0 flex-1 truncate">
                  {queued} message{queued === 1 ? '' : 's'} waiting to send
                </span>
                <button
                  type="button"
                  onClick={() => flush()}
                  disabled={flushing}
                  className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold disabled:opacity-60 dark:bg-black/30"
                >
                  {flushing ? 'Sending…' : 'Send now'}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => navigate('/backup')}
              aria-label="Open backup and offline settings"
              className="rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <CircleStackIcon className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default OfflineBanner
