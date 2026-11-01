import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  CircleStackIcon,
  ClockIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ServerStackIcon,
  SignalSlashIcon,
  TrashIcon,
  WifiIcon,
} from '@heroicons/react/24/outline'
import PageHeader from '../components/layout/PageHeader'
import Button from '../components/common/Button'
import api from '../lib/api'
import offlineDb from '../lib/offlineDb'
import useOfflineSync from '../hooks/useOfflineSync'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const formatBytes = (bytes = 0) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

const Card = ({ icon: Icon, title, description, children, tone = 'text-primary-500' }) => (
  <section className="surface-card rounded-3xl p-4 md:p-5">
    <header className="flex items-start gap-3">
      <span className={clsx('flex h-10 w-10 flex-none items-center justify-center rounded-2xl surface-muted', tone)}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{description}</p>}
      </div>
    </header>
    <div className="mt-4">{children}</div>
  </section>
)

const Metric = ({ label, value, hint }) => (
  <div className="rounded-2xl surface-muted px-3 py-2.5">
    <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
    <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
    {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
  </div>
)

/**
 * BackupPage — local backup + offline storage.
 *
 * Three independent layers, each labelled with where the data actually lives:
 *   1. SQLite mirror on the API host  (downloadable `.db`)
 *   2. JSON export / import           (portable, works with any layer)
 *   3. Browser offline cache          (IndexedDB) + outbox for offline sends
 */
const BackupPage = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [status, setStatus] = useState(null)
  const [serverBackups, setServerBackups] = useState([])
  const [cacheStats, setCacheStats] = useState(null)
  const [busy, setBusy] = useState('')
  const [loading, setLoading] = useState(true)

  const { online, queued, flushing, flush, refresh: refreshOutbox } = useOfflineSync({ autoFlush: false })

  const load = useCallback(async () => {
    setLoading(true)

    try {
      const { data } = await api.get('/backup/local/status')
      setStatus(data)
    } catch {
      setStatus(null)
    }

    // The pre-existing Mongo-backed backup documents (scheduling, e-mail).
    try {
      const { data } = await api.get('/backup')
      const list = Array.isArray(data) ? data : data.backups || data.data?.backups || []
      setServerBackups(Array.isArray(list) ? list.slice(0, 5) : [])
    } catch {
      setServerBackups([])
    }

    try {
      setCacheStats(await offlineDb.getStats())
    } catch {
      setCacheStats(null)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const createSnapshot = async () => {
    setBusy('snapshot')
    try {
      const { data } = await api.post('/backup/local/snapshot')
      toast.success(`Snapshot created · ${data?.backup?.messages ?? 0} messages`)
      await load()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not create the backup')
    } finally {
      setBusy('')
    }
  }

  const download = async (kind) => {
    setBusy(kind)
    try {
      const { data } =
        kind === 'sqlite'
          ? await api.get('/backup/local/download', { responseType: 'blob' })
          : await api.get('/backup/local/export', { responseType: 'blob' })
      const blobUrl = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download =
        kind === 'sqlite'
          ? `gbchat-backup-${new Date().toISOString().slice(0, 10)}.db`
          : `gbchat-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(blobUrl)
      toast.success('Download started')
    } catch {
      toast.error('Create a snapshot first, then download')
    } finally {
      setBusy('')
    }
  }

  const exportLocalCache = async () => {
    setBusy('local-export')
    try {
      const payload = await offlineDb.buildLocalExport()
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `gbchat-offline-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      toast.success('Offline cache exported')
    } catch {
      toast.error('Could not export the offline cache')
    } finally {
      setBusy('')
    }
  }

  const onImportFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (file.size > 25 * 1024 * 1024) {
      return toast.error('Backup files are limited to 25 MB')
    }

    setBusy('import')
    try {
      const text = await file.text()
      const payload = JSON.parse(text)

      const restored = await offlineDb.importLocalExport(payload)
      toast.success(`Restored ${restored.chats} chats · ${restored.messages} messages`)

      // Also push it into the server-side SQLite mirror, so a device that was
      // wiped can be re-seeded server-side from the same file.
      try {
        await api.post('/backup/local/import', payload)
      } catch {
        /* offline: the browser cache above is the important part */
      }

      await load()
      await refreshOutbox()
    } catch (error) {
      toast.error(error?.message?.includes('not a GBChat')
        ? 'That file is not a GBChat backup'
        : 'Could not import this file')
    } finally {
      setBusy('')
    }
  }

  const deleteSnapshot = async () => {
    if (!window.confirm('Delete the SQLite backup stored on the server?')) return
    setBusy('delete')
    try {
      await api.delete('/backup/local')
      toast.success('Local backup deleted')
      await load()
    } catch {
      toast.error('Could not delete the backup')
    } finally {
      setBusy('')
    }
  }

  const clearBrowserCache = async () => {
    if (!window.confirm('Clear the offline cache on this device? Queued messages will be lost.')) return
    setBusy('clear')
    try {
      await offlineDb.clearAll()
      await load()
      await refreshOutbox()
      toast.success('Offline cache cleared')
    } catch {
      toast.error('Could not clear the cache')
    } finally {
      setBusy('')
    }
  }

  const backup = status?.backup
  const sqlite = status?.sqlite

  return (
    <div className="flex h-full min-h-0 flex-col bg-gray-50 dark:bg-dark-bg">
      <PageHeader
        title="Backup & offline"
        subtitle="Local SQLite mirror, exports and the on-device cache"
        icon={CircleStackIcon}
        actions={
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-3xl space-y-3 p-4 pb-10">
          {/* Connection state */}
          <div
            className={clsx(
              'flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-medium',
              online
                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
            )}
          >
            {online ? <WifiIcon className="h-4 w-4" /> : <SignalSlashIcon className="h-4 w-4" />}
            {online ? 'Connected' : 'Offline — cached data is being used'}
            {queued > 0 && (
              <span className="ml-auto rounded-full bg-white/70 px-2 py-0.5 dark:bg-black/30">
                {queued} queued
              </span>
            )}
          </div>

          {/* 1. SQLite mirror */}
          <Card
            icon={CircleStackIcon}
            title="Local SQLite backup"
            description="One database file on the server, rebuilt on demand"
          >
            {loading ? (
              <div className="h-16 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Metric label="Size" value={formatBytes(backup?.sizeBytes)} />
                  <Metric label="Chats" value={backup?.chats ?? 0} />
                  <Metric label="Messages" value={backup?.messages ?? 0} />
                  <Metric label="Contacts" value={backup?.contacts ?? 0} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {backup?.lastSnapshotAt
                      ? `Snapshot ${formatDistanceToNow(new Date(backup.lastSnapshotAt), { addSuffix: true })}`
                      : 'No snapshot yet'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ServerStackIcon className="h-3.5 w-3.5" />
                    {sqlite?.available ? `node:sqlite · ${sqlite.runtime}` : 'SQLite unavailable'}
                  </span>
                  <span>Mongo: {status?.mongo?.state || 'unknown'}</span>
                </div>

                {!sqlite?.available && (
                  <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                    <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 flex-none" />
                    The API host needs Node 22.5+ (built-in <code className="mx-1">node:sqlite</code>) for server-side
                    backups. The browser cache below still works.
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    loading={busy === 'snapshot'}
                    icon={<CloudArrowUpIcon className="h-4 w-4" />}
                    onClick={createSnapshot}
                  >
                    Create snapshot
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={busy === 'sqlite'}
                    icon={<ArrowDownTrayIcon className="h-4 w-4" />}
                    onClick={() => download('sqlite')}
                  >
                    .db file
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={busy === 'json'}
                    icon={<DocumentTextIcon className="h-4 w-4" />}
                    onClick={() => download('json')}
                  >
                    JSON
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={busy === 'delete'}
                    icon={<TrashIcon className="h-4 w-4" />}
                    onClick={deleteSnapshot}
                  >
                    Delete
                  </Button>
                </div>
              </>
            )}
          </Card>

          {/* 2. Offline cache */}
          <Card
            icon={CloudArrowUpIcon}
            title="On-device offline cache"
            description="IndexedDB — chats and recent messages available without a network"
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Metric label="Engine" value={cacheStats?.engine || '—'} />
              <Metric label="Chats" value={cacheStats?.chats ?? 0} />
              <Metric label="Messages" value={cacheStats?.messages ?? 0} />
              <Metric
                label="Queued"
                value={cacheStats?.queued ?? queued}
                hint="Waiting to send"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                loading={flushing}
                disabled={!queued}
                icon={<CloudArrowUpIcon className="h-4 w-4" />}
                onClick={() => flush()}
              >
                Send {queued || 0} queued
              </Button>
              <Button
                variant="secondary"
                size="sm"
                loading={busy === 'local-export'}
                icon={<ArrowDownTrayIcon className="h-4 w-4" />}
                onClick={exportLocalCache}
              >
                Export offline data
              </Button>
              <Button
                variant="secondary"
                size="sm"
                loading={busy === 'import'}
                icon={<ArrowUpTrayIcon className="h-4 w-4" />}
                onClick={() => fileInputRef.current?.click()}
              >
                Restore from file
              </Button>
              <Button
                variant="secondary"
                size="sm"
                loading={busy === 'clear'}
                icon={<TrashIcon className="h-4 w-4" />}
                onClick={clearBrowserCache}
              >
                Clear cache
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={onImportFile}
            />
          </Card>

          {/* 3. Existing Mongo-backed backups */}
          <Card
            icon={DocumentTextIcon}
            title="Server backups"
            description="Full account backups stored in the database (auto-schedule & e-mail available)"
          >
            {serverBackups.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No account backups yet. Create one from Settings → Chats → Backups.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200/70 dark:divide-gray-800">
                {serverBackups.map((item) => (
                  <li key={item._id} className="flex items-center gap-3 py-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl surface-muted text-gray-500">
                      <CircleStackIcon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {item.type || 'full'} backup
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {item.createdAt
                          ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                          : ''}
                        {item.size ? ` · ${formatBytes(item.size)}` : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default BackupPage
