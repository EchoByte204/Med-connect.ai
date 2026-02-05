/**
 * Schedule Agent - Generates reminder schedules automatically
 */

import { generateId, parseFrequency, generateReminderTimes, calculateNextReminder } from '../utils/helpers'
import { reminderStorage } from '../utils/storage'

/**
 * Create reminders for a medication
 * @param {Object} medication - Medication object
 * @returns {Array} - Array of created reminders
 */
export const createRemindersForMedication = (medication) => {
  const reminders = []
  const times = generateReminderTimes(medication.frequency)
  
  times.forEach((time) => {
    const reminder = {
      id: generateId('reminder'),
      medicineId: medication.id,
      medicineName: medication.name,
      dosage: medication.dosage,
      time: time,
      frequency: medication.frequency,
      days: [0, 1, 2, 3, 4, 5, 6], // Every day
      isActive: true,
      lastTaken: null,
      nextReminder: calculateNextReminder(time),
      notificationEnabled: true,
      notes: medication.instructions || ''
    }
    
    reminderStorage.add(reminder)
    reminders.push(reminder)
  })
  
  return reminders
}

/**
 * Get today's reminders
 */
export const getTodaysReminders = () => {
  const allReminders = reminderStorage.getActive()
  const now = new Date()
  const today = now.toDateString()
  
  return allReminders.filter(reminder => {
    const reminderDate = new Date(reminder.nextReminder)
    return reminderDate.toDateString() === today
  }).sort((a, b) => {
    return new Date(a.nextReminder) - new Date(b.nextReminder)
  })
}

/**
 * Get upcoming reminders (next 24 hours)
 */
export const getUpcomingReminders = () => {
  const allReminders = reminderStorage.getActive()
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  
  return allReminders.filter(reminder => {
    const reminderDate = new Date(reminder.nextReminder)
    return reminderDate >= now && reminderDate <= tomorrow
  }).sort((a, b) => {
    return new Date(a.nextReminder) - new Date(b.nextReminder)
  })
}

/**
 * Mark reminder as taken
 */
export const markReminderAsTaken = (reminderId) => {
  const reminder = reminderStorage.getById(reminderId)
  if (!reminder) return false
  
  const now = new Date()
  const nextReminder = calculateNextReminder(reminder.time)
  
  reminderStorage.update(reminderId, {
    lastTaken: now.toISOString(),
    nextReminder: nextReminder
  })
  
  return true
}

/**
 * Snooze reminder for X minutes
 */
export const snoozeReminder = (reminderId, minutes = 10) => {
  const reminder = reminderStorage.getById(reminderId)
  if (!reminder) return false
  
  const now = new Date()
  const snoozeUntil = new Date(now.getTime() + minutes * 60 * 1000)
  
  reminderStorage.update(reminderId, {
    nextReminder: snoozeUntil.toISOString()
  })
  
  return true
}

export default {
  createRemindersForMedication,
  getTodaysReminders,
  getUpcomingReminders,
  markReminderAsTaken,
  snoozeReminder
}