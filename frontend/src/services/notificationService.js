/**
 * Notification Service - Handles browser notifications
 */

import { requestNotificationPermission, showNotification } from '../utils/helpers'
import { getTodaysReminders } from '../agents/scheduleAgent'

/**
 * Initialize notification service
 */
export const initNotificationService = async () => {
  const permission = await requestNotificationPermission()
  if (permission) {
    console.log('Notification permission granted')
    startNotificationChecker()
  } else {
    console.log('Notification permission denied')
  }
  return permission
}

/**
 * Check for due reminders every minute
 */
let notificationInterval = null

export const startNotificationChecker = () => {
  // Clear any existing interval
  if (notificationInterval) {
    clearInterval(notificationInterval)
  }
  
  // Check every minute
  notificationInterval = setInterval(() => {
    checkAndNotify()
  }, 60000) // 60 seconds
  
  // Also check immediately
  checkAndNotify()
}

export const stopNotificationChecker = () => {
  if (notificationInterval) {
    clearInterval(notificationInterval)
    notificationInterval = null
  }
}

/**
 * Check for due reminders and send notifications
 */
const checkAndNotify = () => {
  const reminders = getTodaysReminders()
  const now = new Date()
  
  reminders.forEach(reminder => {
    if (!reminder.notificationEnabled) return
    
    const reminderTime = new Date(reminder.nextReminder)
    const diffMinutes = Math.floor((reminderTime - now) / 60000)
    
    // Notify if reminder is due (within 1 minute)
    if (diffMinutes <= 0 && diffMinutes > -5) {
      sendReminderNotification(reminder)
    }
  })
}

/**
 * Send a reminder notification
 */
export const sendReminderNotification = (reminder) => {
  const title = `💊 Time for ${reminder.medicineName}`
  const options = {
    body: `Take ${reminder.dosage}\n${reminder.notes}`,
    icon: '/medical-icon.svg',
    badge: '/medical-icon.svg',
    tag: reminder.id, // Prevent duplicate notifications
    requireInteraction: true, // Keep notification visible
    actions: [
      { action: 'taken', title: 'Mark as Taken' },
      { action: 'snooze', title: 'Snooze 10 min' }
    ]
  }
  
  const notification = showNotification(title, options)
  
  // Handle notification click
  if (notification) {
    notification.onclick = () => {
      window.focus()
      // Navigate to reminders page
      window.location.hash = '#/reminders'
    }
  }
  
  return notification
}

/**
 * Test notification (for testing purposes)
 */
export const sendTestNotification = () => {
  const title = '🔔 Test Notification'
  const options = {
    body: 'Your medication reminders are working!',
    icon: '/medical-icon.svg'
  }
  
  return showNotification(title, options)
}

export default {
  initNotificationService,
  startNotificationChecker,
  stopNotificationChecker,
  sendReminderNotification,
  sendTestNotification
} 