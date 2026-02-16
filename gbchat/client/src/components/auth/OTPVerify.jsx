import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Button from '../common/Button'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const OTPVerify = ({ email, onVerified, onResend }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const inputRefs = useRef([])

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pastedData = value.slice(0, 6).split('')
      const newOtp = [...otp]
      pastedData.forEach((char, i) => {
        if (index + i < 6) {
          newOtp[index + i] = char
        }
      })
      setOtp(newOtp)
      
      // Focus last filled input
      const lastFilledIndex = Math.min(index + pastedData.length, 5)
      inputRefs.current[lastFilledIndex]?.focus()
      return
    }

    // Handle single character
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      toast.error('Please enter complete OTP')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/auth/verify-otp', {
        email,
        otp: otpCode,
      })
      toast.success('OTP verified successfully')
      onVerified(data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-otp', { email })
      toast.success('OTP sent successfully')
      setResendTimer(60)
      onResend?.()
    } catch (error) {
      toast.error('Failed to resend OTP')
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Verify Your Email
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Enter the 6-digit code sent to <strong>{email}</strong>
        </p>
      </div>

      {/* OTP Input */}
      <div className="flex gap-2 justify-center">
        {otp.map((digit, index) => (
          <motion.input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            whileFocus={{ scale: 1.05 }}
          />
        ))}
      </div>

      {/* Verify Button */}
      <Button
        variant="primary"
        fullWidth
        onClick={handleVerify}
        loading={loading}
        disabled={loading || otp.join('').length !== 6}
      >
        Verify OTP
      </Button>

      {/* Resend */}
      <div className="text-center text-sm">
        {resendTimer > 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            Resend OTP in <span className="font-medium">{resendTimer}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            className="text-primary-600 hover:underline font-medium"
          >
            Resend OTP
          </button>
        )}
      </div>
    </div>
  )
}

export default OTPVerify