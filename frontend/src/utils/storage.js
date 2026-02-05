/**
 * LocalStorage Utility
 * Handles all data persistence operations
 */

const STORAGE_KEYS = {
  PRESCRIPTIONS: 'medconnect_prescriptions',
  MEDICATIONS: 'medconnect_medications',
  REMINDERS: 'medconnect_reminders',
  ALERTS: 'medconnect_alerts',
  PREFERENCES: 'medconnect_preferences',
  PHARMACY_PRICES: 'medconnect_pharmacy_prices',
  ADHERENCE_LOG: 'medconnect_adherence_log',
  CHAT_HISTORY: 'medconnect_chat_history',
  APPOINTMENTS: 'medconnect_appointments'
}

// Generic storage operations
export const storage = {
  // Get data from localStorage
  get(key) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error)
      return null
    }
  },

  // Set data in localStorage
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error)
      return false
    }
  },

  // Remove data from localStorage
  remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
      return false
    }
  },

  // Clear all app data
  clearAll() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  }
}

// Prescription operations
export const prescriptionStorage = {
  getAll() {
    return storage.get(STORAGE_KEYS.PRESCRIPTIONS) || []
  },

  getById(id) {
    const prescriptions = this.getAll()
    return prescriptions.find(p => p.id === id)
  },

  add(prescription) {
    const prescriptions = this.getAll()
    prescriptions.push(prescription)
    return storage.set(STORAGE_KEYS.PRESCRIPTIONS, prescriptions)
  },

  update(id, updates) {
    const prescriptions = this.getAll()
    const index = prescriptions.findIndex(p => p.id === id)
    if (index !== -1) {
      prescriptions[index] = { ...prescriptions[index], ...updates }
      return storage.set(STORAGE_KEYS.PRESCRIPTIONS, prescriptions)
    }
    return false
  },

  delete(id) {
    const prescriptions = this.getAll().filter(p => p.id !== id)
    return storage.set(STORAGE_KEYS.PRESCRIPTIONS, prescriptions)
  }
}

// Medication operations
export const medicationStorage = {
  getAll() {
    return storage.get(STORAGE_KEYS.MEDICATIONS) || []
  },

  getActive() {
    return this.getAll().filter(m => m.isActive)
  },

  getById(id) {
    const medications = this.getAll()
    return medications.find(m => m.id === id)
  },

  add(medication) {
    const medications = this.getAll()
    medications.push(medication)
    return storage.set(STORAGE_KEYS.MEDICATIONS, medications)
  },

  addMultiple(medicationsArray) {
    const medications = this.getAll()
    medications.push(...medicationsArray)
    return storage.set(STORAGE_KEYS.MEDICATIONS, medications)
  },

  update(id, updates) {
    const medications = this.getAll()
    const index = medications.findIndex(m => m.id === id)
    if (index !== -1) {
      medications[index] = { ...medications[index], ...updates }
      return storage.set(STORAGE_KEYS.MEDICATIONS, medications)
    }
    return false
  },

  delete(id) {
    const medications = this.getAll().filter(m => m.id !== id)
    return storage.set(STORAGE_KEYS.MEDICATIONS, medications)
  },

  markAsInactive(id) {
    return this.update(id, { isActive: false })
  }
}

// Reminder operations
export const reminderStorage = {
  getAll() {
    return storage.get(STORAGE_KEYS.REMINDERS) || []
  },

  getActive() {
    return this.getAll().filter(r => r.isActive)
  },

  getById(id) {
    const reminders = this.getAll()
    return reminders.find(r => r.id === id)
  },

  getByMedicineId(medicineId) {
    return this.getAll().filter(r => r.medicineId === medicineId)
  },

  add(reminder) {
    const reminders = this.getAll()
    reminders.push(reminder)
    return storage.set(STORAGE_KEYS.REMINDERS, reminders)
  },

  addMultiple(remindersArray) {
    const reminders = this.getAll()
    reminders.push(...remindersArray)
    return storage.set(STORAGE_KEYS.REMINDERS, reminders)
  },

  update(id, updates) {
    const reminders = this.getAll()
    const index = reminders.findIndex(r => r.id === id)
    if (index !== -1) {
      reminders[index] = { ...reminders[index], ...updates }
      return storage.set(STORAGE_KEYS.REMINDERS, reminders)
    }
    return false
  },

  delete(id) {
    const reminders = this.getAll().filter(r => r.id !== id)
    return storage.set(STORAGE_KEYS.REMINDERS, reminders)
  },

  markAsTaken(id) {
    return this.update(id, { 
      lastTaken: new Date().toISOString() 
    })
  }
}

