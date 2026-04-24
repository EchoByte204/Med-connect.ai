import { supabase } from '../config/supabase'

export const STORAGE_KEYS = {
  PREFERENCES: 'medconnect_preferences',
  PHARMACY_PRICES: 'medconnect_pharmacy_prices',
  CHAT_HISTORY: 'medconnect_chat_history'
}

// Helper to get current user ID
const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

// Prescription operations
export const prescriptionStorage = {
  async getAll() {
    const { data } = await supabase.from('prescriptions').select('*')
    return (data || []).map(p => ({
      ...p,
      fileName: p.file_name,
      fileUrl: p.file_url,
      fileSize: p.file_size,
      fileType: p.file_type,
      rawText: p.raw_text,
      medicines: p.extracted_medicines,
      uploadDate: p.uploaded_at
    }))
  },

  async getById(id) {
    const { data } = await supabase.from('prescriptions').select('*').eq('id', id).single()
    return data
  },

  async add(prescription) {
    try {
      const userId = await getCurrentUserId()
      const { data, error } = await supabase.from('prescriptions').insert([{
        user_id: userId,
        file_name: prescription.fileName || 'Untitled',
        file_url: prescription.fileUrl || '',
        file_size: prescription.fileSize || 0,
        file_type: prescription.fileType || 'image/png',
        raw_text: prescription.rawText || '',
        extracted_medicines: prescription.medicines || [],
        status: prescription.status || 'processed',
        uploaded_at: prescription.date || new Date().toISOString()
      }]).select('*').single()
      if (error) throw error
      return data
    } catch (e) {
      console.error(e)
      return null
    }
  },

  async update(id, updates) {
    const formattedUpdates = {}
    if (updates.status !== undefined)    formattedUpdates.status = updates.status
    if (updates.medicines !== undefined) formattedUpdates.extracted_medicines = updates.medicines
    if (updates.rawText !== undefined)   formattedUpdates.raw_text = updates.rawText
    if (Object.keys(formattedUpdates).length === 0) return true
    const { error } = await supabase.from('prescriptions').update(formattedUpdates).eq('id', id)
    if (error) console.error('prescriptionStorage.update error:', error)
    return !error
  },

  async delete(id) {
    const { error } = await supabase.from('prescriptions').delete().eq('id', id)
    return !error
  }
}

// Medication operations
export const medicationStorage = {
  async getAll() {
    const { data } = await supabase.from('medications').select('*')
    // transform to frontend format
    return (data || []).map(m => ({
        ...m,
        id: m.id,
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        instructions: m.instructions,
        start_date: m.start_date,
        end_date: m.end_date,
        timesPerDay: m.times_per_day,
        timeSlots: m.time_slots,
        isActive: m.is_active
    }))
  },

  async getActive() {
    const meds = await this.getAll()
    return meds.filter(m => m.isActive)
  },

  async getById(id) {
    const meds = await this.getAll()
    return meds.find(m => m.id === id)
  },

  async add(med) {
    try {
      const userId = await getCurrentUserId()
      const { data, error } = await supabase.from('medications').insert([{
        user_id: userId,
        prescription_id: med.prescriptionId || null,
        name: med.name,
        generic_name: med.genericName || null,
        dosage: med.dosage,
        frequency: med.frequency,
        instructions: med.instructions || '',
        category: med.category || 'other',
        explanation: med.explanation || '',
        duration: med.duration || '',
        start_date: med.startDate || new Date().toISOString(),
        end_date: med.endDate || null,
        times_per_day: med.timesPerDay || 1,
        time_slots: med.timeSlots || [],
        is_active: med.isActive !== undefined ? med.isActive : true
      }]).select('*').single()
      if (error) throw error
      // Return with camelCase fields for frontend compatibility
      return { ...data, isActive: data.is_active, prescriptionId: data.prescription_id }
    } catch (e) {
      console.error('medicationStorage.add error:', e)
      return false
    }
  },

  async addMultiple(medicationsArray) {
    for (const med of medicationsArray) {
       await this.add(med)
    }
    return true
  },

  async update(id, updates) {
    const mapped = {}
    // isActive toggle (Pause/Resume button)
    if (updates.isActive !== undefined)     mapped.is_active    = updates.isActive
    // Full edit form fields
    if (updates.name !== undefined)         mapped.name         = updates.name
    if (updates.genericName !== undefined)  mapped.generic_name = updates.genericName
    if (updates.dosage !== undefined)       mapped.dosage       = updates.dosage
    if (updates.frequency !== undefined)    mapped.frequency    = updates.frequency
    if (updates.duration !== undefined)     mapped.duration     = updates.duration
    if (updates.instructions !== undefined) mapped.instructions = updates.instructions
    if (updates.category !== undefined)     mapped.category     = updates.category
    if (updates.explanation !== undefined)  mapped.explanation  = updates.explanation
    if (updates.endDate !== undefined)      mapped.end_date     = updates.endDate
    if (Object.keys(mapped).length === 0) return true
    const { error } = await supabase.from('medications').update(mapped).eq('id', id)
    if (error) console.error('medicationStorage.update error:', error)
    return !error
  },

  async delete(id) {
    const { error } = await supabase.from('medications').delete().eq('id', id)
    return !error
  },

  async markAsInactive(id) {
    return this.update(id, { isActive: false })
  }
}

