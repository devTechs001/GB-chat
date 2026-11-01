import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowPathIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CpuChipIcon,
  ServerStackIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import Button from '../common/Button'
import clsx from 'clsx'

/**
 * System health — the operator view of what `docs/OBSERVABILITY.md` describes.
 *
 * Everything here comes from two endpoints that already existed for machines:
 *   GET /api/system/metrics          per-route latency + error counts
 *   GET /api/system/client-errors    recent browser crashes
 * This page is only the human-readable surface: no new backend concepts.
 */

const REFRESH_MS = 15000

const Stat = ({ label, value, hint, tone = 'default' }) => (
  <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
    <p
      className={clsx(
        'mt-1 text-2xl font-semibold',
        tone === 'bad' && 'text-red-600 dark:text-red-400',
        tone === 'warn' && 'text-amber-600 dark:text-amber-400',
        tone === 'good' && 'text-green-600 dark:text-green-400',
        tone === 'default' && 'text-gray-900 dark:text-white'
      )}
    >
      {value}
    </p>
    {hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
  </div>
)

const ms = (value) => (value === undefined || value === null ? '—' : `${Math.round(value)} ms`)

const SystemHealth = () => {
  const [metrics, setMetrics] = useState(null)
  const [clientErrors, setClientErrors] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [auto, setAuto] = useState(true)

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    try {
      const [metricsRes, errorsRes] = await Promise.all([
        api.get('/system/metrics'),
        api.get('/system/client-errors', { params: { limit: 10 } }),
      ])
      setMetrics(metricsRes.data)
      setClientErrors(errorsRes.data)
      setError(null)
    } catch (err) {
      const status = err?.response?.status
      setError(
        status === 401
          ? 'Sign in to view system health'
          : status === 403
          ? 'You do not have access to system health'
          : 'Could not load system health'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!auto) return undefined
    const timer = setInterval(() => load({ silent: true }), REFRESH_MS)
    return () => clearInterval(timer)
  }, [auto, load])

  const routes = useMemo(() => {
    const list = metrics?.routes || []
    return [...list].sort((a, b) => b.p95 - a.p95).slice(0, 12)
  }, [metrics])

  const handleReset = async () => {
    try {
      await api.post('/system/metrics/reset')
      toast.success('Metrics counters reset')
      load({ silent: true })
    } catch {
      toast.error('Could not reset metrics')
    }
  }

  const handleClearErrors = async () => {
    try {
      await api.delete('/system/client-errors')
      toast.success('Client error buffer cleared')
      load({ silent: true })
    } catch {
      toast.error('Could not clear the buffer')
    }
  }

  const totals = metrics?.totals || {}
  const process_ = metrics?.process || {}
  const errorRate = Number(totals.errorRate || 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            System health
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            Live request metrics for this server process, plus crashes reported by browsers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 select-none">
            <input
              type="checkbox"
              checked={auto}
              onChange={(e) => setAuto(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            Auto-refresh
          </label>
          <Button size="sm" variant="secondary" onClick={() => load()} disabled={loading}>
            <ArrowPathIcon className={clsx('w-4 h-4 mr-1', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm text-amber-800 dark:text-amber-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat
          label="Requests"
          value={totals.requests ?? '—'}
          hint={`${totals.trackedRoutes ?? 0} route templates`}
          tone="default"
        />
        <Stat
          label="Error rate"
          value={`${errorRate.toFixed(1)}%`}
          hint={`${totals.statusClasses?.['5xx'] ?? 0} server · ${totals.statusClasses?.['4xx'] ?? 0} client`}
          tone={errorRate >= 5 ? 'bad' : errorRate > 0 ? 'warn' : 'good'}
        />
        <Stat
          label="Average latency"
          value={ms(totals.avgMs)}
          hint={`${totals.slowRequests ?? 0} over ${totals.slowThresholdMs ?? 1000} ms`}
          tone={Number(totals.avgMs || 0) > 500 ? 'warn' : 'default'}
        />
        <Stat
          label="Memory"
          value={process_.memoryMb ? `${process_.memoryMb} MB` : '—'}
          hint={`pid ${process_.pid ?? '—'} · node ${process_.node ?? '—'}`}
          tone={Number(process_.memoryMb || 0) > 800 ? 'warn' : 'default'}
        />
      </div>

      <section className="rounded-xl bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <header className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <BoltIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Slowest routes (p95)</h3>
        </header>

        {routes.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
            No requests recorded yet in this process.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/40 text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Route</th>
                  <th className="px-4 py-2 font-medium text-right">Count</th>
                  <th className="px-4 py-2 font-medium text-right">p50</th>
                  <th className="px-4 py-2 font-medium text-right">p95</th>
                  <th className="px-4 py-2 font-medium text-right">Max</th>
                  <th className="px-4 py-2 font-medium text-right">Errors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {routes.map((route) => (
                  <tr key={route.route} className="text-gray-700 dark:text-gray-200">
                    <td className="px-4 py-2 font-mono text-xs whitespace-nowrap">{route.route}</td>
                    <td className="px-4 py-2 text-right">{route.count}</td>
                    <td className="px-4 py-2 text-right">{ms(route.p50)}</td>
                    <td className="px-4 py-2 text-right">{ms(route.p95)}</td>
                    <td className="px-4 py-2 text-right">{ms(route.maxMs)}</td>
                    <td
                      className={clsx(
                        'px-4 py-2 text-right',
                        route.errors > 0 && 'text-red-600 dark:text-red-400 font-medium'
                      )}
                    >
                      {route.errors}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Browser crashes
              {clientErrors?.total > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                  {clientErrors.total} total
                </span>
              )}
            </h3>
          </div>
          {(clientErrors?.reports?.length || 0) > 0 && (
            <Button size="sm" variant="secondary" onClick={handleClearErrors}>
              Clear buffer
            </Button>
          )}
        </header>

        {(clientErrors?.reports?.length || 0) === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
            No crashes reported. The route error boundary and global handlers post here.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {clientErrors.reports.map((report) => (
              <li key={report.id} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
                    {report.kind}
                  </span>
                  <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                    {report.route || '/'}
                  </span>
                  <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                    {new Date(report.at).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 break-words">
                  {report.message}
                </p>
                {report.fingerprint && clientErrors.groups?.find((g) => g.fingerprint === report.fingerprint)?.count > 1 && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Seen {clientErrors.groups.find((g) => g.fingerprint === report.fingerprint).count} times
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <CpuChipIcon className="w-5 h-5 text-gray-400" />
          <span>
            Uptime {metrics?.uptimeSeconds ? `${Math.round(metrics.uptimeSeconds / 60)} min` : '—'}
          </span>
          <ServerStackIcon className="w-5 h-5 text-gray-400 ml-3" />
          <span>Counters reset on restart</span>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/system/metrics?format=prom"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline self-center"
          >
            Prometheus output
          </a>
          <Button size="sm" variant="secondary" onClick={handleReset}>
            Reset counters
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SystemHealth
