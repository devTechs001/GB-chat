import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EyeIcon,
  EyeSlashIcon,
  ClockIcon,
  SignalIcon,
  WifiIcon,
  CheckCircleIcon,
  CheckIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import useGBFeaturesStore from '../../store/useGBFeaturesStore'

const ChatDisplaySettings = ({ onClose }) => {
  const { gbFeatures, toggleFeature, updateGBFeatures } = useGBFeaturesStore()
  const [activeTab, setActiveTab] = useState('status')
  const [localSettings, setLocalSettings] = useState({})

  const tabs = [
    { id: 'status', label: 'Status Icons', icon: CheckCircleIcon },
    { id: 'network', label: 'Network', icon: SignalIcon },
    { id: 'timestamp', label: 'Time & Date', icon: ClockIcon },
    { id: 'appearance', label: 'Appearance', icon: ({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12.5M7 21h12.5a2 2 0 002-2V5a2 2 0 00-2-2h-4" />
      </svg>
    ) },
  ]

  // Privacy settings related to message status
  const privacySettings = [
    {
      id: 'hideBlueTicks',
      label: 'Hide Blue Ticks',
      description: 'Show gray ticks instead of blue when messages are read',
      icon: EyeSlashIcon,
      section: 'privacy',
    },
    {
      id: 'hideSecondTick',
      label: 'Hide Second Tick',
      description: 'Show only one check mark instead of two for delivered messages',
      icon: CheckIcon,
      section: 'privacy',
    },
    {
      id: 'hideForwardLabel',
      label: 'Hide Forward Label',
      description: 'Remove "Forwarded" label from forwarded messages',
      icon: EyeSlashIcon,
      section: 'privacy',
    },
  ]

  // Display settings
  const displaySettings = [
    {
      id: 'showNetworkIndicator',
      label: 'Show Network Bars',
      description: 'Display signal strength indicator next to message ticks',
      icon: SignalIcon,
      section: 'display',
    },
    {
      id: 'showConnectionQuality',
      label: 'Connection Quality',
      description: 'Show connection quality indicator in chat header',
      icon: WifiIcon,
      section: 'display',
    },
    {
      id: 'showTypingIndicator',
      label: 'Typing Indicator',
      description: 'Show when contacts are typing',
      icon: EyeIcon,
      section: 'display',
    },
    {
      id: 'showOnlineStatus',
      label: 'Online Status',
      description: 'Show online/offline status for contacts',
      icon: EyeIcon,
      section: 'display',
    },
  ]

  // Timestamp settings
  const timestampSettings = [
    {
      id: 'exactTimestamps',
      label: 'Exact Timestamps',
      description: 'Show seconds in message timestamps (HH:MM:SS)',
      icon: ClockIcon,
      section: 'advanced',
    },
    {
      id: 'showLastSeenExact',
      label: 'Exact Last Seen',
      description: 'Show exact time for last seen instead of relative time',
      icon: ClockIcon,
      section: 'advanced',
    },
    {
      id: 'showDeliveryTime',
      label: 'Delivery Time',
      description: 'Show when message was delivered',
      icon: ClockIcon,
      section: 'advanced',
    },
  ]

  // Appearance settings
  const appearanceSettings = [
    {
      id: 'bubbleStyle',
      label: 'Bubble Style',
      type: 'select',
      options: [
        { value: 'modern', label: 'Modern' },
        { value: 'classic', label: 'Classic' },
        { value: 'minimal', label: 'Minimal' },
        { value: 'rounded', label: 'Rounded' },
      ],
      section: 'theme',
    },
    {
      id: 'fontSize',
      label: 'Font Size',
      type: 'slider',
      min: 12,
      max: 20,
      section: 'theme',
    },
    {
      id: 'theme',
      label: 'Theme',
      type: 'select',
      options: [
        { value: 'default', label: 'Default (Green)' },
        { value: 'dark', label: 'Dark' },
        { value: 'ocean', label: 'Ocean (Blue)' },
        { value: 'royal', label: 'Royal (Purple)' },
        { value: 'passion', label: 'Passion (Red)' },
      ],
      section: 'theme',
    },
  ]

  const handleToggle = async (setting) => {
    await toggleFeature(setting.section, setting.id)
  }

  const handleSettingChange = async (section, settingId, value) => {
    await updateGBFeatures(section, { [settingId]: value })
  }

  const isFeatureEnabled = (section, featureId) => {
    return gbFeatures?.[section]?.[featureId] || false
  }

  const renderToggle = (setting) => {
    const isEnabled = isFeatureEnabled(setting.section, setting.id)
    const Icon = setting.icon

    return (
      <div
        key={setting.id}
        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-gray-750"
      >
        <div className="flex items-start gap-3 flex-1">
          <div className={clsx(
            'p-2 rounded-lg',
            isEnabled
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              {setting.label}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {setting.description}
            </p>
          </div>
        </div>
        <button
          onClick={() => handleToggle(setting)}
          className={clsx(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            isEnabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
          )}
        >
          <span
            className={clsx(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>
    )
  }

  const renderSelect = (setting) => {
    const currentValue = gbFeatures?.[setting.section]?.[setting.id] || setting.options[0]?.value

    return (
      <div
        key={setting.id}
        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12.5M7 21h12.5a2 2 0 002-2V5a2 2 0 00-2-2h-4" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              {setting.label}
            </h4>
          </div>
        </div>
        <select
          value={currentValue}
          onChange={(e) => handleSettingChange(setting.section, setting.id, e.target.value)}
          className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
        >
          {setting.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  const renderSlider = (setting) => {
    const currentValue = gbFeatures?.[setting.section]?.[setting.id] || 14

    return (
      <div
        key={setting.id}
        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              {setting.label}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Current: {currentValue}px
            </p>
          </div>
        </div>
        <input
          type="range"
          min={setting.min}
          max={setting.max}
          value={currentValue}
          onChange={(e) => handleSettingChange(setting.section, setting.id, parseInt(e.target.value))}
          className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
        />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />

      {/* Modal/Bottom Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative bg-white dark:bg-gray-900 w-full md:max-w-2xl md:rounded-2xl shadow-2xl pointer-events-auto flex flex-col max-h-[90vh] md:max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle for mobile (drag indicator) */}
        <div className="md:hidden flex items-center justify-center py-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-500 to-primary-600 md:rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-white/20 rounded-lg">
                <EyeIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base md:text-lg font-bold text-white">
                  Chat Display Settings
                </h2>
                <p className="text-xs text-white/80 hidden md:block">
                  Customize how messages appear
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors md:ml-2 flex-shrink-0"
              title="Close settings"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                    activeTab === tab.id
                      ? 'bg-white text-primary-600 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence mode="wait">
            {activeTab === 'status' && (
              <motion.div
                key="status"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-3"
              >
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Message Status Indicators
                </h3>
                {privacySettings.map(renderToggle)}
                
                {/* Visual preview */}
                <div className="mt-4 p-4 bg-gradient-to-br from-primary-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-3">
                    Preview
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-400 w-20">Sent:</span>
                      <CheckIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-400 w-20">Delivered:</span>
                      <div className="flex -space-x-1">
                        <CheckIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        <CheckIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-400 w-20">Read:</span>
                      <CheckCircleIconSolid className="w-4 h-4 text-blue-500" />
                    </div>
                    {isFeatureEnabled('privacy', 'hideBlueTicks') && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600 dark:text-gray-400 w-20">Read (Hidden):</span>
                        <div className="flex -space-x-1">
                          <CheckIcon className="w-4 h-4 text-gray-400" />
                          <CheckIcon className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'network' && (
              <motion.div
                key="network"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-3"
              >
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Network Indicators
                </h3>
                {displaySettings.map(renderToggle)}
                
                {/* Network strength preview */}
                <div className="mt-4 p-4 bg-gradient-to-br from-primary-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-3">
                    Signal Strength Preview
                  </h4>
                  <div className="flex items-center gap-6">
                    {[4, 3, 2, 1].map((strength) => (
                      <div key={strength} className="flex flex-col items-center gap-2">
                        <div className="flex items-end gap-0.5" style={{ height: '16px' }}>
                          {[1, 2, 3, 4].map((bar) => (
                            <div
                              key={bar}
                              className={clsx(
                                'w-1 rounded-sm',
                                bar <= strength ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600',
                                bar === 1 && 'h-2',
                                bar === 2 && 'h-3.5',
                                bar === 3 && 'h-5',
                                bar === 4 && 'h-6.5'
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {strength === 4 ? 'Excellent' : strength === 3 ? 'Good' : strength === 2 ? 'Fair' : 'Poor'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'timestamp' && (
              <motion.div
                key="timestamp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-3"
              >
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Time & Date Display
                </h3>
                {timestampSettings.map(renderToggle)}
                
                {/* Timestamp preview */}
                <div className="mt-4 p-4 bg-gradient-to-br from-primary-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-3">
                    Timestamp Formats
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Standard:</span>
                      <span className="font-mono text-gray-900 dark:text-white">14:30</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Exact:</span>
                      <span className="font-mono text-gray-900 dark:text-white">14:30:45</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">With Date:</span>
                      <span className="font-mono text-gray-900 dark:text-white">14:30 • Mar 4</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-3"
              >
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Visual Appearance
                </h3>
                {appearanceSettings.map((setting) => {
                  if (setting.type === 'select') return renderSelect(setting)
                  if (setting.type === 'slider') return renderSlider(setting)
                  return null
                })}
                
                {/* Bubble style preview */}
                <div className="mt-4 p-4 bg-gradient-to-br from-primary-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-3">
                    Bubble Style Preview
                  </h4>
                  <div className="space-y-3">
                    {['modern', 'classic', 'minimal', 'rounded'].map((style) => (
                      <div key={style} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-16 capitalize">
                          {style}
                        </span>
                        <div
                          className={clsx(
                            'px-3 py-2 bg-primary-500 text-white text-xs max-w-[200px]',
                            style === 'modern' && 'rounded-2xl rounded-br-sm',
                            style === 'classic' && 'rounded-lg rounded-br-sm',
                            style === 'minimal' && 'rounded-md rounded-br-sm',
                            style === 'rounded' && 'rounded-3xl rounded-br-sm'
                          )}
                        >
                          Sample message
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 md:rounded-b-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">
              Changes are saved automatically
            </span>
            <button
              onClick={onClose}
              className="w-full md:w-auto px-6 py-2.5 bg-primary-500 text-white rounded-lg font-medium text-sm hover:bg-primary-600 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ChatDisplaySettings
