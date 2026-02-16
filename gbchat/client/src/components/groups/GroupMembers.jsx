import React, { useState } from 'react'
import {
  EllipsisVerticalIcon,
  ShieldCheckIcon,
  UserMinusIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import Avatar from '../common/Avatar'
import Dropdown from '../common/Dropdown'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const GroupMembers = ({ group, onUpdate }) => {
  const [members, setMembers] = useState(group.members || [])
  const currentUserId = localStorage.getItem('userId')
  const isAdmin = group.admins?.includes(currentUserId)

  const handleMakeAdmin = async (memberId) => {
    try {
      await api.post(`/groups/${group._id}/admins/${memberId}`)
      setMembers((prev) =>
        prev.map((m) =>
          m._id === memberId ? { ...m, isAdmin: true } : m
        )
      )
      toast.success('Member is now an admin')
      onUpdate?.()
    } catch (error) {
      toast.error('Failed to make admin')
    }
  }

  const handleRemoveAdmin = async (memberId) => {
    try {
      await api.delete(`/groups/${group._id}/admins/${memberId}`)
      setMembers((prev) =>
        prev.map((m) =>
          m._id === memberId ? { ...m, isAdmin: false } : m
        )
      )
      toast.success('Admin removed')
      onUpdate?.()
    } catch (error) {
      toast.error('Failed to remove admin')
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      await api.delete(`/groups/${group._id}/members/${memberId}`)
      setMembers((prev) => prev.filter((m) => m._id !== memberId))
      toast.success('Member removed')
      onUpdate?.()
    } catch (error) {
      toast.error('Failed to remove member')
    }
  }

  const getMenuItems = (member) => {
    const items = [
      { label: 'View Profile', action: 'view' },
      { label: 'Send Message', action: 'message' },
    ]

    if (isAdmin && member._id !== currentUserId) {
      items.push({ divider: true })
      
      if (member.isAdmin) {
        items.push({
          label: 'Remove Admin',
          action: 'remove_admin',
          icon: ShieldCheckIcon,
        })
      } else {
        items.push({
          label: 'Make Admin',
          action: 'make_admin',
          icon: ShieldCheckIcon,
        })
      }
      
      items.push({
        label: 'Remove from Group',
        action: 'remove',
        icon: UserMinusIcon,
        danger: true,
      })
    }

    return items
  }

  const handleMenuAction = (action, member) => {
    switch (action) {
      case 'view':
        // Navigate to profile
        break
      case 'message':
        // Open chat
        break
      case 'make_admin':
        handleMakeAdmin(member._id)
        break
      case 'remove_admin':
        handleRemoveAdmin(member._id)
        break
      case 'remove':
        handleRemoveMember(member._id)
        break
      default:
        break
    }
  }

  // Sort members: admins first, then alphabetically
  const sortedMembers = [...members].sort((a, b) => {
    if (a.isAdmin && !b.isAdmin) return -1
    if (!a.isAdmin && b.isAdmin) return 1
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="space-y-1">
      {sortedMembers.map((member) => (
        <div
          key={member._id}
          className={clsx(
            'flex items-center gap-3 p-3 rounded-lg',
            'hover:bg-gray-50 dark:hover:bg-gray-800',
            'transition-colors'
          )}
        >
          <Avatar
            src={member.avatar}
            alt={member.name}
            size="md"
            status={member.isOnline ? 'online' : 'offline'}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {member.name}
                {member._id === currentUserId && (
                  <span className="text-gray-500 ml-1">(You)</span>
                )}
              </p>
              {member.isAdmin && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
                  <ShieldCheckIcon className="w-3 h-3 mr-1" />
                  Admin
                </span>
              )}
              {group.createdBy === member._id && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                  <StarIcon className="w-3 h-3 mr-1" />
                  Creator
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {member.status || member.phone || 'GBChat User'}
            </p>
          </div>

          <Dropdown
            trigger={
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
              </button>
            }
            items={getMenuItems(member)}
            onSelect={(action) => handleMenuAction(action, member)}
          />
        </div>
      ))}
    </div>
  )
}

export default GroupMembers