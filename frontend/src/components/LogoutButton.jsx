import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Loader } from 'lucide-react'

export default function LogoutButton({ variant = 'default' }) {
  const [loading, setLoading] = useState(false)
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      setLoading(true)
      try {
        await signOut()
        navigate('/login')
      } catch (error) {
        console.error('Logout error:', error)
        alert('Failed to log out. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  // Button variant (for navbar)
  if (variant === 'icon') {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        title="Logout"
      >
        {loading ? (
          <Loader className="h-5 w-5 text-gray-700 dark:text-gray-300 animate-spin" />
        ) : (
          <LogOut className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        )}
      </button>
    )
  }

  // Full button variant (for settings page)
  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader className="h-5 w-5 animate-spin" />
          Logging out...
        </>
      ) : (
        <>
          <LogOut className="h-5 w-5" />
          Logout
        </>
      )}
    </button>
  )
}