import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Bell, Moon, Sun, Download, Trash2, User, Phone, Save, CheckCircle } from 'lucide-react'
import { preferencesStorage, storage } from '../utils/storage'
import { requestNotificationPermission, showNotification } from '../utils/helpers'
import { useDarkMode } from '../App'

const Settings = () => {
  const { darkMode, setDarkMode } = useDarkMode()
  const [preferences, setPreferences] = useState({})
  const [saved, setSaved] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState('default')

  useEffect(() => {
    loadPreferences()
    checkNotificationPermission()
  }, [])

  const loadPreferences = () => {
    const prefs = preferencesStorage.get()
    setPreferences(prefs)
  }

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }

  const handleSave = () => {
    preferencesStorage.update(preferences)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleNotificationToggle = async () => {
    if (!preferences.notificationsEnabled) {
      const granted = await requestNotificationPermission()
      if (granted) {
        setPreferences({ ...preferences, notificationsEnabled: true })
        setNotificationPermission('granted')
        showNotification('Notifications Enabled', {
          body: 'You will now receive medication reminders'
        })
      }
    } else {
      setPreferences({ ...preferences, notificationsEnabled: false })
    }
  }

  const handleExportData = () => {
    const data = {
      prescriptions: storage.get('medconnect_prescriptions') || [],
      medications: storage.get('medconnect_medications') || [],
      reminders: storage.get('medconnect_reminders') || [],
      alerts: storage.get('medconnect_alerts') || [],
      preferences: preferences,
      exportDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `medconnect-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to delete ALL your data? This cannot be undone!')) {
      if (window.confirm('This will delete all prescriptions, medications, and reminders. Are you absolutely sure?')) {
        storage.clearAll()
        alert('All data has been cleared!')
        window.location.reload()
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Settings
        </h1>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          Manage your preferences and account settings
        </p>
      </div>

      {/* Save Button (Floating) */}
      {saved && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in-up">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Settings Saved!
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Bell className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Notifications
          </h2>
        </div>

        <div className="space-y-4">
          {/* Enable Notifications */}
          <div className={`flex items-center justify-between p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div>
              <p className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Enable Notifications</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Receive medication reminders and alerts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notificationsEnabled}
                onChange={handleNotificationToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Reminder Sound */}
          <div className={`flex items-center justify-between p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div>
              <p className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Reminder Sound</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Play sound with notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.reminderSound}
                onChange={(e) => setPreferences({ ...preferences, reminderSound: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {notificationPermission !== 'granted' && (
            <div className={`p-3 border rounded-lg ${darkMode ? 'bg-yellow-900/30 border-yellow-600' : 'bg-yellow-50 border-yellow-200'}`}>
              <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                ⚠️ Browser notifications are blocked. Please enable them in your browser settings.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Appearance */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Moon className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Appearance
          </h2>
        </div>

        <div className="space-y-4">
          {/* Dark Mode */}
          <div className={`flex items-center justify-between p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center">
              {darkMode ? <Sun className="h-5 w-5 text-yellow-500 mr-3" /> : <Moon className="h-5 w-5 text-gray-500 mr-3" />}
              <div>
                <p className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Dark Mode</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{darkMode ? 'Switch to Light theme' : 'Switch to Dark theme'}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Language */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <label className="block mb-2">
              <p className={`font-medium mb-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Language</p>
              <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Choose your preferred language</p>
            </label>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
              className="input-field"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="ta">தமிழ் (Tamil)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Phone className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Emergency Contact
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Contact Name
            </label>
            <input
              type="text"
              value={preferences.emergencyContact?.name || ''}
              onChange={(e) => setPreferences({
                ...preferences,
                emergencyContact: { ...preferences.emergencyContact, name: e.target.value }
              })}
              className="input-field"
              placeholder="e.g., Dr. Sharma"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Phone Number
            </label>
            <input
              type="tel"
              value={preferences.emergencyContact?.phone || ''}
              onChange={(e) => setPreferences({
                ...preferences,
                emergencyContact: { ...preferences.emergencyContact, phone: e.target.value }
              })}
              className="input-field"
              placeholder="e.g., +91-98765-43210"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Relationship
            </label>
            <input
              type="text"
              value={preferences.emergencyContact?.relation || ''}
              onChange={(e) => setPreferences({
                ...preferences,
                emergencyContact: { ...preferences.emergencyContact, relation: e.target.value }
              })}
              className="input-field"
              placeholder="e.g., Family Doctor"
            />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Download className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Data Management
          </h2>
        </div>

        <div className="space-y-3">
          {/* Export Data */}
          <button
            onClick={handleExportData}
            className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${darkMode ? 'bg-blue-900/30 border-blue-600 hover:bg-blue-900/50' : 'bg-blue-50 hover:bg-blue-100 border-blue-200'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Download className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <p className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Export Data</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Download all your data as JSON</p>
                </div>
              </div>
              <span className="text-blue-600 font-medium">Download</span>
            </div>
          </button>

          {/* Clear All Data */}
          <button
            onClick={handleClearData}
            className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${darkMode ? 'bg-red-900/30 border-red-600 hover:bg-red-900/50' : 'bg-red-50 hover:bg-red-100 border-red-200'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Trash2 className="h-6 w-6 text-red-600 mr-3" />
                <div>
                  <p className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Clear All Data</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Delete all prescriptions, medications & reminders</p>
                </div>
              </div>
              <span className="text-red-600 font-medium">Delete</span>
            </div>
          </button>
        </div>
      </div>

      {/* About */}
      <div className={`card border-2 ${darkMode ? 'bg-gradient-to-r from-primary-900/40 to-blue-900/40 border-primary-700' : 'bg-gradient-to-r from-primary-50 to-blue-50 border-primary-100'}`}>
        <div className="flex items-start">
          <SettingsIcon className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0 mt-1" />
          <div>
            <h3 className={`font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              About MedConnect AI
            </h3>
            <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Version 1.0.0 - Major Project 2026
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              An intelligent medical assistant for prescription and medication management.
              Powered by Gemini AI and built with React.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="btn-primary flex items-center px-8"
        >
          <Save className="h-5 w-5 mr-2" />
          Save Settings
        </button>
      </div>
    </div>
  )
}

export default Settings