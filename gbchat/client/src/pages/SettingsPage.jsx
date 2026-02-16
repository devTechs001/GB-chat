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
} from '@heroicons/react/24/outline'
import AccountSettings from '../components/settings/AccountSettings'
import NotificationSettings from '../components/settings/NotificationSettings'
import PrivacySettings from '../components/settings/PrivacySettings'
import AppearanceSettings from '../components/settings/AppearanceSettings'
import ChatSettings from '../components/settings/ChatSettings'
import StorageSettings from '../components/settings/StorageSettings'
import AboutSection from '../components/settings/AboutSection'
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
    { id: 'help', label: 'Help', icon: QuestionMarkCircleIcon, component: () => <div>Help Section</div> },
    { id: 'about', label: 'About', icon: InformationCircleIcon, component: AboutSection },
  ]

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component

  return (
    <div className="flex flex-col md:flex-row h-full bg-gray-50 dark:bg-dark-bg">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h1>
      </div>

      {/* Sidebar - Scrollable on mobile */}
      <div className="md:w-64 lg:w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
        <div className="hidden md:block px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h1>
        </div>
        
        {/* Mobile: Horizontal scroll, Desktop: Vertical list */}
        <div className="flex md:flex-col gap-2 p-3 md:p-4 overflow-x-auto md:overflow-visible scrollbar-hide">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg',
                  'transition-colors duration-200',
                  'min-w-max md:w-full',
                  activeSection === section.id
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{section.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="p-4 md:p-6 lg:p-8"
        >
          {ActiveComponent && <ActiveComponent />}
        </motion.div>
      </div>
    </div>
  )
}

export default SettingsPage