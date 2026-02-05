import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { alertStorage } from '../../utils/storage'
import { formatTime, getSeverityColor } from '../../utils/helpers'
import { useDarkMode } from '../../App'

const NotificationBell = () => {
  const { darkMode } = useDarkMode()
  const [alerts, setAlerts] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadAlerts()
    
    // Refresh alerts every minute
    const interval = setInterval(loadAlerts, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadAlerts = () => {
    const allAlerts = alertStorage.getAll()
    const unread = alertStorage.getUnread()
    setAlerts(allAlerts.slice(0, 5)) // Show last 5
    setUnreadCount(unread.length)
  }

  const handleMarkAsRead = (id) => {
    alertStorage.markAsRead(id)
    loadAlerts()
  }

  const handleMarkAllAsRead = () => {
    alertStorage.markAllAsRead()
    loadAlerts()
  }

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`relative p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
      >
        <Bell className={`h-6 w-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className={`absolute right-0 mt-2 w-96 rounded-lg shadow-xl z-20 border animate-slide-in-up ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            {/* Header */}
            <div className={`px-4 py-3 border-b flex justify-between items-center ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Alerts List */}
            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              {alerts.length === 0 ? (
                <div className={`px-4 py-8 text-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  <Bell className={`h-12 w-12 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => handleMarkAsRead(alert.id)}
                      className={`px-4 py-3 cursor-pointer transition-colors ${
                        !alert.isRead
                          ? darkMode ? 'bg-blue-900/30 hover:bg-blue-900/40' : 'bg-blue-50 hover:bg-blue-100'
                          : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              {alert.title}
                            </h4>
                            <span className={`badge text-xs ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {alert.message}
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {formatTime(new Date(alert.timestamp).toTimeString().slice(0, 5))}
                          </p>
                        </div>
                        {!alert.isRead && (
                          <div className="ml-2 mt-1 h-2 w-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {alerts.length > 0 && (
              <div className={`px-4 py-3 border-t text-center ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => {
                    setShowDropdown(false)
                    // Navigate to reminders page - implement later
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationBell