import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CameraIcon,
  UserPlusIcon,
  XMarkIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  LockClosedIcon,
  GlobeAltIcon,
  HashtagIcon,
} from '@heroicons/react/24/outline'
import Input from '../common/Input'
import Button from '../common/Button'
import Avatar from '../common/Avatar'
import SearchBar from '../common/SearchBar'
import Modal from '../common/Modal'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const CreateGroup = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1) // 1: Details, 2: Add Members, 3: Settings
  const [groupData, setGroupData] = useState({
    name: '',
    description: '',
    avatar: null,
    type: 'group', // group, channel, broadcast
    privacy: 'private', // private, public
    members: [],
    admins: [],
    settings: {
      allowMemberAdd: true,
      allowMemberRemove: false,
      allowEditInfo: false,
      approveMembers: false,
      muteAll: false,
      restrictedMode: false,
    }
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [isCreating, setIsCreating] = useState(false)

  const groupTypes = [
    {
      id: 'group',
      name: 'Group',
      description: 'Chat with multiple people',
      icon: UserGroupIcon,
      maxMembers: 256,
    },
    {
      id: 'channel',
      name: 'Channel',
      description: 'Broadcast to large audiences',
      icon: HashtagIcon,
      maxMembers: 'Unlimited',
    },
    {
      id: 'broadcast',
      name: 'Broadcast List',
      description: 'Send messages to multiple contacts',
      icon: GlobeAltIcon,
      maxMembers: 256,
    },
  ]

  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const { data } = await api.get(`/users/search?q=${query}`)
      setSearchResults(data.users.filter(
        user => !groupData.members.some(m => m._id === user._id)
      ))
    } catch (error) {
      toast.error('Failed to search users')
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddMember = (user) => {
    if (groupData.members.length >= 256) {
      toast.error('Maximum group size reached')
      return
    }

    setGroupData(prev => ({
      ...prev,
      members: [...prev.members, user]
    }))
    setSearchResults(prev => prev.filter(u => u._id !== user._id))
    toast.success(`${user.name} added`)
  }

  const handleRemoveMember = (userId) => {
    setGroupData(prev => ({
      ...prev,
      members: prev.members.filter(m => m._id !== userId),
      admins: prev.admins.filter(id => id !== userId)
    }))
  }

  const handleToggleAdmin = (userId) => {
    setGroupData(prev => ({
      ...prev,
      admins: prev.admins.includes(userId)
        ? prev.admins.filter(id => id !== userId)
        : [...prev.admins, userId]
    }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }

      setGroupData(prev => ({ ...prev, avatar: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateGroup = async () => {
    // Validation
    if (!groupData.name.trim()) {
      toast.error('Group name is required')
      return
    }

    if (groupData.members.length === 0 && groupData.type === 'group') {
      toast.error('Add at least one member')
      return
    }

    setIsCreating(true)
    try {
      const formData = new FormData()
      formData.append('name', groupData.name)
      formData.append('description', groupData.description)
      formData.append('type', groupData.type)
      formData.append('privacy', groupData.privacy)
      formData.append('members', JSON.stringify(groupData.members.map(m => m._id)))
      formData.append('admins', JSON.stringify(groupData.admins))
      formData.append('settings', JSON.stringify(groupData.settings))
      
      if (groupData.avatar) {
        formData.append('avatar', groupData.avatar)
      }

      const { data } = await api.post('/groups/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success(`${groupData.type === 'group' ? 'Group' : 'Channel'} created successfully`)
      onSuccess(data.group)
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create group')
    } finally {
      setIsCreating(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex justify-center">
              <label className="relative cursor-pointer group">
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Group" className="w-full h-full object-cover" />
                  ) : (
                    <CameraIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <CameraIcon className="w-6 h-6 text-white" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>

            {/* Group Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {groupTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.id}
                      onClick={() => setGroupData(prev => ({ ...prev, type: type.id }))}
                      className={clsx(
                        'p-3 rounded-lg border-2 transition-all',
                        groupData.type === type.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      )}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {type.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Max: {type.maxMembers}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Group Name */}
            <Input
              label="Name"
              value={groupData.name}
              onChange={(e) => setGroupData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={`Enter ${groupData.type} name`}
              maxLength={100}
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={groupData.description}
                onChange={(e) => setGroupData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={`What's this ${groupData.type} about?`}
                rows={3}
                className="input-field resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {groupData.description.length}/500
              </p>
            </div>

            {/* Privacy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Privacy
              </label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="privacy"
                    value="private"
                    checked={groupData.privacy === 'private'}
                    onChange={(e) => setGroupData(prev => ({ ...prev, privacy: e.target.value }))}
                    className="text-primary-600"
                  />
                  <div className="flex items-center gap-1">
                    <LockClosedIcon className="w-4 h-4" />
                    <span className="text-sm">Private</span>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="privacy"
                    value="public"
                    checked={groupData.privacy === 'public'}
                    onChange={(e) => setGroupData(prev => ({ ...prev, privacy: e.target.value }))}
                    className="text-primary-600"
                  />
                  <div className="flex items-center gap-1">
                    <GlobeAltIcon className="w-4 h-4" />
                    <span className="text-sm">Public</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            {/* Search */}
            <SearchBar
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search users to add..."
              loading={isSearching}
            />

            {/* Selected Members */}
            {groupData.members.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Selected Members ({groupData.members.length})
                  </p>
                  <button
                    onClick={() => setGroupData(prev => ({ ...prev, members: [] }))}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {groupData.members.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full"
                    >
                      <Avatar src={member.avatar} alt={member.name} size="xs" />
                      <span className="text-sm">{member.name}</span>
                      {groupData.admins.includes(member._id) && (
                        <span className="text-xs px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded">
                          Admin
                        </span>
                      )}
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        className="ml-1 text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            <div className="max-h-64 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar src={user.avatar} alt={user.name} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddMember(user)}
                        className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
                      >
                        <UserPlusIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : searchQuery && !isSearching ? (
                <p className="text-center text-gray-500 py-8">No users found</p>
              ) : null}
            </div>

            {/* Make Admins */}
            {groupData.members.length > 0 && groupData.type === 'group' && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Group Admins
                </p>
                <div className="space-y-2">
                  {groupData.members.map((member) => (
                    <label
                      key={member._id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar src={member.avatar} alt={member.name} size="sm" />
                        <span className="text-sm">{member.name}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={groupData.admins.includes(member._id)}
                        onChange={() => handleToggleAdmin(member._id)}
                        className="rounded text-primary-600"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Group Settings
            </h3>
            
            {Object.entries({
              allowMemberAdd: 'Allow members to add others',
              allowMemberRemove: 'Allow members to remove others',
              allowEditInfo: 'Allow members to edit group info',
              approveMembers: 'Approve new members',
              muteAll: 'Only admins can send messages',
              restrictedMode: 'Restricted mode (admins approve all messages)',
            }).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {label}
                </span>
                <input
                  type="checkbox"
                  checked={groupData.settings[key]}
                  onChange={(e) => setGroupData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, [key]: e.target.checked }
                  }))}
                  className="toggle-switch"
                />
              </label>
            ))}
          </div>
        )
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Create ${groupData.type === 'group' ? 'Group' : groupData.type === 'channel' ? 'Channel' : 'Broadcast List'}`}
      size="lg"
    >
      <div className="min-h-[400px]">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-6">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  step >= s
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                )}
              >
                {step > s ? <CheckIcon className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={clsx(
                    'w-16 h-0.5',
                    step > s ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            variant="primary"
            onClick={step === 3 ? handleCreateGroup : () => setStep(step + 1)}
            loading={isCreating}
            disabled={
              (step === 1 && !groupData.name) ||
              (step === 2 && groupData.members.length === 0 && groupData.type === 'group')
            }
          >
            {step === 3 ? 'Create' : 'Next'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default CreateGroup