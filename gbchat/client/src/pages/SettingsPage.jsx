import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  XMarkIcon,
  Bars3Icon,
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
  const [showGBFeaturesDrawer, setShowGBFeaturesDrawer] = useState(false)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)

  const sections = [
    { id: 'account', label: 'Account', icon: UserCircleIcon, component: AccountSettings },
    { id: 'notifications', label: 'Notifications', icon: BellIcon, component: NotificationSettings },
    { id: 'privacy', label: 'Privacy', icon: LockClosedIcon, component: PrivacySettings },
    { id: 'appearance', label: 'Appearance', icon: PaintBrushIcon, component: AppearanceSettings },
    { id: 'chats', label: 'Chats', icon: ChatBubbleLeftRightIcon, component: ChatSettings },
    { id: 'storage', label: 'Storage', icon: CloudArrowUpIcon, component: StorageSettings },
    { id: 'help', label: 'Help', icon: QuestionMarkCircleIcon, component: HelpCenter },
    { id: 'about', label: 'About', icon: InformationCircleIcon, component: AboutSection },
  ]

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component

  const handleGBFeaturesClick = () => {
    setShowGBFeaturesDrawer(true)
    setShowSettingsMenu(false)
  }

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId)
    setShowSettingsMenu(false)
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-dark-bg overflow-hidden">
      {/* Mobile Header with Hamburger Menu */}
      <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Bars3Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h1>
          <div className="w-10" /> {/* Spacer for balance */}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
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
              
              {/* GB Features - Special Button with Gradient */}
              <button
                onClick={handleGBFeaturesClick}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg',
                  'transition-all duration-300',
                  'w-full text-base',
                  'mt-2',
                  'bg-gradient-to-r from-green-500 to-teal-500',
                  'text-white',
                  'shadow-lg shadow-green-500/30',
                  'hover:shadow-green-500/50',
                  'hover:scale-105'
                )}
              >
                <SparklesIcon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">GB Features</span>
                <SparklesIcon className="w-4 h-4 ml-auto opacity-60" />
              </button>
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
            <ActiveComponent />
          </motion.div>
        </div>
      </div>

      {/* Mobile Settings Menu Drawer */}
      <AnimatePresence>
        {showSettingsMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettingsMenu(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 z-50 shadow-2xl overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserCircleIcon className="w-7 h-7 text-white" />
                  <div>
                    <h2 className="text-lg font-bold text-white">Settings</h2>
                    <p className="text-xs text-white/80">Manage your account</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettingsMenu(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-white" />
                </button>
              </div>
              
              {/* Drawer Content - Settings Links */}
              <div className="overflow-y-auto h-full pb-20">
                <div className="p-4 space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon
                    return (
                      <button
                        key={section.id}
                        onClick={() => handleSectionClick(section.id)}
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
                  
                  {/* GB Features - Special Button */}
                  <button
                    onClick={handleGBFeaturesClick}
                    className={clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg',
                      'transition-all duration-300',
                      'w-full text-base',
                      'mt-2',
                      'bg-gradient-to-r from-green-500 to-teal-500',
                      'text-white',
                      'shadow-lg shadow-green-500/30',
                      'hover:shadow-green-500/50'
                    )}
                  >
                    <SparklesIcon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">GB Features</span>
                    <SparklesIcon className="w-4 h-4 ml-auto opacity-60" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* GB Features Drawer/Slide-out */}
      <AnimatePresence>
        {showGBFeaturesDrawer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGBFeaturesDrawer(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-[600px] lg:w-[700px] bg-white dark:bg-gray-900 z-50 shadow-2xl overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="sticky top-0 bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <SparklesIcon className="w-7 h-7 text-white" />
                  <div>
                    <h2 className="text-xl font-bold text-white">GB Features</h2>
                    <p className="text-xs text-white/80">Enhanced messaging features</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGBFeaturesDrawer(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-white" />
                </button>
              </div>
              
              {/* Drawer Content */}
              <div className="h-full overflow-y-auto pb-20">
                <GBFeaturesSettings />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SettingsPage