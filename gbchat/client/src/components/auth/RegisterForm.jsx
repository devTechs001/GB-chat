import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import Input from '../common/Input'
import Button from '../common/Button'
import useAuthStore from '../../store/useAuthStore'
import { validators } from '../../lib/validators'
import toast from 'react-hot-toast'

const RegisterForm = () => {
  const navigate = useNavigate()
  const { register, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registrationMethod, setRegistrationMethod] = useState('email') // 'email' or 'phone'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }

    // Check password strength
    if (name === 'password') {
      const strength = validators.password(value)
      setPasswordStrength(strength)
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (registrationMethod === 'email') {
      if (!validators.email(formData.email)) {
        newErrors.email = 'Invalid email address'
      }
    } else if (registrationMethod === 'phone') {
      if (!validators.phone(formData.phone)) {
        newErrors.phone = 'Invalid phone number'
      }
    }

    const usernameValidation = validators.username(formData.username)
    if (!usernameValidation.isValid) {
      newErrors.username = usernameValidation.errors[0]
    }

    const passwordValidation = validators.password(formData.password)
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0]
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const registrationData = {
      fullName: formData.name, // Changed from 'name' to 'fullName' to match backend
      username: formData.username,
      password: formData.password,
    }

    // Add either email or phone based on registration method
    if (registrationMethod === 'email') {
      registrationData.email = formData.email
    } else if (registrationMethod === 'phone') {
      registrationData.phone = formData.phone
    }

    const result = await register(registrationData)

    if (result.success) {
      navigate('/')
    }
  }

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return 'bg-gray-200'

    switch (passwordStrength.strength) {
      case 'weak':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'strong':
        return 'bg-green-500'
      case 'very-strong':
        return 'bg-green-600'
      default:
        return 'bg-gray-200'
    }
  }

  const getPasswordStrengthWidth = () => {
    if (!passwordStrength) return '0%'

    switch (passwordStrength.strength) {
      case 'weak':
        return '25%'
      case 'medium':
        return '50%'
      case 'strong':
        return '75%'
      case 'very-strong':
        return '100%'
      default:
        return '0%'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="John Doe"
        autoComplete="name"
      />

      {/* Registration Method Toggle */}
      <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 p-1 bg-gray-50 dark:bg-gray-700">
        <button
          type="button"
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
            registrationMethod === 'email'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
          onClick={() => setRegistrationMethod('email')}
        >
          <div className="flex items-center justify-center gap-2">
            <EnvelopeIcon className="w-4 h-4" />
            Email
          </div>
        </button>
        <button
          type="button"
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md ${
            registrationMethod === 'phone'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
          onClick={() => setRegistrationMethod('phone')}
        >
          <div className="flex items-center justify-center gap-2">
            <PhoneIcon className="w-4 h-4" />
            Phone
          </div>
        </button>
      </div>

      {/* Email or Phone Input */}
      {registrationMethod === 'email' ? (
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="john@example.com"
          autoComplete="email"
        />
      ) : (
        <Input
          label="Phone Number"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="+1 (555) 123-4567"
          autoComplete="tel"
        />
      )}

      <Input
        label="Username"
        type="text"
        name="username"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
        placeholder="johndoe"
        autoComplete="username"
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Create a strong password"
          autoComplete="new-password"
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

      {/* Password Strength Indicator */}
      {formData.password && (
        <div className="space-y-1">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
              style={{ width: getPasswordStrengthWidth() }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Password strength: <span className="font-medium">{passwordStrength?.strength || 'weak'}</span>
          </p>
        </div>
      )}

      <div className="relative">
        <Input
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          placeholder="Confirm your password"
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 bottom-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {showConfirmPassword ? (
            <EyeSlashIcon className="w-5 h-5" />
          ) : (
            <EyeIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      <div>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            className="mt-1 w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            I agree to the{' '}
            <a href="/terms" className="text-primary-600 hover:underline">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary-600 hover:underline">
              Privacy Policy
            </a>
          </span>
        </label>
        {errors.agreeToTerms && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.agreeToTerms}
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={isLoading}
        disabled={isLoading}
      >
        Create Account
      </Button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => navigate('/auth')}
          className="text-primary-600 hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  )
}

export default RegisterForm