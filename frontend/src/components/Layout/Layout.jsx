import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home, FileText, Pill, Bell, MapPin, Settings,
  Menu, X, Activity, Stethoscope, Building2, MessageSquare,
  Search, Clock
} from 'lucide-react'
import NotificationBell from '../Notifications/NotificationBell'
import { useDarkMode } from '../../App'
import { prescriptionStorage, medicationStorage } from '../../utils/storage'
import { doctorsData } from '../../data/doctorsData'

/* ── static hospital list (mirrors HospitalFinder data) ── */
const HOSPITALS = [
  { id:'h1', name:'Apollo Hospitals',        address:'Bannerghatta Road, Bengaluru', type:'Multi-Specialty' },
  { id:'h2', name:'Fortis Hospital',         address:'Cunningham Road, Bengaluru',   type:'Multi-Specialty' },
  { id:'h3', name:'Manipal Hospital',        address:'Hebbal, Bengaluru',            type:'Multi-Specialty' },
  { id:'h4', name:'St. Johns Medical Centre', address:'Koramangala, Bengaluru',      type:'Teaching Hospital' },
  { id:'h5', name:'NIMHANS',                 address:'Hosur Road, Bengaluru',        type:'Mental Health' },
  { id:'h6', name:'Victoria Hospital',       address:'Shivajinagar, Bengaluru',     type:'Government' },
]

