/**
 * Validation utilities
 */

export const validators = {
  /**
   * Validate email
   */
  email: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  },

  /**
   * Validate password
   */
  password: (password) => {
    const errors = []
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      strength: calculatePasswordStrength(password),
    }
  },

  /**
   * Validate username
   */
  username: (username) => {
    const errors = []
    
    if (username.length < 3) {
      errors.push('Username must be at least 3 characters')
    }
    if (username.length > 30) {
      errors.push('Username must be less than 30 characters')
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, and underscores')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  /**
   * Validate phone number
   */
  phone: (phone) => {
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.length >= 10 && cleaned.length <= 15
  },

  /**
   * Validate URL
   */
  url: (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  /**
   * Validate file
   */
  file: (file, options = {}) => {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB
      allowedTypes = [],
      allowedExtensions = [],
    } = options

    const errors = []

    // Check size
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${formatFileSize(maxSize)}`)
    }

    // Check type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`File type not allowed. Allowed: ${allowedTypes.join(', ')}`)
    }

    // Check extension
    if (allowedExtensions.length > 0) {
      const extension = file.name.split('.').pop().toLowerCase()
      if (!allowedExtensions.includes(extension)) {
        errors.push(`File extension not allowed. Allowed: ${allowedExtensions.join(', ')}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  /**
   * Validate image
   */
  image: (file) => {
    return validators.file(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    })
  },

  /**
   * Validate video
   */
  video: (file) => {
    return validators.file(file, {
      maxSize: 100 * 1024 * 1024, // 100MB
      allowedTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    })
  },

  /**
   * Validate audio
   */
  audio: (file) => {
    return validators.file(file, {
      maxSize: 20 * 1024 * 1024, // 20MB
      allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
    })
  },
}

/**
 * Calculate password strength
 */
function calculatePasswordStrength(password) {
  let strength = 0
  
  // Length
  if (password.length >= 8) strength += 1
  if (password.length >= 12) strength += 1
  if (password.length >= 16) strength += 1
  
  // Character variety
  if (/[a-z]/.test(password)) strength += 1
  if (/[A-Z]/.test(password)) strength += 1
  if (/[0-9]/.test(password)) strength += 1
  if (/[!@#$%^&*]/.test(password)) strength += 1
  
  // Patterns (reduce strength)
  if (/(.)\1{2,}/.test(password)) strength -= 1
  if (/^[0-9]+$/.test(password)) strength -= 1
  
  // Return label
  if (strength < 3) return 'weak'
  if (strength < 5) return 'medium'
  if (strength < 7) return 'strong'
  return 'very-strong'
}

/**
 * Sanitize HTML
 */
export const sanitizeHTML = (html) => {
  const temp = document.createElement('div')
  temp.textContent = html
  return temp.innerHTML
}

/**
 * Validate form data
 */
export const validateForm = (formData, rules) => {
  const errors = {}
  
  Object.keys(rules).forEach((field) => {
    const value = formData[field]
    const fieldRules = rules[field]
    
    // Required
    if (fieldRules.required && !value) {
      errors[field] = `${field} is required`
      return
    }
    
    // Min length
    if (fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[field] = `${field} must be at least ${fieldRules.minLength} characters`
      return
    }
    
    // Max length
    if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors[field] = `${field} must be less than ${fieldRules.maxLength} characters`
      return
    }
    
    // Pattern
    if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
      errors[field] = fieldRules.message || `${field} format is invalid`
      return
    }
    
    // Custom validator
    if (fieldRules.validator) {
      const result = fieldRules.validator(value)
      if (!result.isValid) {
        errors[field] = result.errors[0] || `${field} is invalid`
        return
      }
    }
  })
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export default validators