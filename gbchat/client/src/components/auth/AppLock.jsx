import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LockClosedIcon,
  LockOpenIcon,
  KeyIcon,
  FingerPrintIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import Button from '../common/Button'
import Modal from '../common/Modal'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const AppLock = ({ onUnlock, onClose }) => {
  const [lockType, setLockType] = useState(null) // 'pattern' or 'pin'
  const [pattern, setPattern] = useState([])
  const [pin, setPin] = useState('')
  const [savedPattern, setSavedPattern] = useState(null)
  const [savedPin, setSavedPin] = useState(null)
  const [error, setError] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(true)
  const gridRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    // Load saved lock data
    const savedLockType = localStorage.getItem('app-lock-type')
    const savedPatternData = localStorage.getItem('app-lock-pattern')
    const savedPinData = localStorage.getItem('app-lock-pin')

    if (savedLockType === 'pattern' && savedPatternData) {
      setSavedPattern(JSON.parse(savedPatternData))
      setLockType('pattern')
    } else if (savedLockType === 'pin' && savedPinData) {
      setSavedPin(savedPinData)
      setLockType('pin')
    } else {
      // No lock set, allow setup
      setLockType('setup')
    }
  }, [])

  const handlePatternPoint = (index) => {
    if (!pattern.includes(index)) {
      const newPattern = [...pattern, index]
      setPattern(newPattern)

      // Check if pattern is complete (minimum 4 points)
      if (newPattern.length >= 4) {
        verifyPattern(newPattern)
      }
    }
  }

  const verifyPattern = (testPattern) => {
    if (savedPattern && JSON.stringify(testPattern) === JSON.stringify(savedPattern)) {
      handleSuccess()
    } else {
      handleError()
    }
  }

  const handlePinDigit = (digit) => {
    if (pin.length < 6) {
      const newPin = pin + digit
      setPin(newPin)

      // Auto-verify when PIN reaches saved length
      if (savedPin && newPin.length === savedPin.length) {
        verifyPin(newPin)
      }
    }
  }

  const handlePinDelete = () => {
    setPin(pin.slice(0, -1))
  }

  const verifyPin = (testPin) => {
    if (testPin === savedPin) {
      handleSuccess()
    } else {
      handleError()
    }
  }

  const handleSuccess = () => {
    setIsLocked(false)
    setError(false)
    setAttempts(0)
    toast.success('Unlock successful!')
    setTimeout(() => {
      if (onUnlock) onUnlock()
    }, 500)
  }

  const handleError = () => {
    setError(true)
    setAttempts(attempts + 1)
    setPattern([])
    setPin('')

    if (attempts >= 4) {
      toast.error('Too many failed attempts. Please wait.')
      // Lock for 30 seconds
      setTimeout(() => {
        setAttempts(0)
        setError(false)
      }, 30000)
    } else {
      toast.error('Incorrect lock')
      setTimeout(() => setError(false), 1000)
    }
  }

  const resetLock = () => {
    localStorage.removeItem('app-lock-type')
    localStorage.removeItem('app-lock-pattern')
    localStorage.removeItem('app-lock-pin')
    toast.success('App lock removed')
    if (onClose) onClose()
  }

  if (lockType === 'setup') {
    return <AppLockSetup onClose={onClose} />
  }

  if (lockType === 'pattern') {
    return (
      <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <LockClosedIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              App Locked
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Draw your pattern to unlock
            </p>
            {attempts > 0 && (
              <p className="text-red-500 text-sm mt-2">
                {5 - attempts} attempts remaining
              </p>
            )}
          </div>

          {/* Pattern Grid */}
          <div className="mb-6">
            <div
              ref={gridRef}
              className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 relative"
              onMouseLeave={() => setIsDrawing(false)}
              onMouseUp={() => setIsDrawing(false)}
            >
              <div className="grid grid-cols-3 gap-4 h-full">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                  <button
                    key={index}
                    onMouseDown={() => {
                      setIsDrawing(true)
                      handlePatternPoint(index)
                    }}
                    onMouseEnter={() => {
                      if (isDrawing) {
                        handlePatternPoint(index)
                      }
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault()
                      setIsDrawing(true)
                      handlePatternPoint(index)
                    }}
                    className={clsx(
                      'rounded-full transition-all duration-200',
                      pattern.includes(index)
                        ? 'bg-gradient-to-br from-green-500 to-teal-500 scale-110'
                        : 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'
                    )}
                    style={{
                      width: '100%',
                      height: '100%',
                      minWidth: '48px',
                      minHeight: '48px',
                    }}
                  />
                ))}
              </div>

              {/* Pattern lines SVG overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {pattern.length > 1 &&
                  pattern.map((pointIndex, i) => {
                    if (i === 0) return null
                    const prevPoint = pattern[i - 1]
                    const prevRow = Math.floor(prevPoint / 3)
                    const prevCol = prevPoint % 3
                    const currRow = Math.floor(pointIndex / 3)
                    const currCol = pointIndex % 3

                    return (
                      <line
                        key={i}
                        x1={`${(prevCol * 33.33) + 16.67}%`}
                        y1={`${(prevRow * 33.33) + 16.67}%`}
                        x2={`${(currCol * 33.33) + 16.67}%`}
                        y2={`${(currRow * 33.33) + 16.67}%`}
                        stroke="#10B981"
                        strokeWidth="4"
                        strokeLinecap="round"
                        className="transition-all duration-200"
                      />
                    )
                  })}
              </svg>
            </div>
          </div>

          {/* Error indicator */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center justify-center gap-2 text-red-500 mb-4"
              >
                <XCircleIcon className="w-5 h-5" />
                <span className="font-medium">Incorrect pattern</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={resetLock}
              className="flex-1 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors"
            >
              Remove Lock
            </button>
            <button
              onClick={() => setLockType('pin')}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors text-gray-700 dark:text-gray-300"
            >
              Use PIN
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (lockType === 'pin') {
    return (
      <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              App Locked
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your PIN to unlock
            </p>
            {attempts > 0 && (
              <p className="text-red-500 text-sm mt-2">
                {5 - attempts} attempts remaining
              </p>
            )}
          </div>

          {/* PIN display */}
          <div className="flex justify-center gap-3 mb-8">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className={clsx(
                  'w-4 h-4 rounded-full border-2 transition-all',
                  index < pin.length
                    ? 'bg-blue-500 border-blue-500 scale-110'
                    : 'border-gray-300 dark:border-gray-600'
                )}
              />
            ))}
          </div>

          {/* PIN keypad */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                onClick={() => handlePinDigit(digit.toString())}
                className="aspect-square bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl text-2xl font-bold text-gray-900 dark:text-white transition-colors"
              >
                {digit}
              </button>
            ))}
            <div />
            <button
              onClick={() => handlePinDigit('0')}
              className="aspect-square bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl text-2xl font-bold text-gray-900 dark:text-white transition-colors"
            >
              0
            </button>
            <button
              onClick={handlePinDelete}
              className="aspect-square bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 rounded-2xl flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
              </svg>
            </button>
          </div>

          {/* Error indicator */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-2 text-red-500 mb-4"
              >
                <XCircleIcon className="w-5 h-5" />
                <span className="font-medium">Incorrect PIN</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={resetLock}
              className="flex-1 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors"
            >
              Remove Lock
            </button>
            <button
              onClick={() => setLockType('pattern')}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors text-gray-700 dark:text-gray-300"
            >
              Use Pattern
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

// App Lock Setup Component
const AppLockSetup = ({ onClose }) => {
  const [setupStep, setSetupStep] = useState(1) // 1: type selection, 2: setup, 3: confirm
  const [selectedType, setSelectedType] = useState(null)
  const [setupPattern, setSetupPattern] = useState([])
  const [confirmPattern, setConfirmPattern] = useState([])
  const [setupPin, setSetupPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)

  const handleSelectType = (type) => {
    setSelectedType(type)
    setSetupStep(2)
  }

  const handlePatternPoint = (index) => {
    if (!setupPattern.includes(index)) {
      const newPattern = [...setupPattern, index]
      setSetupPattern(newPattern)

      if (newPattern.length >= 4) {
        if (setupStep === 2) {
          setSetupStep(3)
          toast.success('Pattern recorded! Please confirm')
        } else if (setupStep === 3) {
          verifySetupPattern(newPattern)
        }
      }
    }
  }

  const verifySetupPattern = (testPattern) => {
    if (JSON.stringify(testPattern) === JSON.stringify(setupPattern)) {
      saveLock()
    } else {
      toast.error('Patterns do not match. Please try again.')
      setSetupPattern([])
      setConfirmPattern([])
      setSetupStep(2)
    }
  }

  const handlePinDigit = (digit) => {
    if (setupStep === 2 && setupPin.length < 6) {
      const newPin = setupPin + digit
      setSetupPin(newPin)
      if (newPin.length >= 4) {
        setSetupStep(3)
        toast.success('PIN recorded! Please confirm')
      }
    } else if (setupStep === 3 && confirmPin.length < 6) {
      const newConfirmPin = confirmPin + digit
      setConfirmPin(newConfirmPin)
      if (newConfirmPin.length === setupPin.length) {
        verifySetupPin(newConfirmPin)
      }
    }
  }

  const verifySetupPin = (testPin) => {
    if (testPin === setupPin) {
      saveLock()
    } else {
      toast.error('PINs do not match. Please try again.')
      setSetupPin('')
      setConfirmPin('')
      setSetupStep(2)
    }
  }

  const saveLock = () => {
    if (selectedType === 'pattern') {
      localStorage.setItem('app-lock-type', 'pattern')
      localStorage.setItem('app-lock-pattern', JSON.stringify(setupPattern))
    } else if (selectedType === 'pin') {
      localStorage.setItem('app-lock-type', 'pin')
      localStorage.setItem('app-lock-pin', setupPin)
    }
    toast.success('App lock enabled successfully!')
    if (onClose) onClose()
  }

  const handlePinDelete = () => {
    if (setupStep === 2) {
      setSetupPin(setupPin.slice(0, -1))
    } else {
      setConfirmPin(confirmPin.slice(0, -1))
    }
  }

  return (
    <div className="space-y-6">
      {setupStep === 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Choose Lock Type
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Select how you want to lock your app
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleSelectType('pattern')}
              className="w-full p-4 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl hover:border-green-400 dark:hover:border-green-600 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <FingerPrintIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">Pattern Lock</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Draw a pattern to unlock</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleSelectType('pin')}
              className="w-full p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl hover:border-blue-400 dark:hover:border-blue-600 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <KeyIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">PIN Code</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">4-6 digit PIN to unlock</p>
                </div>
              </div>
            </button>
          </div>
        </motion.div>
      )}

      {setupStep === 2 && selectedType === 'pattern' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Draw Your Pattern
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Connect at least 4 dots
            </p>
          </div>

          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 relative">
            <div className="grid grid-cols-3 gap-4 h-full">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                <button
                  key={index}
                  onMouseDown={() => {
                    setIsDrawing(true)
                    handlePatternPoint(index)
                  }}
                  onMouseEnter={() => {
                    if (isDrawing) handlePatternPoint(index)
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault()
                    setIsDrawing(true)
                    handlePatternPoint(index)
                  }}
                  className={clsx(
                    'rounded-full transition-all duration-200',
                    setupPattern.includes(index)
                      ? 'bg-gradient-to-br from-green-500 to-teal-500 scale-110'
                      : 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'
                  )}
                  style={{ width: '100%', height: '100%', minWidth: '48px', minHeight: '48px' }}
                />
              ))}
            </div>
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {setupPattern.length > 1 &&
                setupPattern.map((pointIndex, i) => {
                  if (i === 0) return null
                  const prevPoint = setupPattern[i - 1]
                  const prevRow = Math.floor(prevPoint / 3)
                  const prevCol = prevPoint % 3
                  const currRow = Math.floor(pointIndex / 3)
                  const currCol = pointIndex % 3
                  return (
                    <line
                      key={i}
                      x1={`${(prevCol * 33.33) + 16.67}%`}
                      y1={`${(prevRow * 33.33) + 16.67}%`}
                      x2={`${(currCol * 33.33) + 16.67}%`}
                      y2={`${(currRow * 33.33) + 16.67}%`}
                      stroke="#10B981"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  )
                })}
            </svg>
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {setupPattern.length} dots selected (minimum 4)
          </p>
        </motion.div>
      )}

      {setupStep === 3 && selectedType === 'pattern' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Confirm Pattern
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Draw the same pattern again
            </p>
          </div>

          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 relative">
            <div className="grid grid-cols-3 gap-4 h-full">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                <button
                  key={index}
                  onMouseDown={() => {
                    setIsDrawing(true)
                    setConfirmPattern([...confirmPattern, index])
                  }}
                  onMouseEnter={() => {
                    if (isDrawing) setConfirmPattern([...confirmPattern, index])
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault()
                    setIsDrawing(true)
                    setConfirmPattern([...confirmPattern, index])
                  }}
                  className={clsx(
                    'rounded-full transition-all duration-200',
                    confirmPattern.includes(index)
                      ? 'bg-gradient-to-br from-blue-500 to-purple-500 scale-110'
                      : 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'
                  )}
                  style={{ width: '100%', height: '100%', minWidth: '48px', minHeight: '48px' }}
                />
              ))}
            </div>
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {confirmPattern.length > 1 &&
                confirmPattern.map((pointIndex, i) => {
                  if (i === 0) return null
                  const prevPoint = confirmPattern[i - 1]
                  const prevRow = Math.floor(prevPoint / 3)
                  const prevCol = prevPoint % 3
                  const currRow = Math.floor(pointIndex / 3)
                  const currCol = pointIndex % 3
                  return (
                    <line
                      key={i}
                      x1={`${(prevCol * 33.33) + 16.67}%`}
                      y1={`${(prevRow * 33.33) + 16.67}%`}
                      x2={`${(currCol * 33.33) + 16.67}%`}
                      y2={`${(currRow * 33.33) + 16.67}%`}
                      stroke="#3B82F6"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  )
                })}
            </svg>
          </div>
        </motion.div>
      )}

      {setupStep === 2 && selectedType === 'pin' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Create PIN
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Enter 4-6 digits
            </p>
          </div>

          <div className="flex justify-center gap-3 mb-4">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className={clsx(
                  'w-4 h-4 rounded-full border-2 transition-all',
                  index < setupPin.length
                    ? 'bg-blue-500 border-blue-500 scale-110'
                    : 'border-gray-300 dark:border-gray-600'
                )}
              />
            ))}
          </div>

          <div className="flex justify-center mb-4">
            <button
              onClick={() => setShowPin(!showPin)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              {showPin ? <EyeSlashIcon className="w-6 h-6" /> : <EyeIcon className="w-6 h-6" />}
            </button>
          </div>

          <PINKeypad
            onDigit={handlePinDigit}
            onDelete={handlePinDelete}
            value={showPin ? setupPin : '•'.repeat(setupPin.length)}
          />
        </motion.div>
      )}

      {setupStep === 3 && selectedType === 'pin' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Confirm PIN
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Enter the same PIN again
            </p>
          </div>

          <div className="flex justify-center gap-3 mb-4">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className={clsx(
                  'w-4 h-4 rounded-full border-2 transition-all',
                  index < confirmPin.length
                    ? 'bg-green-500 border-green-500 scale-110'
                    : 'border-gray-300 dark:border-gray-600'
                )}
              />
            ))}
          </div>

          <PINKeypad
            onDigit={handlePinDigit}
            onDelete={handlePinDelete}
            value={showPin ? confirmPin : '•'.repeat(confirmPin.length)}
          />
        </motion.div>
      )}

      {/* Back button for setup steps */}
      {setupStep > 1 && (
        <button
          onClick={() => {
            setSetupStep(1)
            setSetupPattern([])
            setConfirmPattern([])
            setSetupPin('')
            setConfirmPin('')
          }}
          className="w-full px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-medium transition-colors"
        >
          Back
        </button>
      )}
    </div>
  )
}

// PIN Keypad Component
const PINKeypad = ({ onDigit, onDelete, value }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
        <button
          key={digit}
          onClick={() => onDigit(digit.toString())}
          className="aspect-square bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl text-2xl font-bold text-gray-900 dark:text-white transition-colors"
        >
          {digit}
        </button>
      ))}
      <div />
      <button
        onClick={() => onDigit('0')}
        className="aspect-square bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl text-2xl font-bold text-gray-900 dark:text-white transition-colors"
      >
        0
      </button>
      <button
        onClick={onDelete}
        className="aspect-square bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 rounded-2xl flex items-center justify-center transition-colors"
      >
        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
        </svg>
      </button>
    </div>
  )
}

export default AppLock
