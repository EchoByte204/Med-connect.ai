import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'  // ← ADD useContext HERE!

// Context Providers
import { AuthProvider } from './contexts/AuthContext'

// Components
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Auth Pages
import Login from './pages/Login'
import Register from './pages/Register'

// Main Pages
import Dashboard from './pages/Dashboard'
import Prescriptions from './pages/Prescriptions'
import Medications from './pages/Medications'
import Reminders from './pages/Reminders'
import PharmacyFinder from './pages/PharmacyFinder'
import HospitalFinder from './pages/HospitalFinder'
import DoctorDirectory from './pages/DoctorDirectory'
import HealthChatbot from './pages/HealthChatbot'
import Settings from './pages/Settings'
import DrugInteractions from './pages/DrugInteractions'

// Dark Mode Context
export const DarkModeContext = createContext()
export const useDarkMode = () => {
  return useContext(DarkModeContext)
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  return (
    <AuthProvider>
      <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
        <Router>
          <div className={darkMode ? 'dark' : ''}>
            <Routes>
              {/* Public Routes (No Authentication Required) */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes (Authentication Required) */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/prescriptions"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Prescriptions />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/medications"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Medications />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/reminders"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Reminders />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/pharmacy-finder"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <PharmacyFinder />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/hospital-finder"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <HospitalFinder />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/doctors"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DoctorDirectory />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/chatbot"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <HealthChatbot />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/interactions"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DrugInteractions />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* 404 Not Found - Redirect to Dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </DarkModeContext.Provider>
    </AuthProvider>
  )
}

export default App