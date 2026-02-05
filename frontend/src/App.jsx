import { createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard'
import Prescriptions from './pages/Prescriptions'
import Medications from './pages/Medications'
import Reminders from './pages/Reminders'
import PharmacyFinder from './pages/PharmacyFinder'
import DoctorDirectory from './pages/DoctorDirectory'
import HospitalFinder from './pages/HospitalFinder'
import HealthChatbot from './pages/HealthChatbot'
import Settings from './pages/Settings'
import { preferencesStorage } from './utils/storage'

/* ── Dark-mode context (consumed by Settings toggle + Layout root) ── */
export const DarkModeContext = createContext()

export const useDarkMode = () => useContext(DarkModeContext)

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // hydrate from persisted prefs on first render
    return preferencesStorage.get().darkMode || false
  })

  // keep prefs in sync whenever darkMode flips
  useEffect(() => {
    preferencesStorage.update({ darkMode })
  }, [darkMode])

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
      <Router>
        <div className={darkMode ? 'dark' : ''}>
          <Layout>
            <Routes>
              <Route path="/"             element={<Dashboard />} />
              <Route path="/prescriptions" element={<Prescriptions />} />
              <Route path="/medications"   element={<Medications />} />
              <Route path="/reminders"     element={<Reminders />} />
              <Route path="/pharmacy"      element={<PharmacyFinder />} />
              <Route path="/doctors"       element={<DoctorDirectory />} />
              <Route path="/hospitals"     element={<HospitalFinder />} />
              <Route path="/chatbot"       element={<HealthChatbot />} />
              <Route path="/settings"      element={<Settings />} />
            </Routes>
          </Layout>
        </div>
      </Router>
    </DarkModeContext.Provider>
  )
}

export default App