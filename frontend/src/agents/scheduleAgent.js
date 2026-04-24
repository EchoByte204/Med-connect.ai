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
export const createRemindersForMedication = async (medication) => {
  const reminders = []
  const times = generateReminderTimes(medication.frequency)
  
  for (const time of times) {
    const reminder = {
      medicineId: medication.id,
      medicineName: medication.name,
      dosage: medication.dosage,
      time: time,
      frequency: medication.frequency,
      isActive: true,
      nextReminderAt: calculateNextReminder(time)
    }
    
    await reminderStorage.add(reminder)
    reminders.push(reminder)
  }
  
  return reminders
}

export const getTodaysReminders = async () => {
  const allReminders = await reminderStorage.getActive()
  const now = new Date()
  const today = now.toDateString()
  
  return allReminders.filter(reminder => {
    const reminderDate = new Date(reminder.nextReminderAt)
    return reminderDate.toDateString() === today
  }).sort((a, b) => {
    return new Date(a.nextReminderAt) - new Date(b.nextReminderAt)
  })
}

export const getUpcomingReminders = async () => {
  const allReminders = await reminderStorage.getActive()
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  
  return allReminders.filter(reminder => {
    const reminderDate = new Date(reminder.nextReminderAt)
    return reminderDate >= now && reminderDate <= tomorrow
  }).sort((a, b) => {
    return new Date(a.nextReminderAt) - new Date(b.nextReminderAt)
  })
}

export const markReminderAsTaken = async (reminderId) => {
  const reminder = await reminderStorage.getById(reminderId)
  if (!reminder) return false
  
  const now = new Date()
  const nextReminder = calculateNextReminder(reminder.time)
  
  await reminderStorage.update(reminderId, {
    lastTaken: now.toISOString(),
    nextReminderAt: nextReminder
  })
  
  return true
}

export const snoozeReminder = async (reminderId, minutes = 10) => {
  const reminder = await reminderStorage.getById(reminderId)
  if (!reminder) return false
  
  const now = new Date()
  const snoozeUntil = new Date(now.getTime() + minutes * 60 * 1000)
  
  await reminderStorage.update(reminderId, {
    nextReminderAt: snoozeUntil.toISOString()
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