import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  VideoCameraIcon,
  StarIcon,
  UserMinusIcon,
  PencilIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import Avatar from '../common/Avatar'
import Button from '../common/Button'
import IconButton from '../common/IconButton'
import Modal from '../common/Modal'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

const ContactProfile = ({ contact, isOpen, onClose, onEdit }) => {
  const [isFavorite, setIsFavorite] = useState(contact.isFavorite)
  const [isBlocked, setIsBlocked] = useState(contact.isBlocked)

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await api.delete(`/contacts/${contact._id}/favorite`)
        toast.success('Removed from favorites')
      } else {
        await api.post(`/contacts/${contact._id}/favorite`)
        toast.success('Added to favorites')
      }
      setIsFavorite(!isFavorite)
    } catch (error) {
      toast.error('Failed to update favorite status')
    }
  }

  const handleToggleBlock = async () => {
    if (
      !isBlocked &&
      !confirm('Are you sure you want to block this contact?')
    ) {
      return
    }

    try {
      if (isBlocked) {
        await api.post(`/users/${contact._id}/unblock`)
        toast.success('Contact unblocked')
      } else {
        await api.post(`/users/${contact._id}/block`)
        toast.success('Contact blocked')
      }
      setIsBlocked(!isBlocked)
    } catch (error) {
      toast.error('Failed to update block status')
    }
  }

  const handleDeleteContact = async () => {
    if (!confirm('Are you sure you want to delete this contact?')) return

    try {
      await api.delete(`/contacts/${contact._id}`)
      toast.success('Contact deleted')
      onClose()
    } catch (error) {
      toast.error('Failed to delete contact')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Profile Header */}
        <div className="text-center pt-8 pb-6">
          <Avatar
            src={contact.avatar}
            alt={contact.name}
            size="xl"
            status={contact.isOnline ? 'online' : 'offline'}
            className="mx-auto mb-4"
          />
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {contact.name}
            </h2>
            {isFavorite && (
              <StarSolidIcon className="w-6 h-6 text-yellow-500" />
            )}
          </div>
          {contact.status && (
            <p className="text-gray-500 dark:text-gray-400">
              {contact.status}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-2 mb-6">
          <IconButton
            icon={<ChatBubbleLeftIcon />}
            variant="primary"
            size="lg"
            tooltip="Message"
          />
          <IconButton
            icon={<PhoneIcon />}
            variant="secondary"
            size="lg"
            tooltip="Call"
          />
          <IconButton
            icon={<VideoCameraIcon />}
            variant="secondary"
            size="lg"
            tooltip="Video Call"
          />
          <IconButton
            icon={isFavorite ? <StarSolidIcon /> : <StarIcon />}
            variant="secondary"
            size="lg"
            tooltip={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            onClick={handleToggleFavorite}
          />
        </div>

        {/* Contact Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Contact Information
          </h3>

          {contact.phone && (
            <div className="flex items-center gap-3">
              <PhoneIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Phone
                </p>
                <p className="text-gray-900 dark:text-white">{contact.phone}</p>
              </div>
            </div>
          )}

          {contact.email && (
            <div className="flex items-center gap-3">
              <EnvelopeIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Email
                </p>
                <p className="text-gray-900 dark:text-white">{contact.email}</p>
              </div>
            </div>
          )}

          {contact.location && (
            <div className="flex items-center gap-3">
              <MapPinIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Location
                </p>
                <p className="text-gray-900 dark:text-white">
                  {contact.location}
                </p>
              </div>
            </div>
          )}

          {contact.addedAt && (
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Added
                </p>
                <p className="text-gray-900 dark:text-white">
                  {formatDistanceToNow(new Date(contact.addedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Groups in Common */}
        {contact.commonGroups?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Groups in Common ({contact.commonGroups.length})
            </h3>
            <div className="space-y-2">
              {contact.commonGroups.slice(0, 3).map((group) => (
                <div
                  key={group._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Avatar src={group.avatar} alt={group.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {group.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {group.memberCount} members
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 space-y-2">
          <Button
            variant="secondary"
            fullWidth
            icon={<PencilIcon className="w-5 h-5" />}
            onClick={onEdit}
          >
            Edit Contact
          </Button>

          <Button
            variant={isBlocked ? 'secondary' : 'danger'}
            fullWidth
            icon={<UserMinusIcon className="w-5 h-5" />}
            onClick={handleToggleBlock}
          >
            {isBlocked ? 'Unblock Contact' : 'Block Contact'}
          </Button>

          <Button
            variant="danger"
            fullWidth
            onClick={handleDeleteContact}
          >
            Delete Contact
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ContactProfile