/* ── run query across all data, return categorised hits ── */
const runGlobalSearch = (q) => {
  if (!q) return { prescriptions: [], medications: [], doctors: [], hospitals: [] }
  const lower = q.toLowerCase()
  const match = (str) => str && str.toLowerCase().includes(lower)

  return {
    prescriptions: prescriptionStorage.getAll().filter(p =>
      match(p.fileName) || match(p.rawText) || (p.medicines || []).some(m => match(m.name))
    ),
    medications: medicationStorage.getAll().filter(m =>
      match(m.name) || match(m.genericName) || match(m.category) || match(m.instructions)
    ),
    doctors: doctorsData.filter(d =>
      match(d.name) || match(d.specialty) || (d.expertise || []).some(e => match(e))
    ),
    hospitals: HOSPITALS.filter(h =>
      match(h.name) || match(h.address) || match(h.type)
    )
  }
}

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen]   = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults]         = useState({ prescriptions:[], medications:[], doctors:[], hospitals:[] })
  const [recentSearches, setRecentSearches] = useState([])
  const location                      = useLocation()
  const { darkMode }                  = useDarkMode()
  const searchInputRef                = useRef(null)

  /* close search on route change */
  useEffect(() => { setSearchOpen(false) }, [location.pathname])

  /* open search on Cmd/Ctrl + K */
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  /* auto-focus when modal opens */
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 60)
  }, [searchOpen])

  /* run search on every keystroke */
  useEffect(() => {
    setResults(runGlobalSearch(searchQuery))
  }, [searchQuery])

  const handlePickResult = () => {
    /* push current query to recent (max 6) */
    if (searchQuery.trim()) {
      setRecentSearches(prev => [searchQuery.trim(), ...prev.filter(s => s !== searchQuery.trim())].slice(0, 6))
    }
    setSearchOpen(false)
    setSearchQuery('')
  }

  const totalHits = results.prescriptions.length + results.medications.length + results.doctors.length + results.hospitals.length

  const navigation = [
    { name: 'Dashboard',      path: '/',             icon: Home },
    { name: 'Prescriptions',  path: '/prescriptions', icon: FileText },
    { name: 'Medications',    path: '/medications',   icon: Pill },
    { name: 'Reminders',      path: '/reminders',     icon: Bell },
    { name: 'Pharmacy Finder',path: '/pharmacy',      icon: MapPin },
    { name: 'Find Doctors',   path: '/doctors',       icon: Stethoscope },
    { name: 'Find Hospitals', path: '/hospitals',     icon: Building2 },
    { name: 'Health Chatbot', path: '/chatbot',       icon: MessageSquare },
    { name: 'Settings',       path: '/settings',      icon: Settings }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* ── Top Nav ── */}
      <nav className={`shadow-md fixed top-0 left-0 right-0 z-30 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`lg:hidden p-2 rounded-md ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Link to="/" className="flex items-center ml-2 lg:ml-0">
                <Activity className="h-8 w-8 text-primary-600" />
                <span className={`ml-2 text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  MedConnect <span className="text-primary-600">AI</span>
                </span>
              </Link>
            </div>

            {/* Search trigger + Notifications */}
            <div className="flex items-center gap-3">
              {/* search pill button */}
              <button
                onClick={() => setSearchOpen(true)}
                className={`hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-lg border transition-colors ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <Search className="h-4 w-4" />
                <span className="text-sm">Search…</span>
                <span className={`text-xs ml-2 px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>⌘K</span>
              </button>
              {/* mobile search icon */}
              <button onClick={() => setSearchOpen(true)} className={`sm:hidden p-2 rounded-md ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Search className="h-5 w-5" />
              </button>
              <NotificationBell />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* ── Sidebar ── */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-20
          w-64 shadow-lg transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          mt-16 lg:mt-0
          ${darkMode ? 'bg-gray-800' : 'bg-white'}
        `}>
          <nav className="h-full overflow-y-auto py-6">
            <div className="space-y-1 px-3">
              {navigation.map((item) => {
                const Icon   = item.icon
                const active = isActive(item.path)
                return (
                  <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                        : darkMode
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-gray-100'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${active ? 'text-primary-600' : ''}`} />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* Pro tip box */}
            <div className="mt-8 px-6">
              <div className={`rounded-lg p-4 border ${darkMode ? 'bg-primary-900/30 border-primary-800 text-primary-300' : 'bg-primary-50 border-primary-100 text-primary-700'}`}>
                <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-primary-200' : 'text-primary-900'}`}>💡 Pro Tip</h3>
                <p className="text-xs">Upload your prescription to automatically extract medicines and set reminders!</p>
              </div>
            </div>
          </nav>
        </aside>

        {/* mobile overlay */}
        {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden mt-16" onClick={() => setSidebarOpen(false)} />}

        {/* ── Main Content ── */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* ══════════════════════════════════════════════════════════
           GLOBAL SEARCH MODAL
         ══════════════════════════════════════════════════════════ */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4" onClick={() => setSearchOpen(false)}>
          {/* backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-40" />

          {/* modal shell */}
          <div
            className={`relative w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            onClick={e => e.stopPropagation()}
          >
            {/* input row */}
            <div className={`flex items-center px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <Search className={`h-5 w-5 mr-3 flex-shrink-0 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
                placeholder="Search prescriptions, medications, doctors, hospitals…"
                className={`flex-1 text-sm outline-none bg-transparent placeholder-gray-400 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 ml-2 text-lg leading-none">✕</button>
              )}
            </div>

            {/* results / empty / recent */}
            <div className={`max-h-96 overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>

              {/* no query typed → show recent searches */}
              {!searchQuery && recentSearches.length > 0 && (
                <div className="p-3">
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Recent searches</p>
                  {recentSearches.map((s, i) => (
                    <button key={i} onClick={() => setSearchQuery(s)} className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                      <Clock className="h-4 w-4 text-gray-400" />{s}
                    </button>
                  ))}
                </div>
              )}

              {/* no query + no recents */}
              {!searchQuery && recentSearches.length === 0 && (
                <div className={`text-center py-10 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Search className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Start typing to search across your data</p>
                </div>
              )}

              {/* query entered but zero hits */}
              {searchQuery && totalHits === 0 && (
                <div className={`text-center py-10 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <p className="text-sm">No results for "<span className="font-semibold">{searchQuery}</span>"</p>
                </div>
              )}

              {/* ── result groups ── */}
              {searchQuery && results.prescriptions.length > 0 && (
                <ResultGroup label="Prescriptions" icon={FileText} darkMode={darkMode}>
                  {results.prescriptions.map(p => (
                    <Link key={p.id} to="/prescriptions" onClick={handlePickResult} className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <FileText className="h-4 w-4 text-primary-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{p.fileName}</p>
                        <p className={`text-xs truncate ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{(p.medicines||[]).map(m=>m.name).join(', ') || 'No medicines extracted'}</p>
                      </div>
                      <span className="badge badge-info ml-auto text-xs">{p.status}</span>
                    </Link>
                  ))}
                </ResultGroup>
              )}

              {searchQuery && results.medications.length > 0 && (
                <ResultGroup label="Medications" icon={Pill} darkMode={darkMode}>
                  {results.medications.map(m => (
                    <Link key={m.id} to="/medications" onClick={handlePickResult} className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <Pill className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{m.name}</p>
                        <p className={`text-xs truncate ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{m.dosage} • {m.frequency}</p>
                      </div>
                      <span className={`text-xs ml-auto ${m.isActive ? 'text-green-600' : 'text-gray-400'}`}>{m.isActive ? 'Active' : 'Inactive'}</span>
                    </Link>
                  ))}
                </ResultGroup>
              )}

              {searchQuery && results.doctors.length > 0 && (
                <ResultGroup label="Doctors" icon={Stethoscope} darkMode={darkMode}>
                  {results.doctors.map(d => (
                    <Link key={d.id} to={`/doctors?specialty=${encodeURIComponent(d.specialty)}`} onClick={handlePickResult} className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <div className="w-7 h-7 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {d.name.split(' ').slice(-1)[0][0]}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{d.name}</p>
                        <p className={`text-xs truncate ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{d.specialty} • {d.hospital}</p>
                      </div>
                      <span className={`text-xs font-semibold ml-auto ${darkMode ? 'text-green-400' : 'text-green-700'}`}>₹{d.consultationFee}</span>
                    </Link>
                  ))}
                </ResultGroup>
              )}

              {searchQuery && results.hospitals.length > 0 && (
                <ResultGroup label="Hospitals" icon={Building2} darkMode={darkMode}>
                  {results.hospitals.map(h => (
                    <Link key={h.id} to="/hospitals" onClick={handlePickResult} className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <Building2 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{h.name}</p>
                        <p className={`text-xs truncate ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{h.address}</p>
                      </div>
                      <span className={`text-xs ml-auto ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>{h.type}</span>
                    </Link>
                  ))}
                </ResultGroup>
              )}
            </div>

            {/* footer hint */}
            <div className={`flex items-center justify-between px-4 py-2 border-t text-xs ${darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-100 text-gray-400'}`}>
              <span><span className={`px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Esc</span> to close</span>
              {searchQuery && totalHits > 0 && <span>{totalHits} result{totalHits !== 1 ? 's' : ''}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── tiny helper: a labelled group header inside search results ── */
const ResultGroup = ({ label, icon: Icon, darkMode, children }) => (
  <div>
    <div className={`flex items-center gap-2 px-4 pt-3 pb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
      <Icon className="h-3.5 w-3.5" />
      <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
    </div>
    {children}
  </div>
)

export default Layout