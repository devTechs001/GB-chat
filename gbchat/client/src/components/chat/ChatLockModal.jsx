import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const FingerprintIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-4.824 1.589l.92-.92a8.002 8.002 0 00-1.836-1.598M6.188 7.374a3.996 3.996 0 012.588-1.374h.032a3.975 3.975 0 012.29 1.004m0 0a3.981 3.981 0 012.29-1.004h.032a3.996 3.996 0 012.588 1.374m-6.44 6.44a8.002 8.002 0 001.836 1.598l.92.92m-4.576-8.45a11.935 11.935 0 013.688-.548c1.306 0 2.553.193 3.688.548" />
  </svg>
)

const FingerprintIconSolid = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-4.824 1.589l.92-.92a8.002 8.002 0 00-1.836-1.598M6.188 7.374a3.996 3.996 0 012.588-1.374h.032a3.975 3.975 0 012.29 1.004m0 0a3.981 3.981 0 012.29-1.004h.032a3.996 3.996 0 012.588 1.374m-6.44 6.44a8.002 8.002 0 001.836 1.598l.92.92m-4.576-8.45a11.935 11.935 0 013.688-.548c1.306 0 2.553.193 3.688.548"/>
  </svg>
)

const ChatLockModal = ({ isOpen, onClose, chat, onUnlock }) => {
  const [pin, setPin] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [lockStatus, setLockStatus] = useState(null)
  const [error, setError] = useState('')
  const [attemptsRemaining, setAttemptsRemaining] = useState(5)
  const inputRefs = useRef([])

  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '', '', ''])
      setError('')
      setAttemptsRemaining(5)
      // Focus first input
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && chat?._id) {
      fetchLockStatus()
    }
  }, [isOpen, chat])

  const fetchLockStatus = async () => {
    try {
      const { data } = await api.get(`/chat-lock/status/${chat._id}`)
      setLockStatus(data)
    } catch (error) {
      console.error('Failed to fetch lock status:', error)
    }
  }

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    
    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    
    if (!/^\d+$/.test(pastedData)) return

    const newPin = [...pin]
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newPin[i] = char
    })
    setPin(newPin)

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length - 1, 5)
    inputRefs.current[lastIndex]?.focus()
  }

  const handleUnlock = async () => {
    const pinString = pin.join('')
    
    if (pinString.length !== 6) {
      setError('Please enter complete PIN')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const { data } = await api.post('/chat-lock/unlock', {
        chatId: chat._id,
        pin: pinString
      })

      toast.success('Chat unlocked!')
      onUnlock?.(data.chatLock)
      onClose()
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to unlock'
      setError(message)
      
      if (error.response?.status === 423) {
        // Locked due to too many attempts
        setAttemptsRemaining(0)
      } else if (error.response?.data?.attemptsRemaining !== undefined) {
        setAttemptsRemaining(error.response.data.attemptsRemaining)
      }
      
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBiometricUnlock = async () => {
    if (!window.PublicKeyCredential) {
      toast.error('Biometric authentication not supported')
      return
    }

    setIsLoading(true)
    try {
      // WebAuthn biometric authentication
      const publicKeyOptions = {
        challenge: new Uint8Array(32),
        rpId: window.location.hostname,
        allowCredentials: []
      }

      const credential = await navigator.credentials.get({
        publicKey: publicKeyOptions
      })

      // Send credential to server for verification
      const { data } = await api.post('/chat-lock/unlock-biometric', {
        chatId: chat._id,
        credential
      })

      toast.success('Chat unlocked with biometric!')
      onUnlock?.(data.chatLock)
      onClose()
    } catch (error) {
      console.error('Biometric unlock failed:', error)
      toast.error('Biometric authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-full">
                <LockClosedIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Chat Locked</h2>
                <p className="text-sm text-white/80">Enter PIN to unlock</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Chat info */}
          {chat && (
            <div className="mt-4 flex items-center gap-3 bg-white/10 rounded-lg p-3">
              <img
                src={chat.avatar || `https://ui-avatars.com/api/?name=${chat.name}`}
                alt={chat.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <p className="font-medium text-white">{chat.name}</p>
                <p className="text-xs text-white/70">
                  {lockStatus?.lockType === 'both' ? 'PIN + Biometric' : 'PIN Protected'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium">
                {error}
                {attemptsRemaining < 5 && attemptsRemaining > 0 && (
                  <span className="block mt-1">
                    {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
                  </span>
                )}
              </p>
            </div>
          )}

          {/* PIN inputs */}
          <div className="flex justify-center gap-2">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading || attemptsRemaining === 0}
                className={clsx(
                  'w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all',
                  'bg-gray-50 dark:bg-gray-800',
                  'border-gray-200 dark:border-gray-700',
                  'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
                  'text-gray-900 dark:text-white',
                  error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                )}
              />
            ))}
          </div>

          {/* Biometric option */}
          {lockStatus?.biometricEnabled && (
            <div className="flex items-center justify-center">
              <button
                onClick={handleBiometricUnlock}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FingerprintIconSolid className="w-5 h-5 text-primary-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Use Fingerprint
                </span>
              </button>
            </div>
          )}

          {/* Unlock button */}
          <button
            onClick={handleUnlock}
            disabled={isLoading || pin.join('').length !== 6 || attemptsRemaining === 0}
            className={clsx(
              'w-full py-3 rounded-xl font-semibold text-white transition-all',
              'bg-gradient-to-r from-primary-500 to-primary-600',
              'hover:from-primary-600 hover:to-primary-700',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isLoading && 'animate-pulse'
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Unlocking...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <LockOpenIcon className="w-5 h-5" />
                Unlock Chat
              </span>
            )}
          </button>

          {/* Help text */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            {lockStatus?.autoLockTimeout && (
              <span>
                Auto-locks after {lockStatus.autoLockTimeout / 60000} minutes of inactivity
              </span>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default ChatLockModal
