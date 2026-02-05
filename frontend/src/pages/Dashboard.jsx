import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  FileText, Pill, Bell, MapPin, Activity,
  AlertTriangle, Calendar, Clock, Stethoscope,
  Building2, MessageSquare, TrendingUp, AlertCircle
} from 'lucide-react'
import {
  prescriptionStorage,
  medicationStorage,
  reminderStorage,
  alertStorage,
  adherenceStorage
} from '../utils/storage'
import { formatDate, formatTime } from '../utils/helpers'
import { useDarkMode } from '../App'

/* ── rotating health tips ── */
const HEALTH_TIPS = [
  'Always complete your antibiotic course even if you feel better. Stopping early can lead to antibiotic resistance and recurring infections.',
  'Drink at least 8 glasses of water a day to keep your body hydrated and support healthy metabolism.',
  'Take vitamins and supplements with food to improve absorption and reduce stomach irritation.',
  'Keep a record of all your medications and share it with every doctor you visit.',
  'Regular exercise for 30 minutes a day can significantly reduce the risk of heart disease.',
  'Never skip prescribed doses — missed medication is one of the top causes of treatment failure.',
  'Store medicines in a cool, dry place away from direct sunlight to maintain their effectiveness.'
]

const Dashboard = () => {
  const location = useLocation()
  const { darkMode } = useDarkMode()
  const [stats, setStats] = useState({ totalPrescriptions: 0, activeMedications: 0, todayReminders: 0, activeAlerts: 0 })
  const [recentActivity, setRecentActivity]       = useState([])
  const [upcomingReminders, setUpcomingReminders] = useState([])
  const [expiringMeds, setExpiringMeds]           = useState([])
  const [weeklyAdherence, setWeeklyAdherence]     = useState([])
  const [tipIndex, setTipIndex]                   = useState(0)

  useEffect(() => { loadDashboardData() }, [location.pathname])

  useEffect(() => {
    const t = setInterval(() => setTipIndex(i => (i + 1) % HEALTH_TIPS.length), 8000)
    return () => clearInterval(t)
  }, [])

  const loadDashboardData = () => {
    const prescriptions = prescriptionStorage.getAll()
    const medications   = medicationStorage.getActive()
    const reminders     = reminderStorage.getActive()
    const alerts        = alertStorage.getUnread()

    setStats({ totalPrescriptions: prescriptions.length, activeMedications: medications.length, todayReminders: reminders.length, activeAlerts: alerts.length })
    setRecentActivity([...prescriptions].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)).slice(0, 3))
    setUpcomingReminders([...reminders].sort((a, b) => new Date(a.nextReminder) - new Date(b.nextReminder)).slice(0, 3))

    // meds expiring in <= 3 days
    const now3 = new Date()
    const in3  = new Date(); in3.setDate(in3.getDate() + 3)
    setExpiringMeds(medications.filter(m => { const end = new Date(m.endDate); return end >= now3 && end <= in3 }))

    // weekly adherence bars
    const today = new Date()
    const week  = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i)
      week.push({ label: d.toLocaleDateString('en-IN', { weekday: 'short' }), taken: adherenceStorage.getByDate(d.toISOString()).length })
    }
    setWeeklyAdherence(week)
  }

  const statCards = [
    { title: 'Prescriptions',      value: stats.totalPrescriptions, icon: FileText,      color: 'bg-blue-500',   link: '/prescriptions' },
    { title: 'Active Medications', value: stats.activeMedications,  icon: Pill,          color: 'bg-green-500',  link: '/medications' },
    { title: "Today's Reminders",  value: stats.todayReminders,     icon: Bell,          color: 'bg-yellow-500', link: '/reminders' },
    { title: 'Active Alerts',      value: stats.activeAlerts,       icon: AlertTriangle, color: 'bg-red-500',    link: '/reminders' }
  ]

  const maxTaken = Math.max(...weeklyAdherence.map(d => d.taken), 1)

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Welcome to MedConnect AI</h1>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Your intelligent medical assistant for prescription and medication management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} to={stat.link} className="card hover:scale-105 transition-transform cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.title}</p>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}><Icon className="h-6 w-6 text-white" /></div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Expiring soon warning */}
      {expiringMeds.length > 0 && (
        <div className={`card border-2 border-amber-300 ${darkMode ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className={`font-semibold mb-2 ${darkMode ? 'text-amber-300' : 'text-amber-900'}`}>⚠️ Medications Expiring Soon</h3>
              <div className="flex flex-wrap gap-3">
                {expiringMeds.map(m => (
                  <div key={m.id} className={`border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <Pill className="h-4 w-4 text-amber-600" />
                    <div><p className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{m.name}</p><p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ends {formatDate(m.endDate)}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3-col row: adherence | recent prescriptions | upcoming reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Adherence chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold flex items-center ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}><TrendingUp className="h-5 w-5 mr-2 text-primary-600" />Weekly Adherence</h2>
            <Link to="/reminders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Details</Link>
          </div>
          {weeklyAdherence.every(d => d.taken === 0) ? (
            <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Pill className={`h-10 w-10 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className="text-sm">No doses logged yet — tap "Taken" on a reminder to start tracking.</p>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-1" style={{ height: '140px' }}>
              {weeklyAdherence.map((d, i) => {
                const pct   = (d.taken / maxTaken) * 100
                const isToday = i === 6
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <span className={`text-xs font-semibold h-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{d.taken > 0 ? d.taken : ''}</span>
                    <div className="w-full flex items-end justify-center" style={{ height: '90px' }}>
                      <div className={`w-full rounded-t-md transition-all duration-500 ${isToday ? 'bg-primary-600' : 'bg-primary-300'}`} style={{ height: `${Math.max(pct, d.taken > 0 ? 10 : 0)}%` }} />
                    </div>
                    <span className={`text-xs ${isToday ? 'font-bold text-primary-700' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{d.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Prescriptions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold flex items-center ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}><Activity className="h-5 w-5 mr-2 text-primary-600" />Recent Prescriptions</h2>
            <Link to="/prescriptions" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all</Link>
          </div>
          {recentActivity.length === 0 ? (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <FileText className={`h-12 w-12 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} /><p>No prescriptions yet</p>
              <Link to="/prescriptions" className="mt-2 inline-block text-primary-600 hover:text-primary-700">Upload your first prescription</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((p) => (
                <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  <div className="flex items-center flex-1"><FileText className="h-8 w-8 text-primary-600 mr-3" /><div><p className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{p.fileName}</p><p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(p.uploadDate)}</p></div></div>
                  <span className={`badge ${p.status === 'processed' ? 'badge-success' : p.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>{p.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold flex items-center ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}><Clock className="h-5 w-5 mr-2 text-primary-600" />Upcoming Reminders</h2>
            <Link to="/reminders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all</Link>
          </div>
          {upcomingReminders.length === 0 ? (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Bell className={`h-12 w-12 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} /><p>No reminders set</p>
              <Link to="/medications" className="mt-2 inline-block text-primary-600 hover:text-primary-700">Add medications to set reminders</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingReminders.map((r) => (
                <div key={r.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  <div className="flex items-center flex-1"><Pill className="h-8 w-8 text-green-600 mr-3" /><div><p className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{r.medicineName}</p><p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{r.dosage} • {formatTime(r.time)}</p></div></div>
                  <span className="badge badge-info">{r.frequency}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions — 6 cards */}
      <div className="card">
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { to:'/prescriptions', bg: darkMode ? 'bg-primary-900/30 hover:bg-primary-900/50' : 'bg-primary-50 hover:bg-primary-100',  Icon:FileText,      ic:'text-primary-600', t:'Upload Prescription', s:'Add new prescription' },
            { to:'/medications',   bg: darkMode ? 'bg-green-900/30 hover:bg-green-900/50' : 'bg-green-50 hover:bg-green-100',      Icon:Pill,          ic:'text-green-600',   t:'Manage Medications',  s:'View and track meds' },
            { to:'/pharmacy',      bg: darkMode ? 'bg-blue-900/30 hover:bg-blue-900/50' : 'bg-blue-50 hover:bg-blue-100',        Icon:MapPin,        ic:'text-blue-600',    t:'Find Pharmacy',       s:'Nearby pharmacies' },
            { to:'/doctors',       bg: darkMode ? 'bg-teal-900/30 hover:bg-teal-900/50' : 'bg-teal-50 hover:bg-teal-100',        Icon:Stethoscope,   ic:'text-teal-600',    t:'Find Doctors',        s:'Browse specialists' },
            { to:'/hospitals',     bg: darkMode ? 'bg-purple-900/30 hover:bg-purple-900/50' : 'bg-purple-50 hover:bg-purple-100',    Icon:Building2,     ic:'text-purple-600',  t:'Find Hospitals',      s:'Emergency & more' },
            { to:'/chatbot',       bg: darkMode ? 'bg-rose-900/30 hover:bg-rose-900/50' : 'bg-rose-50 hover:bg-rose-100',        Icon:MessageSquare, ic:'text-rose-600',    t:'Health Chatbot',      s:'Ask symptoms' }
          ].map(({ to, bg, Icon, ic, t, s }) => (
            <Link key={to} to={to} className={`flex items-center p-4 ${bg} rounded-lg transition-colors group`}>
              <Icon className={`h-10 w-10 ${ic} mr-4 group-hover:scale-110 transition-transform`} />
              <div><p className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{t}</p><p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{s}</p></div>
            </Link>
          ))}
        </div>
      </div>

      {/* Rotating Health Tip */}
      <div className={`card border-2 border-primary-100 ${darkMode ? 'bg-gradient-to-r from-primary-900/30 to-blue-900/30' : 'bg-gradient-to-r from-primary-50 to-blue-50'}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0"><div className="bg-primary-600 p-3 rounded-lg"><Activity className="h-6 w-6 text-white" /></div></div>
          <div className="ml-4 flex-1">
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>💡 Health Tip of the Day</h3>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{HEALTH_TIPS[tipIndex]}</p>
            <div className="flex gap-1.5 mt-3">
              {HEALTH_TIPS.map((_, i) => (
                <button key={i} onClick={() => setTipIndex(i)} className={`w-2 h-2 rounded-full transition-colors ${i === tipIndex ? 'bg-primary-600' : darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard