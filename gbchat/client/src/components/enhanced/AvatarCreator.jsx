import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CameraIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  SparklesIcon,
  FaceSmileIcon,
  EyeDropperIcon,
  ScissorsIcon,
  SunIcon,
  MoonIcon,
  BanknotesIcon,
  AcademicCapIcon,
  MusicalNoteIcon,
  HeartIcon,
  StarIcon,
  SparklesIcon as MagicIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'
import {
  FaceSmileIcon as FaceSmileSolid,
  SparklesIcon as SparklesSolid,
} from '@heroicons/react/24/solid'
import Button from '../common/Button'
import Modal from '../common/Modal'
import toast from 'react-hot-toast'

// Avatar customization options
const AVATAR_OPTIONS = {
  // Character base types
  characters: [
    { id: 'default', name: 'Default', icon: '😊' },
    { id: 'round', name: 'Round', icon: '👤' },
    { id: 'square', name: 'Square', icon: '🟦' },
    { id: 'minimal', name: 'Minimal', icon: '⚪' },
  ],

  // Skin tones
  skinTones: [
    { id: 'light', name: 'Light', color: '#F8D9CE' },
    { id: 'medium-light', name: 'Medium Light', color: '#E8B89A' },
    { id: 'medium', name: 'Medium', color: '#D4A574' },
    { id: 'medium-dark', name: 'Medium Dark', color: '#B8855C' },
    { id: 'dark', name: 'Dark', color: '#8B5A3C' },
    { id: 'deep', name: 'Deep', color: '#5C3A21' },
  ],

  // Outfits/Tops
  outfits: [
    { id: 'none', name: 'None', emoji: '👤' },
    { id: 'tshirt', name: 'T-Shirt', emoji: '👕' },
    { id: 'shirt', name: 'Shirt', emoji: '👔' },
    { id: 'hoodie', name: 'Hoodie', emoji: '🧥' },
    { id: 'suit', name: 'Suit', emoji: '🤵' },
    { id: 'dress', name: 'Dress', emoji: '👗' },
    { id: 'sweater', name: 'Sweater', emoji: '🧶' },
    { id: 'jacket', name: 'Jacket', emoji: '🧥' },
  ],

  // Hair styles
  hairstyles: [
    { id: 'none', name: 'Bald', emoji: '🦲' },
    { id: 'short', name: 'Short', emoji: '💇' },
    { id: 'long', name: 'Long', emoji: '👩' },
    { id: 'curly', name: 'Curly', emoji: '🦱' },
    { id: 'wavy', name: 'Wavy', emoji: '〰️' },
    { id: 'bun', name: 'Bun', emoji: '🍩' },
    { id: 'ponytail', name: 'Ponytail', emoji: '🎀' },
    { id: 'braids', name: 'Braids', emoji: '👧' },
    { id: 'afro', name: 'Afro', emoji: '🌀' },
    { id: 'mohawk', name: 'Mohawk', emoji: '🗿' },
  ],

  // Hair colors
  hairColors: [
    { id: 'black', name: 'Black', color: '#1a1a1a' },
    { id: 'brown', name: 'Brown', color: '#4a3728' },
    { id: 'blonde', name: 'Blonde', color: '#f4e4c1' },
    { id: 'red', name: 'Red', color: '#a04020' },
    { id: 'auburn', name: 'Auburn', color: '#7a3828' },
    { id: 'gray', name: 'Gray', color: '#808080' },
    { id: 'white', name: 'White', color: '#f5f5f5' },
    { id: 'blue', name: 'Blue', color: '#4169e1' },
    { id: 'pink', name: 'Pink', color: '#ff69b4' },
    { id: 'purple', name: 'Purple', color: '#9370db' },
    { id: 'green', name: 'Green', color: '#22c55e' },
    { id: 'rainbow', name: 'Rainbow', color: 'rainbow' },
  ],

  // Facial hair
  facialHair: [
    { id: 'none', name: 'None', emoji: '🧔' },
    { id: 'mustache', name: 'Mustache', emoji: '🥸' },
    { id: 'beard', name: 'Beard', emoji: '🧔' },
    { id: 'goatee', name: 'Goatee', emoji: '🐐' },
    { id: 'stubble', name: 'Stubble', emoji: '⚡' },
  ],

  // Glasses
  glasses: [
    { id: 'none', name: 'None', emoji: '👀' },
    { id: 'regular', name: 'Regular', emoji: '👓' },
    { id: 'sunglasses', name: 'Sunglasses', emoji: '🕶️' },
    { id: 'round', name: 'Round', emoji: '🔮' },
    { id: 'cat-eye', name: 'Cat Eye', emoji: '🐱' },
    { id: 'aviator', name: 'Aviator', emoji: '✈️' },
  ],

  // Headwear/Caps
  headwear: [
    { id: 'none', name: 'None', emoji: '👤' },
    { id: 'cap', name: 'Cap', emoji: '🧢' },
    { id: 'beanie', name: 'Beanie', emoji: '🧶' },
    { id: 'hat', name: 'Hat', emoji: '🎩' },
    { id: 'crown', name: 'Crown', emoji: '👑' },
    { id: 'headband', name: 'Headband', emoji: '🎀' },
    { id: 'bandana', name: 'Bandana', emoji: '🩸' },
    { id: 'helmet', name: 'Helmet', emoji: '⛑️' },
  ],

  // Accessories
  accessories: [
    { id: 'none', name: 'None', emoji: '❌' },
    { id: 'earrings', name: 'Earrings', emoji: '💎' },
    { id: 'necklace', name: 'Necklace', emoji: '📿' },
    { id: 'bowtie', name: 'Bow Tie', emoji: '🎀' },
    { id: 'scarf', name: 'Scarf', emoji: '🧣' },
    { id: 'mask', name: 'Mask', emoji: '😷' },
  ],

  // Backgrounds
  backgrounds: [
    { id: 'solid', name: 'Solid', type: 'solid' },
    { id: 'gradient', name: 'Gradient', type: 'gradient' },
    { id: 'pattern', name: 'Pattern', type: 'pattern' },
  ],

  // Background colors
  backgroundColors: [
    { id: 'blue', name: 'Blue', color: '#3b82f6' },
    { id: 'green', name: 'Green', color: '#22c55e' },
    { id: 'purple', name: 'Purple', color: '#a855f7' },
    { id: 'pink', name: 'Pink', color: '#ec4899' },
    { id: 'orange', name: 'Orange', color: '#f97316' },
    { id: 'red', name: 'Red', color: '#ef4444' },
    { id: 'yellow', name: 'Yellow', color: '#eab308' },
    { id: 'teal', name: 'Teal', color: '#14b8a6' },
    { id: 'gray', name: 'Gray', color: '#6b7280' },
    { id: 'black', name: 'Black', color: '#1f2937' },
  ],

  // Expressions
  expressions: [
    { id: 'neutral', name: 'Neutral', emoji: '😐' },
    { id: 'smile', name: 'Smile', emoji: '😊' },
    { id: 'grin', name: 'Grin', emoji: '😁' },
    { id: 'wink', name: 'Wink', emoji: '😉' },
    { id: 'cool', name: 'Cool', emoji: '😎' },
    { id: 'surprised', name: 'Surprised', emoji: '😮' },
    { id: 'thinking', name: 'Thinking', emoji: '🤔' },
    { id: 'love', name: 'Love', emoji: '😍' },
  ],

  // Special effects
  effects: [
    { id: 'none', name: 'None', icon: '❌' },
    { id: 'sparkles', name: 'Sparkles', icon: '✨' },
    { id: 'glow', name: 'Glow', icon: '💫' },
    { id: 'shadow', name: 'Shadow', icon: '🌑' },
    { id: 'outline', name: 'Outline', icon: '⭕' },
  ],
}