// Reminder operations
export const reminderStorage = {
  async getAll() {
    const { data } = await supabase.from('reminders').select('*')
    return (data || []).map(r => ({
        ...r,
        medicineId: r.medication_id,
        medicineName: r.medicine_name,
        nextReminderAt: r.next_reminder_at,
        isActive: r.is_active
    }))
  },

  async getActive() {
    const list = await this.getAll()
    return list.filter(r => r.isActive)
  },

  async getById(id) {
    const { data } = await supabase.from('reminders').select('*').eq('id', id).single()
    return data
  },

  async getByMedicineId(medicineId) {
    const list = await this.getAll()
    return list.filter(r => r.medicineId === medicineId)
  },

  async add(reminder) {
     try {
       const userId = await getCurrentUserId()
       const { data, error } = await supabase.from('reminders').insert([{
         user_id: userId,
         medication_id: reminder.medicineId,
         medicine_name: reminder.medicineName,
         dosage: reminder.dosage || '',
         time: reminder.time || '08:00:00',
         frequency: reminder.frequency || 'daily',
         next_reminder_at: reminder.nextReminderAt || new Date().toISOString()
       }]).select('*').single()
       if(error) throw error; return data
     } catch(e){ console.error(e); return false }
  },

  async addMultiple(remindersArray) {
    for(let r of remindersArray) await this.add(r)
    return true
  },

  async update(id, updates) {
    const mapped = {}
    if (updates.lastTaken !== undefined)       mapped.last_taken_at     = updates.lastTaken
    if (updates.nextReminderAt !== undefined)  mapped.next_reminder_at  = updates.nextReminderAt
    if (updates.isActive !== undefined)        mapped.is_active         = updates.isActive
    if (updates.time !== undefined)            mapped.time              = updates.time
    if (updates.frequency !== undefined)       mapped.frequency         = updates.frequency
    if (Object.keys(mapped).length === 0) return true
    const { error } = await supabase.from('reminders').update(mapped).eq('id', id)
    if (error) console.error('reminderStorage.update error:', error)
    return !error
  },

  async delete(id) {
     const { error } = await supabase.from('reminders').delete().eq('id', id)
     return !error
  },

  async markAsTaken(id) {
    return this.update(id, { lastTaken: new Date().toISOString() })
  }
}

// Alert operations
export const alertStorage = {
  async getAll() {
    const { data } = await supabase.from('alerts').select('*').order('created_at', { ascending: false })
    return (data || []).map(a => ({
        ...a,
        isRead: a.is_read
    }))
  },

  async getUnread() {
    const list = await this.getAll()
    return list.filter(a => !a.isRead)
  },

  async getById(id) { return null },

  async add(alert) {
     try {
       const userId = await getCurrentUserId()
       await supabase.from('alerts').insert([{
         user_id: userId,
         type: alert.type || 'system',
         severity: alert.severity || 'info',
         title: alert.title || 'Alert',
         message: alert.message || '',
         is_read: false
       }])
       return true
     } catch (e){ return false }
  },

  async update(id, updates) {
    if(updates.isRead !== undefined) {
      await supabase.from('alerts').update({ is_read: updates.isRead }).eq('id', id)
    }
    return true
  },

  async markAsRead(id) {
    return this.update(id, { isRead: true })
  },

  async markAllAsRead() {
    const userId = await getCurrentUserId()
    await supabase.from('alerts').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
    return true
  },

  async delete(id) {
    await supabase.from('alerts').delete().eq('id', id)
    return true
  },

  async clearOld(daysOld = 30) {
    // skipped for demo 
    return true
  }
}

// We will keep local storage for settings and chat history to save DB bandwidth initially
const LOCAL_STORAGE_GENERIC = {
    get(key) { try { return JSON.parse(localStorage.getItem(key)) } catch(e){ return null } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true } catch(e){ return false } }
}

export const preferencesStorage = {
  get() {
    return LOCAL_STORAGE_GENERIC.get(STORAGE_KEYS.PREFERENCES) || {
      notificationsEnabled: true,
      darkMode: false,
      language: 'en'
    }
  },
  update(updates) {
    const pref = this.get()
    return LOCAL_STORAGE_GENERIC.set(STORAGE_KEYS.PREFERENCES, {...pref, ...updates})
  }
}

export const chatHistoryStorage = {
  get() { return LOCAL_STORAGE_GENERIC.get(STORAGE_KEYS.CHAT_HISTORY) || { messages: [], geminiHistory: [] } },
  save(messages, geminiHistory) {
      return LOCAL_STORAGE_GENERIC.set(STORAGE_KEYS.CHAT_HISTORY, { messages: messages.slice(-20), geminiHistory: geminiHistory.slice(-20)})
  },
  clear() {
      return LOCAL_STORAGE_GENERIC.set(STORAGE_KEYS.CHAT_HISTORY, { messages: [], geminiHistory: [] })
  }
}

export const adherenceStorage = {
  async getAll() {
     const { data } = await supabase.from('adherence_log').select('*')
     return (data || []).map(a => ({...a, takenAt: a.taken_at, medicineId: a.medication_id}))
  },
  async getByDateRange(startDate, endDate) { return await this.getAll() },
  async getByDate(dateString) { 
      const day = new Date(dateString)
      const list = await this.getAll()
      return list.filter(e => new Date(e.takenAt).toDateString() === day.toDateString())
  },
  async add(entry) {
      try {
        const userId = await getCurrentUserId()
        await supabase.from('adherence_log').insert([{
           user_id: userId,
           medication_id: entry.medicineId,
           medicine_name: entry.medicineName,
           dosage: entry.dosage,
           taken_at: new Date().toISOString()
        }])
        return true
      }catch(e){ return false }
  },
  async clear() { return false }
}

export const appointmentStorage = {
  async getAll() { return [] },
  async getUpcoming() { return [] },
  async getPast() { return [] },
  async add(apt) { return false },
  async delete(id) { return false }
}

export const pharmacyPriceStorage = {
  getAll() { return [] },
  getByMedicine(m) { return [] },
  add(p) { return true }
}