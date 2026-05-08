import React, { useState } from 'react'
import { ArrowLeftIcon, EnvelopeIcon, PhoneIcon, ShieldCheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import Input from '../common/Input'
import Button from '../common/Button'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const ForgotPassword = ({ onBack }) => {
  const [method, setMethod] = useState('email') // 'email' or 'phone'
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('request') // 'request' or 'verify' (for phone)
  const [sent, setSent] = useState(false) // for email success

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Please enter your email')

    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
      toast.success('Password reset link sent to your email')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneRequest = async (e) => {
    e.preventDefault()
    if (!phone) return toast.error('Please enter your phone number')

    setLoading(true)
    try {
      await api.post('/auth/forgot-password/phone', { phone })
      setStep('verify')
      toast.success('Verification code sent to your phone')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneReset = async (e) => {
    e.preventDefault()
    if (!code || !newPassword) return toast.error('Please enter the code and new password')
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters')

    setLoading(true)
    try {
      await api.post('/auth/reset-password/phone', { phone, code, newPassword })
      toast.success('Password reset successfully! You can now login.')
      onBack() // Go back to login
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  // Email Success View
  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <EnvelopeIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Check Your Email
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          We've sent a password reset link to <strong>{email}</strong>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Didn't receive the email? Check your spam folder or{' '}
          <button
            onClick={() => setSent(false)}
            className="text-primary-600 hover:underline"
          >
            try again
          </button>
        </p>
        <Button variant="secondary" onClick={onBack} fullWidth>
          Back to Login
        </Button>
      </div>
    )
  }

  // Phone Verify Step
  if (method === 'phone' && step === 'verify') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setStep('request')}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Use a different number
        </button>

        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verify OTP
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Enter the 6-digit code sent to <strong>{phone}</strong> and choose a new password.
          </p>
        </div>

        <form onSubmit={handlePhoneReset} className="space-y-4">
          <Input
            label="Verification Code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            icon={<ShieldCheckIcon className="w-5 h-5 text-gray-400" />}
            maxLength={6}
          />

          <div className="relative">
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 bottom-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            Reset Password
          </Button>
        </form>
      </div>
    )
  }

  // Request View (Initial)
  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to login
      </button>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Forgot Password?
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Choose a method to recover your account
        </p>
      </div>

      {/* Method Toggle */}
      <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 p-1 bg-gray-50 dark:bg-gray-800/50">
        <button
          onClick={() => setMethod('email')}
          className={clsx(
            'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
            method === 'email' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          Email
        </button>
        <button
          onClick={() => setMethod('phone')}
          className={clsx(
            'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
            method === 'phone' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          Phone
        </button>
      </div>

      {method === 'email' ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            icon={<EnvelopeIcon className="w-5 h-5 text-gray-400" />}
            autoFocus
          />
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            Send Reset Link
          </Button>
        </form>
      ) : (
        <form onSubmit={handlePhoneRequest} className="space-y-4">
          <Input
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            icon={<PhoneIcon className="w-5 h-5 text-gray-400" />}
            autoFocus
          />
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            Send OTP
          </Button>
        </form>
      )}
    </div>
  )
}

export default ForgotPassword