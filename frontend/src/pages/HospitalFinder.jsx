import { useState, useEffect } from 'react'
import { MapPin, Navigation, Phone, Star, Loader, Search, AlertCircle, Building2 } from 'lucide-react'
import { getUserLocation, findNearbyHospitals, getDirectionsUrl } from '../agents/hospitalLocator'
import { useDarkMode } from '../App'

const HospitalFinder = () => {
  const { darkMode } = useDarkMode()
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [searchRadius, setSearchRadius] = useState(5000)
  const [error, setError] = useState('')
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [filterDept, setFilterDept] = useState('All')

  useEffect(() => {
    loadHospitals()
  }, [])

  // ── load ──────────────────────────────────────────
  const loadHospitals = async () => {
    setLoading(true)
    setError('')
    try {
      const loc = await getUserLocation()
      setUserLocation(loc)
      const results = await findNearbyHospitals(loc, searchRadius)
      setHospitals(results)
    } catch (err) {
      console.error(err)
      setError('Could not fetch hospitals. Showing sample data.')
      const results = await findNearbyHospitals({ lat: 12.9716, lng: 77.5946 }, searchRadius)
      setHospitals(results)
    } finally {
      setLoading(false)
    }
  }

  // ── radius change ─────────────────────────────────
  const handleRadiusChange = (r) => {
    setSearchRadius(r)
    setTimeout(() => {
      setLoading(true)
      setError('')
      getUserLocation().then((loc) => {
        setUserLocation(loc)
        findNearbyHospitals(loc, r).then((res) => {
          setHospitals(res)
          setLoading(false)
        })
      })
    }, 150)
  }

  // ── derive department list from current data ──────
  const allDepartments = ['All', ...new Set(hospitals.flatMap(h => h.departments || []))]

  // ── filter ────────────────────────────────────────
  const filtered =
    filterDept === 'All'
      ? hospitals
      : hospitals.filter(h => (h.departments || []).includes(filterDept))

  // ── open / closed counts ──────────────────────────
  const openCount = hospitals.filter(h => h.isOpen === true).length

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Hospital Finder</h1>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Find nearby hospitals, departments and emergency services</p>
      </div>

      {/* ── Search Controls ── */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          {/* location display */}
          <div className="flex items-center">
            <Navigation className="h-5 w-5 text-primary-600 mr-2" />
            <div>
              <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Your Location</p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Detecting…'}
              </p>
            </div>
          </div>

          {/* radius pills */}
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Radius:</span>
            {[2000, 5000, 10000].map((r) => (
              <button
                key={r}
                onClick={() => handleRadiusChange(r)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  searchRadius === r ? 'bg-primary-600 text-white' : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {r / 1000} km
              </button>
            ))}
          </div>

          {/* refresh */}
          <button
            onClick={loadHospitals}
            disabled={loading}
            className="btn-primary flex items-center"
          >
            {loading ? <Loader className="h-5 w-5 mr-2 animate-spin" /> : <Search className="h-5 w-5 mr-2" />}
            {loading ? 'Searching…' : 'Find Hospitals'}
          </button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className={`card border-2 flex items-center gap-3 ${darkMode ? 'bg-yellow-900/30 border-yellow-600' : 'bg-yellow-50 border-yellow-200'}`}>
          <AlertCircle className={`h-5 w-5 flex-shrink-0 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
          <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>{error}</p>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Hospitals Found', value: hospitals.length, color: darkMode ? 'text-gray-100' : 'text-gray-900', icon: <Building2 className="h-7 w-7 text-blue-600" /> },
          { label: 'Open Now', value: openCount, color: 'text-green-600', icon: <Building2 className="h-7 w-7 text-green-600" /> },
          { label: 'Nearest', value: hospitals.length ? `${hospitals[0].distance} km` : '—', color: 'text-primary-600', icon: <Navigation className="h-7 w-7 text-primary-600" /> },
          { label: 'With Emergency', value: hospitals.filter(h => h.hasEmergency).length, color: 'text-red-600', icon: <AlertCircle className="h-7 w-7 text-red-600" /> }
        ].map((s) => (
          <div key={s.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── Department filter ── */}
      <div className="card">
        <div className="flex items-center flex-wrap gap-2">
          <span className={`text-sm font-medium mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Department:</span>
          {allDepartments.map((dept) => (
            <button
              key={dept}
              onClick={() => setFilterDept(dept)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filterDept === dept ? 'bg-primary-600 text-white' : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* ── Hospital List ── */}
      <div className="card">
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Nearby Hospitals ({filtered.length})
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <Loader className="h-12 w-12 mx-auto mb-4 text-primary-600 animate-spin" />
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Searching for nearby hospitals…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            <Building2 className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className="text-lg mb-1">No hospitals found</p>
            <p className="text-sm">Try increasing the search radius or removing the department filter</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((hospital, idx) => (
              <div
                key={hospital.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  idx === 0
                    ? darkMode ? 'bg-green-900/30 border-green-600' : 'bg-green-50 border-green-300'
                    : darkMode ? 'bg-gray-800 border-gray-600 hover:border-primary-400' : 'bg-white border-gray-200 hover:border-primary-300'
                }`}
                onClick={() => setSelectedHospital(hospital)}
              >
                <div className="flex items-start justify-between">
                  {/* left info */}
                  <div className="flex items-start flex-1">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 mr-4 ${idx === 0 ? 'bg-green-600' : 'bg-primary-600'}`}>
                      {idx + 1}
                    </div>

                    <div className="flex-1">
                      {/* name row */}
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <h3 className={`font-bold text-lg ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{hospital.name}</h3>
                        {idx === 0 && <span className="badge badge-success">Nearest</span>}
                        {hospital.hasEmergency && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${darkMode ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700'}`}>
                            🚨 Emergency
                          </span>
                        )}
                        {hospital.isOpen === true && <span className="badge badge-success">Open</span>}
                        {hospital.isOpen === false && <span className="badge badge-danger">Closed</span>}
                      </div>

                      {/* address */}
                      <p className={`text-sm flex items-center mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <MapPin className={`h-4 w-4 mr-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        {hospital.address}
                      </p>

                      {/* meta row */}
                      <div className={`flex items-center flex-wrap gap-4 text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="flex items-center">
                          <Navigation className="h-4 w-4 mr-1 text-primary-600" />
                          <span className="font-semibold">{hospital.distance} km</span>
                        </span>
                        {hospital.rating > 0 && (
                          <span className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" />
                            {hospital.rating} <span className={`ml-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>({hospital.totalRatings})</span>
                          </span>
                        )}
                        {hospital.beds && (
                          <span>🛏️ {hospital.beds} beds</span>
                        )}
                      </div>

                      {/* department chips */}
                      {hospital.departments && (
                        <div className="flex flex-wrap gap-1.5">
                          {hospital.departments.map((dept) => (
                            <span
                              key={dept}
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                dept === 'Emergency'
                                  ? darkMode ? 'bg-red-900/40 text-red-300 font-semibold' : 'bg-red-100 text-red-700 font-semibold'
                                  : darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              {dept}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* right actions */}
                  <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
                    <a
                      href={getDirectionsUrl(hospital, userLocation)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Directions
                    </a>
                    {hospital.phone && (
                      <a
                        href={`tel:${hospital.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Info note ── */}
      <div className={`card border-2 ${darkMode ? 'bg-blue-900/30 border-blue-600' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-start gap-3">
          <Building2 className={`h-6 w-6 flex-shrink-0 mt-0.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <div>
            <h3 className={`font-semibold mb-1 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>Using Real Hospital Locations</h3>
            <p className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-800'}`}>
              Hospital data is fetched from Google Places API. Locations, ratings, and open/closed
              status are real. Click "Directions" to navigate with Google Maps.
            </p>
          </div>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selectedHospital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {/* header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Hospital Details</h2>
              <button onClick={() => setSelectedHospital(null)} className={`text-2xl leading-none ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>✕</button>
            </div>

            {/* name + badges */}
            <div className="mb-4">
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedHospital.name}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedHospital.hasEmergency && (
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${darkMode ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700'}`}>🚨 Emergency Available</span>
                )}
                {selectedHospital.isOpen === true && <span className="badge badge-success">Open Now</span>}
                {selectedHospital.isOpen === false && <span className="badge badge-danger">Closed</span>}
              </div>
            </div>

            {/* info grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-xs mb-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Address</p>
                <p className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedHospital.address}</p>
              </div>
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                <p className={`text-xs mb-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Distance</p>
                <p className={`text-sm font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>{selectedHospital.distance} km away</p>
              </div>
              {selectedHospital.beds && (
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                  <p className={`text-xs mb-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Beds</p>
                  <p className={`text-sm font-semibold ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>{selectedHospital.beds}</p>
                </div>
              )}
              {selectedHospital.rating > 0 && (
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                  <p className={`text-xs mb-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Rating</p>
                  <p className={`text-sm font-semibold flex items-center ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    <Star className="h-4 w-4 mr-1 fill-yellow-500 text-yellow-500" />
                    {selectedHospital.rating} <span className={`font-normal ml-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>({selectedHospital.totalRatings})</span>
                  </p>
                </div>
              )}
            </div>

            {/* departments */}
            {selectedHospital.departments && (
              <div className="mb-5">
                <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Departments</p>
                <div className="flex flex-wrap gap-2">
                  {selectedHospital.departments.map((dept) => (
                    <span
                      key={dept}
                      className={`text-sm px-3 py-1 rounded-full ${
                        dept === 'Emergency'
                          ? darkMode ? 'bg-red-900/40 text-red-300 font-semibold' : 'bg-red-100 text-red-700 font-semibold'
                          : darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* actions */}
            <div className="flex gap-3">
              <a
                href={getDirectionsUrl(selectedHospital, userLocation)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg flex items-center justify-center font-semibold transition-colors"
              >
                <Navigation className="h-5 w-5 mr-2" />
                Get Directions
              </a>
              {selectedHospital.phone && (
                <a
                  href={`tel:${selectedHospital.phone}`}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg flex items-center font-semibold transition-colors"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Call
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HospitalFinder