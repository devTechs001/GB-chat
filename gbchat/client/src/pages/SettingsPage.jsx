import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
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
  ChevronRightIcon,
  ArrowLeftIcon,
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
import PageHeader from '../components/layout/PageHeader'
import clsx from 'clsx'

const SECTIONS = [
  { id: 'account', label: 'Account', description: 'Profile, security & sessions', icon: UserCircleIcon, component: AccountSettings },
  { id: 'notifications', label: 'Notifications', description: 'Alerts, sounds & do not disturb', icon: BellIcon, component: NotificationSettings },
  { id: 'privacy', label: 'Privacy', description: 'Last seen, read receipts & blocking', icon: LockClosedIcon, component: PrivacySettings },
  { id: 'appearance', label: 'Appearance', description: 'Themes, wallpapers & chat effects', icon: PaintBrushIcon, component: AppearanceSettings },
  { id: 'chats', label: 'Chats', description: 'History, media quality & backups', icon: ChatBubbleLeftRightIcon, component: ChatSettings },
  { id: 'storage', label: 'Storage', description: 'Data usage & cache cleaner', icon: CloudArrowUpIcon, component: StorageSettings },
  { id: 'help', label: 'Help', description: 'Guides and support', icon: QuestionMarkCircleIcon, component: HelpCenter },
  { id: 'about', label: 'About', description: 'Version & legal', icon: InformationCircleIcon, component: AboutSection },
]

/**
 * SettingsPage
 *  lg+  : permanent section sidebar + content pane
 *  < lg : section list (master) ⇄ section content (detail)
 */
const SettingsPage = () => {
  const navigate = useNavigate()
  const { section: routeSection } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedSection = routeSection || searchParams.get('section') || 'account'
  const isValidSection = SECTIONS.some((entry) => entry.id === requestedSection)

  const [activeSection, setActiveSection] = useState(isValidSection ? requestedSection : 'account')
  const [showGBFeaturesDrawer, setShowGBFeaturesDrawer] = useState(false)
  const [mobileContentOpen, setMobileContentOpen] = useState(false)

  const currentSection = SECTIONS.find((section) => section.id === activeSection) || SECTIONS[0]
  const ActiveComponent = currentSection.component

  // Deep links (/settings/privacy, /settings?section=help) win over local state,
  // so notifications can link straight to the pane they are talking about.
  useEffect(() => {
    if (!routeSection && !searchParams.get('section')) return
    if (!isValidSection) {
      setSearchParams({}, { replace: true })
      return
    }
    setActiveSection(requestedSection)
    setMobileContentOpen(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedSection, isValidSection])

  const openSection = (sectionId) => {
    setActiveSection(sectionId)
    setMobileContentOpen(true)
    // Keep the URL shareable without remounting the page.
    navigate(`/settings/${sectionId}`, { replace: true })
  }

  const SectionList = ({ onSelect }) => (
    <div className="p-3 space-y-1">
      {SECTIONS.map((section) => {
        const Icon = section.icon
        const isActive = activeSection === section.id
        return (
          <button
            key={section.id}
            onClick={() => onSelect(section.id)}
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors',
              isActive
                ? 'bg-primary-500/10 text-primary-700 dark:text-primary-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            <span
              className={clsx(
                'w-9 h-9 flex-shrink-0 rounded-lg flex items-center justify-center',
                isActive
                  ? 'bg-primary-500/15 text-primary-600 dark:text-primary-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              )}
            >
              <Icon className="w-5 h-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium truncate">{section.label}</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
                {section.description}
              </span>
            </span>
            <ChevronRightIcon className="w-4 h-4 flex-shrink-0 text-gray-300 dark:text-gray-600 lg:hidden" />
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="flex flex-col h-full min-h-0 bg-gray-50 dark:bg-gray-950">
      {/* ---------------- Mobile: section list ---------------- */}
      <div className={clsx('flex-col h-full min-h-0', mobileContentOpen ? 'hidden' : 'flex lg:hidden')}>
        <PageHeader
          title="Settings"
          subtitle="Account, privacy and appearance"
          icon={UserCircleIcon}
        />
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-4">
          <SectionList onSelect={openSection} />

          <div className="px-3 pb-4">
            <button
              onClick={() => setShowGBFeaturesDrawer(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg shadow-green-500/20 active:scale-[0.99] transition"
            >
              <SparklesIcon className="w-5 h-5" />
              <span className="text-sm font-semibold flex-1 text-left">GB Features</span>
              <ChevronRightIcon className="w-4 h-4 opacity-80" />
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- Main / desktop layout ---------------- */}
      <div className={clsx('flex-1 min-h-0 overflow-hidden', mobileContentOpen ? 'flex' : 'hidden lg:flex')}>
        {/* Section sidebar (desktop only) */}
        <aside className="hidden lg:flex flex-col w-72 xl:w-80 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200/80 dark:border-gray-800">
          <div className="px-5 py-4 border-b border-gray-200/80 dark:border-gray-800">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage your account and app</p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <SectionList onSelect={openSection} />
            <div className="px-3 pb-4">
              <button
                onClick={() => setShowGBFeaturesDrawer(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-md shadow-green-500/20 hover:shadow-lg transition"
              >
                <SparklesIcon className="w-5 h-5" />
                <span className="text-sm font-semibold flex-1 text-left">GB Features</span>
                <SparklesIcon className="w-4 h-4 opacity-60" />
              </button>
            </div>
          </div>
        </aside>

        {/* Content pane */}
        <div className="flex-1 min-w-0 flex flex-col h-full min-h-0 bg-white dark:bg-gray-900">
          {/* Mobile detail header */}
          <div className="lg:hidden">
            <PageHeader
              title={currentSection.label}
              subtitle={currentSection.description}
              icon={currentSection.icon}
              actions={
                <button
                  onClick={() => setMobileContentOpen(false)}
                  className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Back to settings"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
              }
            />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="min-h-full px-4 py-5 md:px-6 md:py-6 lg:px-8"
            >
              <div className="max-w-3xl">
                {ActiveComponent ? <ActiveComponent /> : <GBFeaturesSettings />}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ---------------- GB Features drawer ---------------- */}
      <AnimatePresence>
        {showGBFeaturesDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGBFeaturesDrawer(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-[600px] lg:w-[640px] bg-white dark:bg-gray-900 z-[90] shadow-2xl flex flex-col"
              role="dialog"
              aria-label="GB Features"
            >
              <div className="flex-shrink-0 bg-gradient-to-r from-green-500 to-teal-500 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SparklesIcon className="w-6 h-6 text-white" />
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">GB Features</h2>
                    <p className="text-xs text-white/80">Enhanced messaging features</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGBFeaturesDrawer(false)}
                  aria-label="Close"
                  className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
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
