import React, { useCallback, useEffect, useState } from 'react'
import { BellAlertIcon, DevicePhoneMobileIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import Button from '../common/Button'
import clsx from 'clsx'
import {
  isPushSupported,
  getPermission,
  getSubscription,
  enablePush,
  disablePush,
  sendTestPush,
  fetchPushStatus,
} from '../../lib/push'

/**
 * Push notifications card.
 *
 * Mirrors the server's view of this browser: whether the server can deliver at
 * all (VAPID configured), whether *this* device is subscribed, and how many
 * devices the account has registered. Every state has an action.
 */
const PushDeviceCard = () => {
  const [supported] = useState(() => isPushSupported())
  const [permission, setPermission] = useState(() => getPermission())
  const [subscribed, setSubscribed] = useState(false)
  const [server, setServer] = useState({ enabled: null, mine: 0, reason: null })
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    setPermission(getPermission())
    const subscription = await getSubscription()
    setSubscribed(Boolean(subscription))

    try {
      const status = await fetchPushStatus()
      setServer({
        enabled: Boolean(status?.enabled),
        mine: status?.mine ?? 0,
        reason: status?.reason || null,
      })
    } catch {
      // Offline or signed out: keep the local view, just do not claim server state.
      setServer((prev) => ({ ...prev, enabled: null }))
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleEnable = async () => {
    setBusy(true)
    const result = await enablePush()
    setBusy(false)
    if (result.ok) toast.success(result.message)
    else toast.error(result.message)
    refresh()
  }

  const handleDisable = async () => {
    setBusy(true)
    const result = await disablePush()
    setBusy(false)
    toast.success(result.message)
    refresh()
  }

  const handleTest = async () => {
    setBusy(true)
    try {
      const result = await sendTestPush()
      if (result?.success) toast.success(result.message || 'Test push sent')
      else toast.error(result?.message || 'Could not deliver the test push')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not deliver the test push')
    } finally {
      setBusy(false)
    }
  }

  const blocked = permission === 'denied'
  const serverOff = server.enabled === false

  const stateLabel = () => {
    if (!supported) return 'Not supported by this browser'
    if (serverOff) return 'Disabled on the server'
    if (blocked) return 'Blocked in browser settings'
    if (subscribed) return 'Active on this device'
    return 'Off on this device'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className={clsx(
            'rounded-lg p-2',
            subscribed ? 'bg-green-50 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'
          )}
        >
          {subscribed ? (
            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <BellAlertIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">Push notifications</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Get notified on this device even when GBChat is closed.
          </p>

          <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <span className="text-gray-400 dark:text-gray-500">This device:</span>
              <span
                className={clsx(
                  'font-medium',
                  subscribed
                    ? 'text-green-600 dark:text-green-400'
                    : blocked
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-700 dark:text-gray-200'
                )}
              >
                {stateLabel()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <DevicePhoneMobileIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span>
                {server.mine} device{server.mine === 1 ? '' : 's'} registered
              </span>
            </div>
          </dl>

          {serverOff && (
            <p className="mt-3 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2">
              The server has no VAPID keys configured ({server.reason || 'push disabled'}), so pushes
              cannot be delivered yet. In-app notifications still work.
            </p>
          )}

          {blocked && (
            <p className="mt-3 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
              Notifications are blocked for this site. Re-enable them in your browser&apos;s site
              settings, then reload this page.
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {subscribed ? (
              <>
                <Button size="sm" variant="secondary" onClick={handleDisable} disabled={busy}>
                  Turn off on this device
                </Button>
                <Button size="sm" variant="primary" onClick={handleTest} disabled={busy}>
                  Send test push
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="primary"
                onClick={handleEnable}
                disabled={busy || !supported || blocked || serverOff}
              >
                Enable push on this device
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PushDeviceCard