// Tab configuration
const TABS = [
  { id: 'base', name: 'Base', icon: FaceSmileSolid },
  { id: 'face', name: 'Face', icon: FaceSmileIcon },
  { id: 'hair', name: 'Hair', icon: ScissorsIcon },
  { id: 'clothing', name: 'Clothing', icon: Squares2X2Icon },
  { id: 'accessories', name: 'Accessories', icon: SparklesIcon },
  { id: 'background', name: 'Background', icon: SunIcon },
  { id: 'effects', name: 'Effects', icon: MagicIcon },
]

const AvatarCreator = ({ onClose, onSave, initialAvatar = null }) => {
  const [activeTab, setActiveTab] = useState('base')
  const [selectedOptions, setSelectedOptions] = useState({
    character: 'default',
    skinTone: 'medium',
    outfit: 'none',
    hairstyle: 'short',
    hairColor: 'brown',
    facialHair: 'none',
    glasses: 'none',
    headwear: 'none',
    accessories: 'none',
    background: 'solid',
    backgroundColor: 'blue',
    expression: 'smile',
    effect: 'none',
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const canvasRef = useRef(null)

  // Load initial avatar if provided
  useEffect(() => {
    if (initialAvatar) {
      // Parse saved avatar configuration
      try {
        const config = typeof initialAvatar === 'string' 
          ? JSON.parse(initialAvatar) 
          : initialAvatar
        setSelectedOptions(prev => ({ ...prev, ...config }))
      } catch (e) {
        console.error('Failed to parse initial avatar:', e)
      }
    }
  }, [initialAvatar])

  // Generate avatar preview
  useEffect(() => {
    generateAvatar()
  }, [selectedOptions])

  const handleSelectOption = useCallback((category, optionId) => {
    setSelectedOptions(prev => ({
      ...prev,
      [category]: optionId
    }))
  }, [])

  const handleRandomize = useCallback(() => {
    const randomOptions = {}
    Object.keys(AVATAR_OPTIONS).forEach(key => {
      if (key === 'backgrounds' || key === 'backgroundColors') return
      
      const options = AVATAR_OPTIONS[key]
      if (options && options.length > 0) {
        const randomIndex = Math.floor(Math.random() * options.length)
        const optionKey = key.replace('s', '') // Remove plural 's'
        randomOptions[optionKey === 'hairstyle' ? 'hairstyle' : optionKey] = options[randomIndex].id
      }
    })

    // Randomize background color
    randomOptions.backgroundColor = AVATAR_OPTIONS.backgroundColors[
      Math.floor(Math.random() * AVATAR_OPTIONS.backgroundColors.length)
    ].id

    setSelectedOptions(prev => ({ ...prev, ...randomOptions }))
    toast.success('Random avatar generated! 🎲')
  }, [])

  const handleReset = useCallback(() => {
    setSelectedOptions({
      character: 'default',
      skinTone: 'medium',
      outfit: 'none',
      hairstyle: 'short',
      hairColor: 'brown',
      facialHair: 'none',
      glasses: 'none',
      headwear: 'none',
      accessories: 'none',
      background: 'solid',
      backgroundColor: 'blue',
      expression: 'smile',
      effect: 'none',
    })
    toast.success('Avatar reset to default')
  }, [])

  const generateAvatar = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const size = canvas.width

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Draw background
    drawBackground(ctx, size, selectedOptions)

    // Draw character base
    drawCharacter(ctx, size, selectedOptions)

    // Generate data URL
    const dataUrl = canvas.toDataURL('image/png')
    setPreviewUrl(dataUrl)
  }, [selectedOptions])

  const drawBackground = (ctx, size, options) => {
    const bgColor = AVATAR_OPTIONS.backgroundColors.find(c => c.id === options.backgroundColor)?.color || '#3b82f6'

    if (options.background === 'solid') {
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, size, size)
    } else if (options.background === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 0, size, size)
      gradient.addColorStop(0, bgColor)
      gradient.addColorStop(1, lightenColor(bgColor, 30))
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, size, size)
    } else if (options.background === 'pattern') {
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, size, size)
      // Draw simple pattern
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      for (let i = 0; i < size; i += 20) {
        for (let j = 0; j < size; j += 20) {
          if ((i + j) % 40 === 0) {
            ctx.fillRect(i, j, 10, 10)
          }
        }
      }
    }
  }

  const drawCharacter = (ctx, size, options) => {
    const centerX = size / 2
    const centerY = size / 2
    const baseSize = size * 0.35

    // Get skin tone color
    const skinColor = AVATAR_OPTIONS.skinTones.find(t => t.id === options.skinTone)?.color || '#D4A574'

    // Draw character based on type
    if (options.character === 'round' || options.character === 'default') {
      // Round face
      ctx.fillStyle = skinColor
      ctx.beginPath()
      ctx.arc(centerX, centerY, baseSize, 0, Math.PI * 2)
      ctx.fill()

      // Add shadow
      ctx.shadowColor = 'rgba(0,0,0,0.2)'
      ctx.shadowBlur = 10
      ctx.shadowOffsetY = 5
    } else if (options.character === 'square') {
      // Square face with rounded corners
      ctx.fillStyle = skinColor
      ctx.beginPath()
      ctx.roundRect(centerX - baseSize, centerY - baseSize, baseSize * 2, baseSize * 2, 20)
      ctx.fill()
    } else if (options.character === 'minimal') {
      // Minimal circle
      ctx.fillStyle = skinColor
      ctx.beginPath()
      ctx.arc(centerX, centerY, baseSize * 0.8, 0, Math.PI * 2)
      ctx.fill()
    }

    // Reset shadow
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    // Draw eyes based on expression
    drawEyes(ctx, centerX, centerY, baseSize, options)

    // Draw mouth based on expression
    drawMouth(ctx, centerX, centerY, baseSize, options)

    // Draw hair
    drawHair(ctx, centerX, centerY, baseSize, options)

    // Draw outfit
    drawOutfit(ctx, centerX, centerY, baseSize, options)

    // Draw accessories
    drawAccessories(ctx, centerX, centerY, baseSize, options)

    // Draw effects
    drawEffects(ctx, centerX, centerY, baseSize, options)
  }

  const drawEyes = (ctx, centerX, centerY, baseSize, options) => {
    ctx.fillStyle = '#1a1a1a'
    const eyeY = centerY - baseSize * 0.1
    const eyeSpacing = baseSize * 0.25
    const eyeSize = baseSize * 0.08

    if (options.expression === 'wink') {
      // Left eye open
      ctx.beginPath()
      ctx.arc(centerX - eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2)
      ctx.fill()
      // Right eye winking
      ctx.beginPath()
      ctx.moveTo(centerX + eyeSpacing - eyeSize, eyeY)
      ctx.lineTo(centerX + eyeSpacing + eyeSize, eyeY)
      ctx.stroke()
    } else if (options.expression === 'cool' || options.glasses !== 'none') {
      // Sunglasses
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(centerX - eyeSpacing - eyeSize * 2, eyeY - eyeSize, eyeSize * 6, eyeSize * 2.5)
    } else {
      // Both eyes open
      ctx.beginPath()
      ctx.arc(centerX - eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2)
      ctx.arc(centerX + eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2)
      ctx.fill()

      // Eye highlights
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.beginPath()
      ctx.arc(centerX - eyeSpacing + 2, eyeY - 2, eyeSize * 0.4, 0, Math.PI * 2)
      ctx.arc(centerX + eyeSpacing + 2, eyeY - 2, eyeSize * 0.4, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const drawMouth = (ctx, centerX, centerY, baseSize, options) => {
    const mouthY = centerY + baseSize * 0.3
    const mouthWidth = baseSize * 0.3

    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'

    switch (options.expression) {
      case 'smile':
        ctx.beginPath()
        ctx.arc(centerX, mouthY - 10, mouthWidth, 0.1 * Math.PI, 0.9 * Math.PI)
        ctx.stroke()
        break
      case 'grin':
        ctx.beginPath()
        ctx.arc(centerX, mouthY - 5, mouthWidth * 0.8, 0.1 * Math.PI, 0.9 * Math.PI)
        ctx.stroke()
        // Teeth
        ctx.fillStyle = 'white'
        ctx.fillRect(centerX - mouthWidth * 0.6, mouthY - 5, mouthWidth * 1.2, 8)
        break
      case 'wink':
        ctx.beginPath()
        ctx.arc(centerX, mouthY, mouthWidth, 0.1 * Math.PI, 0.9 * Math.PI)
        ctx.stroke()
        break
      case 'cool':
        ctx.beginPath()
        ctx.moveTo(centerX - mouthWidth, mouthY)
        ctx.lineTo(centerX + mouthWidth, mouthY)
        ctx.stroke()
        break
      case 'surprised':
        ctx.fillStyle = '#1a1a1a'
        ctx.beginPath()
        ctx.arc(centerX, mouthY, mouthWidth * 0.4, 0, Math.PI * 2)
        ctx.fill()
        break
      case 'thinking':
        ctx.beginPath()
        ctx.arc(centerX, mouthY + 5, mouthWidth * 0.5, 0, Math.PI * 2)
        ctx.stroke()
        break
      case 'love':
        ctx.fillStyle = '#ef4444'
        drawHeart(ctx, centerX, mouthY, mouthWidth * 0.6)
        break
      default: // neutral
        ctx.beginPath()
        ctx.moveTo(centerX - mouthWidth * 0.5, mouthY)
        ctx.lineTo(centerX + mouthWidth * 0.5, mouthY)
        ctx.stroke()
    }
  }

  const drawHeart = (ctx, x, y, size) => {
    ctx.beginPath()
    ctx.moveTo(x, y + size * 0.3)
    ctx.bezierCurveTo(x, y, x - size, y - size * 0.8, x - size, y)
    ctx.bezierCurveTo(x - size, y + size * 0.5, x, y + size * 0.8, x, y + size * 1.2)
    ctx.bezierCurveTo(x, y + size * 0.8, x + size, y + size * 0.5, x + size, y)
    ctx.bezierCurveTo(x + size, y - size * 0.8, x, y, x, y + size * 0.3)
    ctx.fill()
  }

  const drawHair = (ctx, centerX, centerY, baseSize, options) => {
    if (options.hairstyle === 'none') return

    const hairColor = AVATAR_OPTIONS.hairColors.find(c => c.id === options.hairColor)?.color || '#4a3728'
    ctx.fillStyle = hairColor

    // Create gradient for rainbow hair
    if (options.hairColor === 'rainbow') {
      const gradient = ctx.createLinearGradient(centerX - baseSize, 0, centerX + baseSize, 0)
      gradient.addColorStop(0, '#ff0000')
      gradient.addColorStop(0.17, '#ff7f00')
      gradient.addColorStop(0.33, '#ffff00')
      gradient.addColorStop(0.5, '#00ff00')
      gradient.addColorStop(0.67, '#0000ff')
      gradient.addColorStop(0.83, '#4b0082')
      gradient.addColorStop(1, '#9400d3')
      ctx.fillStyle = gradient
    }

    switch (options.hairstyle) {
      case 'short':
        ctx.beginPath()
        ctx.arc(centerX, centerY - baseSize * 0.8, baseSize * 1.1, Math.PI, 0)
        ctx.fill()
        break
      case 'long':
        ctx.beginPath()
        ctx.arc(centerX, centerY - baseSize * 0.8, baseSize * 1.15, Math.PI, 0)
        ctx.fill()
        // Long hair sides
        ctx.fillRect(centerX - baseSize * 1.1, centerY - baseSize * 0.5, baseSize * 0.15, baseSize * 1.5)
        ctx.fillRect(centerX + baseSize * 0.95, centerY - baseSize * 0.5, baseSize * 0.15, baseSize * 1.5)
        break
      case 'curly':
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI
          const x = centerX + Math.cos(angle) * baseSize * 0.9
          const y = centerY - baseSize * 0.8 + Math.sin(angle) * baseSize * 0.5
          ctx.beginPath()
          ctx.arc(x, y, baseSize * 0.25, 0, Math.PI * 2)
          ctx.fill()
        }
        break
      case 'bun':
        ctx.beginPath()
        ctx.arc(centerX, centerY - baseSize * 1.3, baseSize * 0.4, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(centerX, centerY - baseSize * 0.8, baseSize * 1.1, Math.PI, 0)
        ctx.fill()
        break
      case 'ponytail':
        ctx.beginPath()
        ctx.arc(centerX, centerY - baseSize * 0.8, baseSize * 1.1, Math.PI, 0)
        ctx.fill()
        // Ponytail
        ctx.beginPath()
        ctx.ellipse(centerX + baseSize * 0.8, centerY - baseSize * 0.5, baseSize * 0.3, baseSize * 0.6, -0.3, 0, Math.PI * 2)
        ctx.fill()
        break
      case 'afro':
        ctx.beginPath()
        ctx.arc(centerX, centerY - baseSize * 0.5, baseSize * 1.4, 0, Math.PI * 2)
        ctx.fill()
        break
      case 'mohawk':
        ctx.fillRect(centerX - baseSize * 0.15, centerY - baseSize * 1.5, baseSize * 0.3, baseSize * 0.8)
        ctx.beginPath()
        ctx.arc(centerX, centerY - baseSize * 0.8, baseSize * 0.9, Math.PI, 0)
        ctx.fill()
        break
      default:
        ctx.beginPath()
        ctx.arc(centerX, centerY - baseSize * 0.8, baseSize * 1.1, Math.PI, 0)
        ctx.fill()
    }
  }

  const drawOutfit = (ctx, centerX, centerY, baseSize, options) => {
    if (options.outfit === 'none') return

    const outfitY = centerY + baseSize * 0.8
    const outfitWidth = baseSize * 1.8

    // Random outfit color
    const outfitColors = ['#ef4444', '#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#6b7280']
    const outfitColor = outfitColors[Math.floor(Math.random() * outfitColors.length)]
    ctx.fillStyle = outfitColor

    switch (options.outfit) {
      case 'tshirt':
        ctx.beginPath()
        ctx.moveTo(centerX - outfitWidth * 0.5, outfitY)
        ctx.lineTo(centerX + outfitWidth * 0.5, outfitY)
        ctx.lineTo(centerX + outfitWidth * 0.4, outfitY + baseSize * 0.5)
        ctx.lineTo(centerX - outfitWidth * 0.4, outfitY + baseSize * 0.5)
        ctx.closePath()
        ctx.fill()
        break
      case 'shirt':
        ctx.beginPath()
        ctx.moveTo(centerX - outfitWidth * 0.5, outfitY)
        ctx.lineTo(centerX + outfitWidth * 0.5, outfitY)
        ctx.lineTo(centerX + outfitWidth * 0.4, outfitY + baseSize * 0.5)
        ctx.lineTo(centerX - outfitWidth * 0.4, outfitY + baseSize * 0.5)
        ctx.closePath()
        ctx.fill()
        // Collar
        ctx.fillStyle = 'white'
        ctx.beginPath()
        ctx.moveTo(centerX - 10, outfitY)
        ctx.lineTo(centerX, outfitY + 15)
        ctx.lineTo(centerX + 10, outfitY)
        ctx.fill()
        break
      case 'hoodie':
        ctx.beginPath()
        ctx.arc(centerX, outfitY, baseSize * 0.9, 0, Math.PI, false)
        ctx.fill()
        break
      case 'suit':
        ctx.fillStyle = '#1f2937'
        ctx.beginPath()
        ctx.moveTo(centerX - outfitWidth * 0.5, outfitY)
        ctx.lineTo(centerX + outfitWidth * 0.5, outfitY)
        ctx.lineTo(centerX + outfitWidth * 0.4, outfitY + baseSize * 0.6)
        ctx.lineTo(centerX - outfitWidth * 0.4, outfitY + baseSize * 0.6)
        ctx.closePath()
        ctx.fill()
        // Tie
        ctx.fillStyle = '#ef4444'
        ctx.beginPath()
        ctx.moveTo(centerX, outfitY + 10)
        ctx.lineTo(centerX - 8, outfitY + 30)
        ctx.lineTo(centerX + 8, outfitY + 30)
        ctx.closePath()
        ctx.fill()
        break
      default:
        ctx.beginPath()
        ctx.arc(centerX, outfitY, baseSize * 0.8, Math.PI, 0)
        ctx.fill()
    }
  }

  const drawAccessories = (ctx, centerX, centerY, baseSize, options) => {
    // Draw glasses
    if (options.glasses !== 'none') {
      ctx.strokeStyle = '#1a1a1a'
      ctx.lineWidth = 3

      if (options.glasses === 'sunglasses') {
        ctx.fillStyle = '#1a1a1a'
        ctx.fillRect(centerX - baseSize * 0.5, centerY - baseSize * 0.15, baseSize, baseSize * 0.3)
      } else if (options.glasses === 'round') {
        ctx.beginPath()
        ctx.arc(centerX - baseSize * 0.25, centerY - baseSize * 0.1, baseSize * 0.2, 0, Math.PI * 2)
        ctx.arc(centerX + baseSize * 0.25, centerY - baseSize * 0.1, baseSize * 0.2, 0, Math.PI * 2)
        ctx.stroke()
        // Bridge
        ctx.beginPath()
        ctx.moveTo(centerX - baseSize * 0.05, centerY - baseSize * 0.1)
        ctx.lineTo(centerX + baseSize * 0.05, centerY - baseSize * 0.1)
        ctx.stroke()
      } else {
        // Regular glasses
        ctx.beginPath()
        ctx.ellipse(centerX - baseSize * 0.25, centerY - baseSize * 0.1, baseSize * 0.25, baseSize * 0.15, 0, 0, Math.PI * 2)
        ctx.ellipse(centerX + baseSize * 0.25, centerY - baseSize * 0.1, baseSize * 0.25, baseSize * 0.15, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
    }

    // Draw headwear
    if (options.headwear !== 'none') {
      if (options.headwear === 'cap') {
        ctx.fillStyle = '#3b82f6'
        ctx.beginPath()
        ctx.arc(centerX, centerY - baseSize * 0.9, baseSize * 1.1, Math.PI, 0)
        ctx.fill()
        // Cap brim
        ctx.fillRect(centerX - baseSize * 0.3, centerY - baseSize * 1.1, baseSize * 1.2, baseSize * 0.15)
      } else if (options.headwear === 'crown') {
        ctx.fillStyle = '#fbbf24'
        ctx.beginPath()
        ctx.moveTo(centerX - baseSize * 0.8, centerY - baseSize * 1.2)
        ctx.lineTo(centerX - baseSize * 0.8, centerY - baseSize * 1.5)
        ctx.lineTo(centerX - baseSize * 0.4, centerY - baseSize * 1.3)
        ctx.lineTo(centerX, centerY - baseSize * 1.6)
        ctx.lineTo(centerX + baseSize * 0.4, centerY - baseSize * 1.3)
        ctx.lineTo(centerX + baseSize * 0.8, centerY - baseSize * 1.5)
        ctx.lineTo(centerX + baseSize * 0.8, centerY - baseSize * 1.2)
        ctx.closePath()
        ctx.fill()
      }
    }
  }

  const drawEffects = (ctx, centerX, centerY, baseSize, options) => {
    if (options.effect === 'none') return

    if (options.effect === 'sparkles') {
      ctx.fillStyle = '#fbbf24'
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2
        const x = centerX + Math.cos(angle) * baseSize * 1.3
        const y = centerY + Math.sin(angle) * baseSize * 1.3
        drawStar(ctx, x, y, 5, 8, 4)
      }
    } else if (options.effect === 'glow') {
      const gradient = ctx.createRadialGradient(centerX, centerY, baseSize * 0.8, centerX, centerY, baseSize * 1.5)
      gradient.addColorStop(0, 'rgba(251, 191, 36, 0.3)')
      gradient.addColorStop(1, 'rgba(251, 191, 36, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    }
  }

  const drawStar = (ctx, cx, cy, spikes, outerRadius, innerRadius) => {
    let rot = Math.PI / 2 * 3
    let x = cx
    let y = cy
    const step = Math.PI / spikes

    ctx.beginPath()
    ctx.moveTo(cx, cy - outerRadius)
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius
      y = cy + Math.sin(rot) * outerRadius
      ctx.lineTo(x, y)
      rot += step

      x = cx + Math.cos(rot) * innerRadius
      y = cy + Math.sin(rot) * innerRadius
      ctx.lineTo(x, y)
      rot += step
    }
    ctx.lineTo(cx, cy - outerRadius)
    ctx.closePath()
    ctx.fill()
  }

  const handleSave = async () => {
    setIsGenerating(true)
    try {
      // Convert canvas to blob
      const canvas = canvasRef.current
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))

      // Create file from blob
      const file = new File([blob], 'custom-avatar.png', { type: 'image/png' })

      // Call onSave with the file and configuration
      await onSave(file, selectedOptions)
      toast.success('Custom avatar saved! 🎨')
    } catch (error) {
      console.error('Failed to save avatar:', error)
      toast.error('Failed to save avatar')
    } finally {
      setIsGenerating(false)
    }
  }

  const getCurrentOption = (category) => {
    const key = category.replace('s', '')
    return selectedOptions[key] || selectedOptions[category]
  }

  return (
    <Modal isOpen={true} onClose={onClose} size="lg" className="max-w-4xl">
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Create Custom Avatar
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Design your unique profile picture
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview Section */}
          <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
            {/* Hidden canvas for rendering */}
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="hidden"
            />

            {/* Preview */}
            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden ring-4 ring-gray-200 dark:ring-gray-700 shadow-xl">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <FaceSmileIcon className="w-20 h-20 text-gray-400" />
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-6 w-full max-w-xs">
              <Button
                variant="secondary"
                fullWidth
                onClick={handleRandomize}
                icon={<ArrowPathIcon className="w-5 h-5" />}
              >
                Random
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={handleReset}
                icon={<ArrowPathIcon className="w-5 h-5 rotate-180" />}
              >
                Reset
              </Button>
            </div>

            <div className="flex gap-2 mt-2 w-full max-w-xs">
              <Button
                variant="secondary"
                fullWidth
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleSave}
                loading={isGenerating}
                icon={<CheckIcon className="w-5 h-5" />}
              >
                Save Avatar
              </Button>
            </div>
          </div>

          {/* Customization Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6">
            {/* Tabs */}
            <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
              {TABS.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{tab.name}</span>
                  </button>
                )
              })}
            </div>

            {/* Tab Content */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              <AnimatePresence mode="wait">
                {/* Base Tab */}
                {activeTab === 'base' && (
                  <motion.div
                    key="base"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {/* Character Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Character Type
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {AVATAR_OPTIONS.characters.map((char) => (
                          <button
                            key={char.id}
                            onClick={() => handleSelectOption('character', char.id)}
                            className={`p-3 rounded-lg text-2xl transition-all ${
                              selectedOptions.character === char.id
                                ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-primary-600'
                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {char.icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Skin Tone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Skin Tone
                      </label>
                      <div className="grid grid-cols-6 gap-2">
                        {AVATAR_OPTIONS.skinTones.map((tone) => (
                          <button
                            key={tone.id}
                            onClick={() => handleSelectOption('skinTone', tone.id)}
                            className={`aspect-square rounded-full transition-all ring-2 ${
                              selectedOptions.skinTone === tone.id
                                ? 'ring-primary-600 scale-110'
                                : 'ring-transparent hover:scale-105'
                            }`}
                            style={{ backgroundColor: tone.color }}
                            title={tone.name}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Expression */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expression
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {AVATAR_OPTIONS.expressions.map((expr) => (
                          <button
                            key={expr.id}
                            onClick={() => handleSelectOption('expression', expr.id)}
                            className={`p-3 rounded-lg text-2xl transition-all ${
                              selectedOptions.expression === expr.id
                                ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-primary-600'
                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {expr.emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Face Tab */}
                {activeTab === 'face' && (
                  <motion.div
                    key="face"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {/* Facial Hair */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Facial Hair
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {AVATAR_OPTIONS.facialHair.map((fh) => (
                          <button
                            key={fh.id}
                            onClick={() => handleSelectOption('facialHair', fh.id)}
                            className={`p-3 rounded-lg text-2xl transition-all ${
                              selectedOptions.facialHair === fh.id
                                ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-primary-600'
                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {fh.emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Glasses */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Glasses
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {AVATAR_OPTIONS.glasses.map((glasses) => (
                          <button
                            key={glasses.id}
                            onClick={() => handleSelectOption('glasses', glasses.id)}
                            className={`p-3 rounded-lg text-2xl transition-all ${
                              selectedOptions.glasses === glasses.id
                                ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-primary-600'
                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {glasses.emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Hair Tab */}
                {activeTab === 'hair' && (
                  <motion.div
                    key="hair"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {/* Hairstyle */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Hairstyle
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {AVATAR_OPTIONS.hairstyles.map((hair) => (
                          <button
                            key={hair.id}
                            onClick={() => handleSelectOption('hairstyle', hair.id)}
                            className={`p-3 rounded-lg text-2xl transition-all ${
                              selectedOptions.hairstyle === hair.id
                                ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-primary-600'
                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {hair.emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Hair Color */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Hair Color
                      </label>
                      <div className="grid grid-cols-6 gap-2">
                        {AVATAR_OPTIONS.hairColors.map((color) => (
                          <button
                            key={color.id}
                            onClick={() => handleSelectOption('hairColor', color.id)}
                            className={`aspect-square rounded-full transition-all ring-2 ${
                              selectedOptions.hairColor === color.id
                                ? 'ring-primary-600 scale-110'
                                : 'ring-transparent hover:scale-105'
                            }`}
                            style={{
                              backgroundColor: color.color === 'rainbow'
                                ? 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)'
                                : color.color
                            }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Clothing Tab */}
                {activeTab === 'clothing' && (
                  <motion.div
                    key="clothing"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {/* Outfit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Outfit
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {AVATAR_OPTIONS.outfits.map((outfit) => (
                          <button
                            key={outfit.id}
                            onClick={() => handleSelectOption('outfit', outfit.id)}
                            className={`p-3 rounded-lg text-2xl transition-all ${
                              selectedOptions.outfit === outfit.id
                                ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-primary-600'
                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {outfit.emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Accessories Tab */}
                {activeTab === 'accessories' && (
                  <motion.div
                    key="accessories"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {/* Headwear */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Headwear
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {AVATAR_OPTIONS.headwear.map((hw) => (
                          <button
                            key={hw.id}
                            onClick={() => handleSelectOption('headwear', hw.id)}
                            className={`p-3 rounded-lg text-2xl transition-all ${
                              selectedOptions.headwear === hw.id
                                ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-primary-600'
                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {hw.emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Accessories */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Accessories
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {AVATAR_OPTIONS.accessories.map((acc) => (
                          <button
                            key={acc.id}
                            onClick={() => handleSelectOption('accessories', acc.id)}
                            className={`p-3 rounded-lg text-2xl transition-all ${
                              selectedOptions.accessories === acc.id
                                ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-primary-600'
                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {acc.emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Background Tab */}
                {activeTab === 'background' && (
                  <motion.div
                    key="background"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {/* Background Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Background Type
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {AVATAR_OPTIONS.backgrounds.map((bg) => (
                          <button
                            key={bg.id}
                            onClick={() => handleSelectOption('background', bg.id)}
                            className={`p-3 rounded-lg font-medium transition-all ${
                              selectedOptions.background === bg.id
                                ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-primary-600'
                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {bg.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Background Color */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Background Color
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {AVATAR_OPTIONS.backgroundColors.map((color) => (
                          <button
                            key={color.id}
                            onClick={() => handleSelectOption('backgroundColor', color.id)}
                            className={`aspect-square rounded-lg transition-all ring-2 ${
                              selectedOptions.backgroundColor === color.id
                                ? 'ring-primary-600 scale-110'
                                : 'ring-transparent hover:scale-105'
                            }`}
                            style={{ backgroundColor: color.color }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Effects Tab */}
                {activeTab === 'effects' && (
                  <motion.div
                    key="effects"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {/* Effects */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Special Effects
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {AVATAR_OPTIONS.effects.map((effect) => (
                          <button
                            key={effect.id}
                            onClick={() => handleSelectOption('effect', effect.id)}
                            className={`p-3 rounded-lg text-2xl transition-all ${
                              selectedOptions.effect === effect.id
                                ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-primary-600'
                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {effect.icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

// Helper function to lighten color
function lightenColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = ((num >> 8) & 0x00ff) + amt
  const B = (num & 0x0000ff) + amt
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1)
}

export default AvatarCreator
