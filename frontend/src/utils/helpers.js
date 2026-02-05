/**
 * Helper Utilities
 * Common utility functions used across the app
 */

// Generate unique ID
export const generateId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Format date
export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Format time
export const formatTime = (timeString) => {
  if (!timeString) return ''
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

// Format date and time
export const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Calculate days between dates
export const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000
  const firstDate = new Date(date1)
  const secondDate = new Date(date2)
  return Math.round(Math.abs((firstDate - secondDate) / oneDay))
}

// Calculate end date from start date and duration
export const calculateEndDate = (startDate, duration) => {
  const start = new Date(startDate)
  const days = parseDuration(duration)
  start.setDate(start.getDate() + days)
  return start.toISOString()
}

// Parse duration string to days
export const parseDuration = (duration) => {
  if (!duration) return 0
  const durationLower = duration.toLowerCase()
  
  if (durationLower.includes('day')) {
    return parseInt(durationLower)
  } else if (durationLower.includes('week')) {
    return parseInt(durationLower) * 7
  } else if (durationLower.includes('month')) {
    return parseInt(durationLower) * 30
  }
  return 0
}

// Check if date is in the past
export const isPastDate = (dateString) => {
  return new Date(dateString) < new Date()
}

// Check if date is today
export const isToday = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)
  
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
  return formatDate(dateString)
}

// File size formatter
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Convert image to base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

// Validate email
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Validate phone number (Indian format)
export const isValidPhone = (phone) => {
  const re = /^[6-9]\d{9}$/
  return re.test(phone.replace(/\D/g, ''))
}

// Parse frequency to times per day
export const parseFrequency = (frequency) => {
  const freqLower = frequency.toLowerCase()
  
  if (freqLower.includes('once') || freqLower.includes('1-0-0')) {
    return 1
  } else if (freqLower.includes('twice') || freqLower.includes('1-0-1')) {
    return 2
  } else if (freqLower.includes('thrice') || freqLower.includes('three') || freqLower.includes('1-1-1')) {
    return 3
  } else if (freqLower.includes('four') || freqLower.includes('0-1-0-1')) {
    return 4
  }
  return 1 // Default
}

// Generate reminder times based on frequency
export const generateReminderTimes = (frequency) => {
  const times = []
  const timesPerDay = parseFrequency(frequency)
  
  switch (timesPerDay) {
    case 1:
      times.push('09:00')
      break
    case 2:
      times.push('09:00', '21:00')
      break
    case 3:
      times.push('08:00', '14:00', '21:00')
      break
    case 4:
      times.push('08:00', '12:00', '17:00', '22:00')
      break
    default:
      times.push('09:00')
  }
  
  return times
}

// Calculate next reminder time
export const calculateNextReminder = (time) => {
  const [hours, minutes] = time.split(':')
  const now = new Date()
  const next = new Date()
  next.setHours(parseInt(hours), parseInt(minutes), 0, 0)
  
  // If time has passed today, set for tomorrow
  if (next <= now) {
    next.setDate(next.getDate() + 1)
  }
  
  return next.toISOString()
}

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Truncate text
export const truncate = (str, length = 50) => {
  if (!str) return ''
  if (str.length <= length) return str
  return str.substring(0, length) + '...'
}

// Get severity color
export const getSeverityColor = (severity) => {
  const colors = {
    info: 'text-blue-600 bg-blue-100',
    warning: 'text-yellow-600 bg-yellow-100',
    danger: 'text-red-600 bg-red-100',
    success: 'text-green-600 bg-green-100',
    mild: 'text-yellow-600 bg-yellow-100',
    moderate: 'text-orange-600 bg-orange-100',
    severe: 'text-red-600 bg-red-100'
  }
  return colors[severity] || colors.info
}

// Sort array by date
export const sortByDate = (array, dateField = 'timestamp', ascending = false) => {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[dateField])
    const dateB = new Date(b[dateField])
    return ascending ? dateA - dateB : dateB - dateA
  })
}

// Group array by property
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key]
    if (!result[group]) {
      result[group] = []
    }
    result[group].push(item)
    return result
  }, {})
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return false
  }
  
  if (Notification.permission === 'granted') {
    return true
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  
  return false
}

// Show browser notification
export const showNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/medical-icon.svg',
      badge: '/medical-icon.svg',
      ...options
    })
    
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
    
    return notification
  }
  return null
}

// Download file
export const downloadFile = (content, filename, type = 'text/plain') => {
  const blob = new Blob([content], { type })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(url)
}

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

export default {
  generateId,
  formatDate,
  formatTime,
  formatDateTime,
  daysBetween,
  calculateEndDate,
  parseDuration,
  isPastDate,
  isToday,
  getRelativeTime,
  formatFileSize,
  fileToBase64,
  isValidEmail,
  isValidPhone,
  parseFrequency,
  generateReminderTimes,
  calculateNextReminder,
  capitalize,
  truncate,
  getSeverityColor,
  sortByDate,
  groupBy,
  debounce,
  requestNotificationPermission,
  showNotification,
  downloadFile,
  copyToClipboard
}