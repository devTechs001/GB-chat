import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  UsersIcon,
  PhoneIcon,
  VideoCameraIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline'
import ContactCard from './ContactCard'
import SearchBar from '../common/SearchBar'
import Button from '../common/Button'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const ContactList = ({ onContactSelect, onCreateChat }) => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all') // all, favorites, blocked

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const { data } = await api.get('/contacts')
      setContacts(data.contacts)
    } catch (error) {
      toast.error('Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }

  const handleAddContact = () => {
    // Open add contact modal
    console.log('Add contact')
  }

  const filteredContacts = contacts.filter((contact) => {
    // Apply filter
    if (filter === 'favorites' && !contact.isFavorite) return false
    if (filter === 'blocked' && !contact.isBlocked) return false

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        contact.name.toLowerCase().includes(query) ||
        contact.phone?.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query)
      )
    }

    return true
  })

  // Group contacts by first letter
  const groupedContacts = filteredContacts.reduce((groups, contact) => {
    const firstLetter = contact.name.charAt(0).toUpperCase()
    if (!groups[firstLetter]) {
      groups[firstLetter] = []
    }
    groups[firstLetter].push(contact)
    return groups
  }, {})

  const filters = [
    { id: 'all', label: 'All Contacts', count: contacts.length },
    {
      id: 'favorites',
      label: 'Favorites',
      count: contacts.filter((c) => c.isFavorite).length,
    },
    {
      id: 'blocked',
      label: 'Blocked',
      count: contacts.filter((c) => c.isBlocked).length,
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Contacts
          </h2>
          <Button
            variant="primary"
            size="sm"
            icon={<UserPlusIcon className="w-4 h-4" />}
            onClick={handleAddContact}
          >
            Add Contact
          </Button>
        </div>

        {/* Search */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search contacts..."
        />

        {/* Filters */}
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
          {filters.map((filterItem) => (
            <button
              key={filterItem.id}
              onClick={() => setFilter(filterItem.id)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                filter === filterItem.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              )}
            >
              {filterItem.label} ({filterItem.count})
            </button>
          ))}
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        {Object.keys(groupedContacts).length === 0 ? (
          <div className="text-center py-12 px-4">
            <UsersIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No contacts found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery
                ? 'Try different search terms'
                : 'Add your first contact to get started'}
            </p>
            {!searchQuery && (
              <Button variant="primary" onClick={handleAddContact}>
                Add Contact
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900">
            {Object.keys(groupedContacts)
              .sort()
              .map((letter) => (
                <div key={letter}>
                  {/* Letter Header */}
                  <div className="sticky top-0 z-10 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {letter}
                    </h3>
                  </div>

                  {/* Contacts */}
                  <AnimatePresence>
                    {groupedContacts[letter].map((contact, index) => (
                      <motion.div
                        key={contact._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ContactCard
                          contact={contact}
                          onClick={() => onContactSelect(contact)}
                          onMessage={() => onCreateChat(contact)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ContactList