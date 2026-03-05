import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  UserCircleIcon,
  BellIcon,
  LockClosedIcon,
  PaintBrushIcon,
  ChatBubbleLeftRightIcon,
  CloudArrowUpIcon,
  QuestionMarkCircleIcon,
  InformationCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import AccountSettings from '../components/settings/AccountSettings'
import NotificationSettings from '../components/settings/NotificationSettings'
import PrivacySettings from '../components/settings/PrivacySettings'
import AppearanceSettings from '../components/settings/AppearanceSettings'
import ChatSettings from '../components/settings/ChatSettings'
import StorageSettings from '../components/settings/StorageSettings'
import AboutSection from '../components/settings/AboutSection'
import HelpCenter from '../components/settings/HelpCenter'
import GBFeaturesSettings from '../components/settings/GBFeaturesSettings'
import clsx from 'clsx'

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('account')

  const sections = [
    { id: 'account', label: 'Account', icon: UserCircleIcon, component: AccountSettings },
    { id: 'notifications', label: 'Notifications', icon: BellIcon, component: NotificationSettings },
    { id: 'privacy', label: 'Privacy', icon: LockClosedIcon, component: PrivacySettings },
    { id: 'appearance', label: 'Appearance', icon: PaintBrushIcon, component: AppearanceSettings },
    { id: 'chats', label: 'Chats', icon: ChatBubbleLeftRightIcon, component: ChatSettings },
    { id: 'storage', label: 'Storage', icon: CloudArrowUpIcon, component: StorageSettings },
    { id: 'gb-features', label: 'GB Features', icon: SparklesIcon, component: GBFeaturesSettings },
    { id: 'help', label: 'Help', icon: QuestionMarkCircleIcon, component: HelpCenter },
    { id: 'about', label: 'About', icon: InformationCircleIcon, component: AboutSection },
  ]

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-dark-bg">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-10">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h1>
      </div>

      <div className="flex flex-1 overflow-hidden pb-16 md:pb-0">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden md:block md:w-64 lg:w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Desktop Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h1>
          </div>

          {/* Navigation - Vertical list on desktop */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
            <div className="flex flex-col gap-1">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg',
                      'transition-colors duration-200',
                      'w-full text-base',
                      activeSection === section.id
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{section.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto"
          >
            {activeSection === 'gb-features' ? (
              <GBFeaturesSettings />
            ) : (
              ActiveComponent ? <ActiveComponent /> : <div className="text-gray-500">Loading...</div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar - Scrollable with ALL items */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-area-pb">
        <div className="flex items-center py-2 overflow-x-auto scrollbar-hide px-2 gap-1">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={clsx(
                  'flex flex-col items-center gap-1 px-3 py-2 min-w-[64px] rounded-lg transition-colors',
                  activeSection === section.id
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium whitespace-nowrap">{section.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage