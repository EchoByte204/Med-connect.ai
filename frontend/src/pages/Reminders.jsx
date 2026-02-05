import { useState, useEffect } from 'react'
import { Bell, Plus, Check, X, Clock, Pill, Calendar, Trash2 } from 'lucide-react'
import { reminderStorage, medicationStorage, alertStorage, adherenceStorage } from '../utils/storage'
import { formatTime, formatDate, generateId, requestNotificationPermission, showNotification } from '../utils/helpers'
import { useDarkMode } from '../App'

const Reminders = () => {
  const { darkMode } = useDarkMode()
  const [reminders, setReminders] = useState([])
  const [medications, setMedications] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [filter, setFilter] = useState('today')
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    loadData()
    checkNotificationPermission()
    const interval = setInterval(checkDueReminders, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadData = () => {
    setReminders(reminderStorage.getActive())
    setMedications(medicationStorage.getActive())
  }

  const checkNotificationPermission = async () => {
    const permission = await requestNotificationPermission()
    setNotificationsEnabled(permission)
  }

  const checkDueReminders = () => {
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const dueReminders = reminders.filter(r => r.isActive && r.notificationEnabled && r.time === currentTime)
    dueReminders.forEach(reminder => {
      showNotification('💊 Medication Reminder', { body: `Time to take ${reminder.medicineName} - ${reminder.dosage}`, icon: '/medical-icon.svg' })
      alertStorage.add({ id: generateId('alert'), type: 'reminder', severity: 'info', title: 'Medication Reminder', message: `Time to take ${reminder.medicineName} - ${reminder.dosage}`, timestamp: new Date().toISOString(), isRead: false, actionRequired: true, relatedId: reminder.id })
    })
  }

  const handleMarkAsTaken = (id) => {
    reminderStorage.markAsTaken(id)
    const reminder = reminders.find(r => r.id === id)
    adherenceStorage.add({ id: generateId('adh'), medicineId: reminder.medicineId, medicineName: reminder.medicineName, dosage: reminder.dosage, takenAt: new Date().toISOString(), reminderId: id })
    alertStorage.add({ id: generateId('alert'), type: 'reminder', severity: 'info', title: 'Medication Taken', message: `You took ${reminder.medicineName} at ${formatTime(new Date().toTimeString().slice(0, 5))}`, timestamp: new Date().toISOString(), isRead: false, actionRequired: false, relatedId: id })
    loadData()
  }

  const handleSnooze = (id) => {
    const reminder = reminders.find(r => r.id === id)
    const snoozeTime = new Date(); snoozeTime.setMinutes(snoozeTime.getMinutes() + 10)
    reminderStorage.update(id, { nextReminder: snoozeTime.toISOString() })
    alertStorage.add({ id: generateId('alert'), type: 'reminder', severity: 'info', title: 'Reminder Snoozed', message: `${reminder.medicineName} reminder snoozed for 10 minutes`, timestamp: new Date().toISOString(), isRead: false, actionRequired: false, relatedId: id })
    loadData()
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) { reminderStorage.delete(id); loadData() }
  }

  const handleToggleActive = (id) => {
    const reminder = reminders.find(r => r.id === id)
    reminderStorage.update(id, { isActive: !reminder.isActive }); loadData()
  }

  const getTodayReminders = () => reminders.filter(r => r.isActive)
  const getUpcomingReminders = () => {
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    return reminders.filter(r => r.isActive && r.time > currentTime)
  }

  const filteredReminders =
    filter === 'today' ? getTodayReminders() :
    filter === 'upcoming' ? getUpcomingReminders() :
    reminders

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Reminders & Alerts</h1>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Manage medication reminders and health alerts</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" /> Add Reminder
        </button>
      </div>

      {/* Notification Status */}
      {!notificationsEnabled && (
        <div className={`card border-2 border-yellow-200 ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-6 w-6 text-yellow-600 mr-3" />
              <div>
                <p className={`font-semibold ${darkMode ? 'text-yellow-300' : 'text-yellow-900'}`}>Browser Notifications Disabled</p>
                <p className={`text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>Enable notifications to receive reminders</p>
              </div>
            </div>
            <button onClick={checkNotificationPermission} className="btn-primary">Enable Notifications</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Reminders', value: reminders.length, color: 'text-blue-600', Icon: Bell },
          { label: "Today's Reminders", value: getTodayReminders().length, color: 'text-green-600', Icon: Calendar },
          { label: 'Upcoming', value: getUpcomingReminders().length, color: 'text-yellow-600', Icon: Clock }
        ].map(({ label, value, color, Icon }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
              <Icon className={`h-8 w-8 ${color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Filter:</span>
          {[
            { key: 'today', label: 'Today', count: getTodayReminders().length },
            { key: 'upcoming', label: 'Upcoming', count: getUpcomingReminders().length },
            { key: 'all', label: 'All', count: reminders.length }
          ].map(({ key, label, count }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === key ? 'bg-primary-600 text-white' : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Reminders List */}
      <div className="card">
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Your Reminders ({filteredReminders.length})
        </h2>

        {filteredReminders.length === 0 ? (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Bell className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className="text-lg mb-2">No reminders found</p>
            <p className="text-sm">{filter === 'all' ? 'Add your first reminder to get started' : `No ${filter} reminders`}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReminders.map((reminder) => (
              <div key={reminder.id} className={`p-4 rounded-lg border-2 transition-all ${
                reminder.isActive
                  ? darkMode ? 'bg-gray-700 border-blue-800' : 'bg-white border-blue-200'
                  : darkMode ? 'bg-gray-700/50 border-gray-600 opacity-60' : 'bg-gray-50 border-gray-200 opacity-60'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <Pill className={`h-10 w-10 mr-3 flex-shrink-0 ${reminder.isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className={`font-bold text-lg ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{reminder.medicineName}</h3>
                        <span className="badge badge-info">{formatTime(reminder.time)}</span>
                        {!reminder.notificationEnabled && <span className="badge badge-warning">Notifications Off</span>}
                      </div>

                      <div className={`grid grid-cols-2 gap-3 text-sm mb-2`}>
                        <div><span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Dosage:</span><span className={`ml-2 font-medium ${darkMode ? 'text-gray-200' : ''}`}>{reminder.dosage}</span></div>
                        <div><span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Frequency:</span><span className={`ml-2 font-medium ${darkMode ? 'text-gray-200' : ''}`}>{reminder.frequency}</span></div>
                      </div>

                      {reminder.notes && <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>📝 {reminder.notes}</p>}
                      {reminder.lastTaken && <p className="text-sm text-green-600 mt-2">✅ Last taken: {formatDate(reminder.lastTaken)}</p>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button onClick={() => handleMarkAsTaken(reminder.id)}
                      className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium transition-colors flex items-center">
                      <Check className="h-4 w-4 mr-1" /> Taken
                    </button>
                    <button onClick={() => handleSnooze(reminder.id)}
                      className="px-3 py-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg text-sm font-medium transition-colors flex items-center">
                      <Clock className="h-4 w-4 mr-1" /> Snooze
                    </button>
                    <button onClick={() => handleToggleActive(reminder.id)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        reminder.isActive
                          ? darkMode ? 'bg-blue-900/40 text-blue-300 hover:bg-blue-900/60' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : darkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}>
                      {reminder.isActive ? 'Pause' : 'Resume'}
                    </button>
                    <button onClick={() => handleDelete(reminder.id)} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}>
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Reminder Modal */}
      {showAddForm && (
        <ReminderForm medications={medications} onClose={() => setShowAddForm(false)} onSave={() => { loadData(); setShowAddForm(false) }} />
      )}
    </div>
  )
}

const ReminderForm = ({ medications, onClose, onSave }) => {
  const { darkMode } = useDarkMode()
  const [selectedMed, setSelectedMed] = useState('')
  const [time, setTime] = useState('09:00')
  const [frequency, setFrequency] = useState('daily')
  const [notes, setNotes] = useState('')
  const [notificationEnabled, setNotificationEnabled] = useState(true)

  const handleSubmit = (e) => {
    e.preventDefault()
    const medication = medications.find(m => m.id === selectedMed)
    if (!medication) return
    const reminder = {
      id: generateId('reminder'), medicineId: medication.id, medicineName: medication.name,
      dosage: medication.dosage, time, frequency, days: [], isActive: true, lastTaken: '',
      nextReminder: calculateNextReminder(time), notificationEnabled, notes
    }
    reminderStorage.add(reminder); onSave()
  }

  const calculateNextReminder = (timeStr) => {
    const [hours, minutes] = timeStr.split(':')
    const next = new Date(); next.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    if (next <= new Date()) next.setDate(next.getDate() + 1)
    return next.toISOString()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`rounded-xl max-w-md w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-6">
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Add New Reminder</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Select Medication *</label>
              <select required value={selectedMed} onChange={(e) => setSelectedMed(e.target.value)} className="input-field">
                <option value="">Choose a medication</option>
                {medications.map(med => <option key={med.id} value={med.id}>{med.name} - {med.dosage}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Reminder Time *</label>
              <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Frequency *</label>
              <select required value={frequency} onChange={(e) => setFrequency(e.target.value)} className="input-field">
                <option value="daily">Daily</option><option value="twice-daily">Twice Daily</option>
                <option value="thrice-daily">Thrice Daily</option><option value="weekly">Weekly</option>
                <option value="as-needed">As Needed</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Notes (Optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field" rows="3" placeholder="e.g., Take with food, After breakfast" />
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="notifications" checked={notificationEnabled} onChange={(e) => setNotificationEnabled(e.target.checked)} className="mr-2" />
              <label htmlFor="notifications" className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Enable browser notifications</label>
            </div>
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Add Reminder</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Reminders