const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const api = {
  auth: {
    register: `${API_URL}/api/auth/register`,
    login: `${API_URL}/api/auth/login`,
    logout: `${API_URL}/api/auth/logout`,
    me: `${API_URL}/api/auth/me`
  },
  prescriptions: `${API_URL}/api/prescriptions`,
  medications: `${API_URL}/api/medications`,
  reminders: `${API_URL}/api/reminders`,
  appointments: `${API_URL}/api/appointments`
}

export default api