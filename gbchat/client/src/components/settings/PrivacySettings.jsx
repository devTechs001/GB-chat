import React, { useState } from 'react'
import {
  EyeIcon,
  EyeSlashIcon,
  UserGroupIcon,
  ClockIcon,
  PhotoIcon,
  PhoneIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  FingerPrintIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import Button from '../common/Button'
import Modal from '../common/Modal'
import Input from '../common/Input'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const PrivacySettings = () => {
  const [privacySettings, setPrivacySettings] = useState({
    lastSeen: 'everyone',
    profilePhoto: 'contacts',
    about: 'everyone',
    status: 'contacts',
    readReceipts: true,
    groups: 'everyone',
    calls: 'contacts',
    onlineStatus: true,
    typingIndicator: true,
    messageForwarding: true,
  })

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    biometricLock: false,
    appLock: false,
    lockTimer: 'immediately',
    encryptedBackup: true,
    securityNotifications: true,
  })

  const [blockedUsers, setBlockedUsers] = useState([])
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  const privacyOptions = [
    { value: 'everyone', label: 'Everyone' },
    { value: 'contacts', label: 'My Contacts' },
    { value: 'nobody', label: 'Nobody' },
  ]

  const lockTimerOptions = [
    { value: 'immediately', label: 'Immediately' },
    { value: '1min', label: 'After 1 minute' },
    { value: '5min', label: 'After 5 minutes' },
    { value: '15min', label: 'After 15 minutes' },
    { value: '1hour', label: 'After 1 hour' },
  ]

  const handlePrivacyChange = (setting, value) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: value }))
    toast.success(`${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} updated`)
  }

  const handleSecurityToggle = (setting) => {
    if (setting === 'twoFactorAuth' && !security[setting]) {
      setShow2FAModal(true)
      return
    }
    
    setSecurity(prev => ({ ...prev, [setting]: !prev[setting] }))
    toast.success(`${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} ${security[setting] ? 'disabled' : 'enabled'}`)
  }

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match')
      return
    }
    
    if (passwords.new.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    // API call to change password
    try {
      // await api.post('/auth/change-password', passwords)
      toast.success('Password changed successfully')
      setShowPasswordModal(false)
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (error) {
      toast.error('Failed to change password')
    }
  }

  const handleBlockUser = (userId) => {
    setBlockedUsers(prev => [...prev, userId])
    toast.success('User blocked')
    setShowBlockModal(false)
  }

  const handleUnblockUser = (userId) => {
    setBlockedUsers(prev => prev.filter(id => id !== userId))
    toast.success('User unblocked')
  }

  const setup2FA = async () => {
    // Generate QR code and secret
    try {
      // const { data } = await api.post('/auth/2fa/setup')
      // Show QR code and verification
      setSecurity(prev => ({ ...prev, twoFactorAuth: true }))
      toast.success('Two-factor authentication enabled')
      setShow2FAModal(false)
    } catch (error) {
      toast.error('Failed to enable 2FA')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Privacy & Security
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your privacy settings and secure your account
        </p>
      </div>

      {/* Security Alert */}
      {!security.twoFactorAuth && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                Enhance Your Security
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Enable two-factor authentication to add an extra layer of security to your account.
              </p>
              <Button
                size="sm"
                variant="primary"
                className="mt-2"
                onClick={() => setShow2FAModal(true)}
              >
                Enable 2FA
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <EyeIcon className="w-5 h-5" />
            Privacy
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {/* Last Seen */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <ClockIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Last Seen
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Control who can see your last seen time
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              {privacyOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handlePrivacyChange('lastSeen', option.value)}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    privacySettings.lastSeen === option.value
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Photo */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <PhotoIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Profile Photo
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Control who can see your profile photo
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              {privacyOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handlePrivacyChange('profilePhoto', option.value)}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    privacySettings.profilePhoto === option.value
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Privacy Options */}
          <div className="p-6 space-y-4">
            <label className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Read Receipts
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Show when you've read messages
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={privacySettings.readReceipts}
                onChange={(e) => handlePrivacyChange('readReceipts', e.target.checked)}
                className="toggle-switch"
              />
            </label>

            <label className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserGroupIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Group Invites
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Who can add you to groups
                  </p>
                </div>
              </div>
              <select
                value={privacySettings.groups}
                onChange={(e) => handlePrivacyChange('groups', e.target.value)}
                className="text-sm rounded-lg px-3 py-1 bg-gray-100 dark:bg-gray-700"
              >
                {privacyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5" />
            Security
          </h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {/* Two-Factor Authentication */}
          <div className="p-6">
            <label className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <KeyIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Two-Factor Authentication
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add an extra layer of security
                  </p>
                  {security.twoFactorAuth && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 mt-1">
                      Active
                    </span>
                  )}
                </div>
              </div>
              <input
                type="checkbox"
                checked={security.twoFactorAuth}
                onChange={() => handleSecurityToggle('twoFactorAuth')}
                className="toggle-switch"
              />
            </label>
          </div>

          {/* Biometric Lock */}
          <div className="p-6">
            <label className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FingerPrintIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Biometric Lock
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Use fingerprint or face to unlock
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={security.biometricLock}
                onChange={() => handleSecurityToggle('biometricLock')}
                className="toggle-switch"
              />
            </label>
          </div>

          {/* App Lock */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <LockClosedIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    App Lock
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Require authentication to open app
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={security.appLock}
                onChange={() => handleSecurityToggle('appLock')}
                className="toggle-switch"
              />
            </div>
            
            {security.appLock && (
              <div className="ml-8 mt-3">
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Auto-lock after
                </label>
                <select
                  value={security.lockTimer}
                  onChange={(e) => setSecurity(prev => ({ ...prev, lockTimer: e.target.value }))}
                  className="mt-1 block w-full rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-700 text-sm"
                >
                  {lockTimerOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="p-6">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-3 text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              <KeyIcon className="w-5 h-5" />
              <span className="font-medium">Change Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* Blocked Users */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Blocked Users
            </h3>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowBlockModal(true)}
            >
              Block User
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          {blockedUsers.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No blocked users
            </p>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map(userId => (
                <div
                  key={userId}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        User {userId}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Blocked on date
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUnblockUser(userId)}
                  >
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <div className="space-y-4">
          <Input
            type="password"
            label="Current Password"
            value={passwords.current}
            onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
          />
          <Input
            type="password"
            label="New Password"
            value={passwords.new}
            onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
          />
          <Input
            type="password"
            label="Confirm New Password"
            value={passwords.confirm}
            onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
          />
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowPasswordModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePasswordChange}
            >
              Change Password
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        title="Enable Two-Factor Authentication"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Scan this QR code with your authenticator app
          </p>
          <div className="flex justify-center">
            <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg">
              {/* QR Code would go here */}
            </div>
          </div>
          <Input
            label="Verification Code"
            placeholder="Enter 6-digit code"
            maxLength={6}
          />
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShow2FAModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={setup2FA}
            >
              Enable 2FA
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PrivacySettings