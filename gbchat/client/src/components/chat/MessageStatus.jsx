import React from 'react'
import { CheckIcon, SignalIcon, WifiIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon, SignalIcon as SignalIconSolid } from '@heroicons/react/24/solid'
import clsx from 'clsx'

// GB WhatsApp Style Network Signal Bars
const NetworkSignal = ({ strength = 4, className = 'w-3 h-3' }) => {
  const bars = [1, 2, 3, 4]
  return (
    <div className="flex items-end gap-0.5" style={{ height: '12px' }}>
      {bars.map((bar) => (
        <div
          key={bar}
          className={clsx(
            'w-1 rounded-sm transition-all duration-300',
            bar <= strength ? 'bg-current' : 'bg-gray-400/30',
            bar === 1 && 'h-1.5',
            bar === 2 && 'h-2.5',
            bar === 3 && 'h-3.5',
            bar === 4 && 'h-4.5'
          )}
        />
      ))}
    </div>
  )
}

// Enhanced tick component with GB WhatsApp styling
const MessageStatus = ({
  status,
  showNetwork = false,
  networkStrength = 4,
  hideSecondTick = false,
  hideBlueTicks = false,
  exactTimestamp = false,
  timestamp
}) => {
  // Network indicator for GB WhatsApp style
  const renderNetworkIndicator = () => {
    if (!showNetwork) return null

    return (
      <span className="flex items-center gap-0.5 mr-1" title={`Signal strength: ${networkStrength}/4`}>
        <NetworkSignal strength={networkStrength} />
      </span>
    )
  }

  // Status indicators with enhanced styling
  const renderStatusIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <div className="flex items-center gap-1">
            {renderNetworkIndicator()}
            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )

      case 'sent':
        return (
          <div className="flex items-center gap-0.5">
            {renderNetworkIndicator()}
            <CheckIcon className="w-3.5 h-3.5" />
          </div>
        )

      case 'delivered':
        if (hideSecondTick) {
          // Show only one tick if hide second tick is enabled
          return (
            <div className="flex items-center gap-0.5">
              {renderNetworkIndicator()}
              <CheckIcon className="w-3.5 h-3.5" />
            </div>
          )
        }
        return (
          <div className="flex items-center gap-0.5">
            {renderNetworkIndicator()}
            <div className="flex -space-x-1">
              <CheckIcon className="w-3.5 h-3.5" />
              <CheckIcon className="w-3.5 h-3.5" />
            </div>
          </div>
        )

      case 'read':
        if (hideBlueTicks) {
          // Show gray ticks instead of blue if hide blue ticks is enabled
          return (
            <div className="flex items-center gap-0.5">
              {renderNetworkIndicator()}
              <div className="flex -space-x-1">
                <CheckIcon className="w-3.5 h-3.5 text-gray-400" />
                <CheckIcon className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
          )
        }
        return (
          <div className="flex items-center gap-0.5">
            {renderNetworkIndicator()}
            <CheckCircleIcon className="w-3.5 h-3.5 text-blue-400" />
          </div>
        )

      case 'played':
        // For voice/video messages - shows when media was played
        return (
          <div className="flex items-center gap-0.5">
            {renderNetworkIndicator()}
            <div className="flex -space-x-1">
              <CheckIcon className="w-3.5 h-3.5 text-purple-400" />
              <CheckIcon className="w-3.5 h-3.5 text-purple-400" />
            </div>
          </div>
        )

      case 'failed':
        return (
          <div className="flex items-center gap-1">
            {renderNetworkIndicator()}
            <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )

      case 'scheduled':
        return (
          <div className="flex items-center gap-0.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <span className={clsx(
      'inline-flex items-center',
      exactTimestamp && timestamp ? 'gap-1' : 'gap-0.5'
    )}>
      {renderStatusIcon()}
    </span>
  )
}

export default MessageStatus
export { NetworkSignal }