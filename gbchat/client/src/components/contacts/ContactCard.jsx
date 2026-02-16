import React from 'react'
import {
  ChatBubbleLeftIcon,
  PhoneIcon,
  VideoCameraIcon,
  StarIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import Avatar from '../common/Avatar'
import Dropdown from '../common/Dropdown'
import IconButton from '../common/IconButton'
import clsx from 'clsx'

const ContactCard = ({ contact, onClick, onMessage, onCall, onVideoCall }) => {
  const menuItems = [
    { label: 'View Profile', action: 'view' },
    { label: 'Add to Favorites', action: 'favorite' },
    { label: 'Share Contact', action: 'share' },
    { divider: true },
    { label: 'Block Contact', action: 'block', danger: true },
    { label: 'Delete Contact', action: 'delete', danger: true },
  ]

  const handleMenuAction = (action) => {
    console.log('Menu action:', action, contact)
  }

  return (
    <div
      className={clsx(
        'flex items-center gap-3 px-4 py-3',
        'hover:bg-gray-50 dark:hover:bg-gray-800',
        'border-b border-gray-100 dark:border-gray-800',
        'cursor-pointer transition-colors'
      )}
      onClick={onClick}
    >
      {/* Avatar */}
      <Avatar
        src={contact.avatar}
        alt={contact.name}
        size="md"
        status={contact.isOnline ? 'online' : 'offline'}
      />

      {/* Contact Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900 dark:text-white truncate">
            {contact.name}
          </p>
          {contact.isFavorite && (
            <StarSolidIcon className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {contact.status || contact.phone || contact.email}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <IconButton
          icon={<ChatBubbleLeftIcon />}
          tooltip="Message"
          onClick={(e) => {
            e.stopPropagation()
            onMessage?.(contact)
          }}
        />
        <IconButton
          icon={<PhoneIcon />}
          tooltip="Call"
          onClick={(e) => {
            e.stopPropagation()
            onCall?.(contact)
          }}
        />
        <IconButton
          icon={<VideoCameraIcon />}
          tooltip="Video Call"
          onClick={(e) => {
            e.stopPropagation()
            onVideoCall?.(contact)
          }}
        />
        <Dropdown
          trigger={
            <IconButton
              icon={<EllipsisVerticalIcon />}
              onClick={(e) => e.stopPropagation()}
            />
          }
          items={menuItems}
          onSelect={handleMenuAction}
        />
      </div>
    </div>
  )
}

export default ContactCard