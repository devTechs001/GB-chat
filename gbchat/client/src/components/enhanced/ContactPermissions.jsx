import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  ShieldCheckIcon,
  NoSymbolIcon,
  StarIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

const tabs = [
  { id: 'privacy', label: 'Privacy', icon: ShieldCheckIcon },
  { id: 'blocked', label: 'Blocked', icon: NoSymbolIcon },
  { id: 'favorites', label: 'Favorites', icon: StarIcon },
  { id: 'export', label: 'Export', icon: ArrowDownTrayIcon },
]

const ContactPermissions = ({ isOpen, onClose, contacts = [], onUpdate }) => {
  const [activeTab, setActiveTab] = useState('privacy')
  const [privacy, setPrivacy] = useState({
    lastSeen: 'everyone',
    profilePhoto: 'everyone',
    about: 'everyone',
    status: 'contacts',
    readReceipts: true,
    blueTicks: true,
  })

  if (!isOpen) return null

  const blockedContacts = contacts.filter(c => c.isBlocked)
  const favoriteContacts = contacts.filter(c => c.isFavorite)
  const visibilityOptions = ['everyone', 'contacts', 'nobody']

  const handlePrivacyChange = (key, value) => {
    setPrivacy(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Contact Permissions</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2',
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              )}>
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              {['lastSeen', 'profilePhoto', 'about', 'status'].map(key => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <select value={privacy[key]} onChange={(e) => handlePrivacyChange(key, e.target.value)}
                    className="text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500">
                    {visibilityOptions.map(opt => (
                      <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                    ))}
                  </select>
                </div>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                {[{ key: 'readReceipts', label: 'Read Receipts' }, { key: 'blueTicks', label: 'Blue Ticks' }].map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                    <input type="checkbox" checked={privacy[key]}
                      onChange={(e) => handlePrivacyChange(key, e.target.checked)}
                      className="toggle-switch" />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'blocked' && (
            <div>
              {blockedContacts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <NoSymbolIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No blocked contacts</p>
                </div>
              ) : blockedContacts.map(c => (
                <div key={c._id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.phoneNumber}</p>
                  </div>
                  <button className="text-xs text-red-500 hover:text-red-600 font-medium">Unblock</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              {favoriteContacts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <StarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No favorite contacts</p>
                </div>
              ) : favoriteContacts.map(c => (
                <div key={c._id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.phoneNumber}</p>
                  </div>
                  <button className="text-xs text-gray-500 hover:text-gray-600 font-medium">Remove</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4 text-center py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Export your contacts for backup</p>
              <div className="flex gap-3 justify-center">
                <button className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
                  Export CSV
                </button>
                <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  Export vCard
                </button>
              </div>
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500">Total Contacts: {contacts.length} | Blocked: {blockedContacts.length} | Favorites: {favoriteContacts.length}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default ContactPermissions