// Alert operations
export const alertStorage = {
  getAll() {
    return storage.get(STORAGE_KEYS.ALERTS) || []
  },

  getUnread() {
    return this.getAll().filter(a => !a.isRead)
  },

  getById(id) {
    const alerts = this.getAll()
    return alerts.find(a => a.id === id)
  },

  add(alert) {
    const alerts = this.getAll()
    alerts.unshift(alert) // Add to beginning
    return storage.set(STORAGE_KEYS.ALERTS, alerts)
  },

  update(id, updates) {
    const alerts = this.getAll()
    const index = alerts.findIndex(a => a.id === id)
    if (index !== -1) {
      alerts[index] = { ...alerts[index], ...updates }
      return storage.set(STORAGE_KEYS.ALERTS, alerts)
    }
    return false
  },

  markAsRead(id) {
    return this.update(id, { isRead: true })
  },

  markAllAsRead() {
    const alerts = this.getAll().map(a => ({ ...a, isRead: true }))
    return storage.set(STORAGE_KEYS.ALERTS, alerts)
  },

  delete(id) {
    const alerts = this.getAll().filter(a => a.id !== id)
    return storage.set(STORAGE_KEYS.ALERTS, alerts)
  },

  clearOld(daysOld = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    const alerts = this.getAll().filter(a => 
      new Date(a.timestamp) > cutoffDate
    )
    return storage.set(STORAGE_KEYS.ALERTS, alerts)
  }
}

// User preferences operations
export const preferencesStorage = {
  get() {
    return storage.get(STORAGE_KEYS.PREFERENCES) || {
      notificationsEnabled: true,
      reminderSound: true,
      darkMode: false,
      language: 'en',
      defaultPharmacy: null,
      emergencyContact: {
        name: '',
        phone: '',
        relation: ''
      }
    }
  },

  update(updates) {
    const preferences = this.get()
    const updated = { ...preferences, ...updates }
    return storage.set(STORAGE_KEYS.PREFERENCES, updated)
  }
}

// Pharmacy price operations
export const pharmacyPriceStorage = {
  getAll() {
    return storage.get(STORAGE_KEYS.PHARMACY_PRICES) || []
  },

  getByMedicine(medicineName) {
    return this.getAll().filter(p => 
      p.medicineName.toLowerCase() === medicineName.toLowerCase()
    )
  },

  add(priceData) {
    const prices = this.getAll()
    prices.push(priceData)
    return storage.set(STORAGE_KEYS.PHARMACY_PRICES, prices)
  },

  addMultiple(pricesArray) {
    const prices = this.getAll()
    prices.push(...pricesArray)
    return storage.set(STORAGE_KEYS.PHARMACY_PRICES, prices)
  },

  update(id, updates) {
    const prices = this.getAll()
    const index = prices.findIndex(p => p.id === id)
    if (index !== -1) {
      prices[index] = { ...prices[index], ...updates }
      return storage.set(STORAGE_KEYS.PHARMACY_PRICES, prices)
    }
    return false
  }
}

// ── Adherence log ─────────────────────────────────
// Each entry: { id, medicineId, medicineName, dosage, takenAt (ISO), reminderId }
export const adherenceStorage = {
  getAll() {
    return storage.get(STORAGE_KEYS.ADHERENCE_LOG) || []
  },

  // last N days
  getByDateRange(startDate, endDate) {
    const start = new Date(startDate)
    const end   = new Date(endDate)
    return this.getAll().filter(e => {
      const d = new Date(e.takenAt)
      return d >= start && d <= end
    })
  },

  // entries for a single calendar day (local time)
  getByDate(dateString) {
    const day = new Date(dateString)
    return this.getAll().filter(e => {
      const d = new Date(e.takenAt)
      return d.toDateString() === day.toDateString()
    })
  },

  add(entry) {
    const log = this.getAll()
    log.push(entry)
    return storage.set(STORAGE_KEYS.ADHERENCE_LOG, log)
  },

  clear() {
    return storage.set(STORAGE_KEYS.ADHERENCE_LOG, [])
  }
}

// ── Chat history (persist last 20 messages) ────────
export const chatHistoryStorage = {
  get() {
    return storage.get(STORAGE_KEYS.CHAT_HISTORY) || { messages: [], geminiHistory: [] }
  },

  save(messages, geminiHistory) {
    // keep last 20 UI messages and last 20 gemini turns
    const trimmedMessages     = messages.slice(-20)
    const trimmedGeminiHistory = geminiHistory.slice(-20)
    return storage.set(STORAGE_KEYS.CHAT_HISTORY, {
      messages: trimmedMessages,
      geminiHistory: trimmedGeminiHistory
    })
  },

  clear() {
    return storage.set(STORAGE_KEYS.CHAT_HISTORY, { messages: [], geminiHistory: [] })
  }
}

// ── Appointments ────────────────────────────────────
export const appointmentStorage = {
  getAll() {
    return storage.get(STORAGE_KEYS.APPOINTMENTS) || []
  },

  getUpcoming() {
    const now = new Date()
    return this.getAll()
      .filter(a => new Date(a.dateTime) >= now)
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
  },

  getPast() {
    const now = new Date()
    return this.getAll()
      .filter(a => new Date(a.dateTime) < now)
      .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
  },

  add(appointment) {
    const list = this.getAll()
    list.push(appointment)
    return storage.set(STORAGE_KEYS.APPOINTMENTS, list)
  },

  delete(id) {
    const list = this.getAll().filter(a => a.id !== id)
    return storage.set(STORAGE_KEYS.APPOINTMENTS, list)
  }
}

export { STORAGE_KEYS }