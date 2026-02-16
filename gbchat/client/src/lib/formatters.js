import { format, formatDistanceToNow, isToday, isYesterday, differenceInDays } from 'date-fns'

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format message timestamp
 */
export const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp)
  
  if (isToday(date)) {
    return format(date, 'HH:mm')
  } else if (isYesterday(date)) {
    return 'Yesterday'
  } else if (differenceInDays(new Date(), date) < 7) {
    return format(date, 'EEEE')
  } else {
    return format(date, 'dd/MM/yyyy')
  }
}

/**
 * Format last seen
 */
export const formatLastSeen = (timestamp) => {
  if (!timestamp) return 'Last seen recently'
  
  const date = new Date(timestamp)
  const now = new Date()
  const diffInMinutes = Math.floor((now - date) / 1000 / 60)
  
  if (diffInMinutes < 1) return 'Online'
  if (diffInMinutes < 60) return `Last seen ${diffInMinutes}m ago`
  
  return `Last seen ${formatDistanceToNow(date, { addSuffix: true })}`
}

/**
 * Format duration (in seconds)
 */
export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone) => {
  const cleaned = ('' + phone).replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3]
  }
  
  return phone
}

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Format number with K, M, B suffix
 */
export const formatNumber = (num) => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B'
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return num.toString()
}

/**
 * Parse mentions from text
 */
export const parseMentions = (text) => {
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g
  const mentions = []
  let match
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push({
      name: match[1],
      userId: match[2],
      index: match.index,
    })
  }
  
  return mentions
}

/**
 * Format mentions for display
 */
export const formatMentions = (text, mentions) => {
  let formattedText = text
  
  mentions.forEach((mention) => {
    formattedText = formattedText.replace(
      `@[${mention.name}](${mention.userId})`,
      `<span class="mention" data-user-id="${mention.userId}">@${mention.name}</span>`
    )
  })
  
  return formattedText
}

/**
 * Parse URLs from text
 */
export const parseURLs = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.match(urlRegex) || []
}

/**
 * Format URL preview
 */
export const formatURL = (url) => {
  try {
    const urlObj = new URL(url)
    return {
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      pathname: urlObj.pathname,
      search: urlObj.search,
    }
  } catch (error) {
    return null
  }
}