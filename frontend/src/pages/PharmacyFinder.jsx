import { useState, useEffect } from 'react'
import { MapPin, Navigation, Phone, Clock, Star, Loader, Search, ExternalLink } from 'lucide-react'
import { getUserLocation, findNearbyPharmacies, getDirectionsUrl, getCallUrl } from '../agents/pharmacyLocator'
import { useDarkMode } from '../App'

const PharmacyFinder = () => {
  const { darkMode } = useDarkMode()
  const [pharmacies, setPharmacies] = useState([])
  const [loading, setLoading] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [searchRadius, setSearchRadius] = useState(5000) // 5km default
  const [error, setError] = useState('')

  useEffect(() => {
    loadNearbyPharmacies()
  }, [])

  const loadNearbyPharmacies = async () => {
    setLoading(true)
    setError('')

    try {
      // Get user location
      const location = await getUserLocation()
      setUserLocation(location)

      // Find nearby pharmacies
      const nearbyPharmacies = await findNearbyPharmacies(location, searchRadius)
      setPharmacies(nearbyPharmacies)

    } catch (err) {
      console.error('Error loading pharmacies:', err)
      setError('Could not load pharmacies. Showing sample data.')
      
      // Load fallback data
      const fallback = await findNearbyPharmacies({ lat: 12.9716, lng: 77.5946 }, searchRadius)
      setPharmacies(fallback)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadNearbyPharmacies()
  }

  const handleRadiusChange = (newRadius) => {
    setSearchRadius(newRadius)
    // Auto-refresh with new radius
    setTimeout(loadNearbyPharmacies, 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Pharmacy Finder
        </h1>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          Find nearby pharmacies and compare availability
        </p>
      </div>

      {/* Search Controls */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Navigation className="h-6 w-6 text-primary-600 mr-2" />
            <div>
              <h3 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Your Location</h3>
              {userLocation && (
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn-primary flex items-center"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-5 w-5 mr-2" />
                Find Pharmacies
              </>
            )}
          </button>
        </div>

        {/* Radius Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Search Radius
          </label>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleRadiusChange(2000)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchRadius === 2000
                  ? 'bg-primary-600 text-white'
                  : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              2 km
            </button>
            <button
              onClick={() => handleRadiusChange(5000)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchRadius === 5000
                  ? 'bg-primary-600 text-white'
                  : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              5 km
            </button>
            <button
              onClick={() => handleRadiusChange(10000)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchRadius === 10000
                  ? 'bg-primary-600 text-white'
                  : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              10 km
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`card border-2 ${darkMode ? 'bg-yellow-900/30 border-yellow-600' : 'bg-yellow-50 border-yellow-200'}`}>
          <p className={darkMode ? 'text-yellow-300' : 'text-yellow-800'}>{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pharmacies Found</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {pharmacies.length}
              </p>
            </div>
            <MapPin className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Nearest</p>
              <p className="text-2xl font-bold text-green-600">
                {pharmacies.length > 0 ? `${pharmacies[0].distance} km` : '-'}
              </p>
            </div>
            <Navigation className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Open Now</p>
              <p className="text-2xl font-bold text-primary-600">
                {pharmacies.filter(p => p.isOpen).length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Pharmacies List */}
      <div className="card">
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Nearby Pharmacies ({pharmacies.length})
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <Loader className="h-12 w-12 mx-auto mb-4 text-primary-600 animate-spin" />
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Searching for nearby pharmacies...</p>
          </div>
        ) : pharmacies.length === 0 ? (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            <MapPin className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className="text-lg mb-2">No pharmacies found</p>
            <p className="text-sm">Try increasing the search radius</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pharmacies.map((pharmacy, index) => (
              <div
                key={pharmacy.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  index === 0
                    ? darkMode ? 'bg-green-900/30 border-green-600' : 'bg-green-50 border-green-300'
                    : pharmacy.isOpen
                    ? darkMode ? 'bg-gray-800 border-gray-600 hover:border-primary-400' : 'bg-white border-gray-200 hover:border-primary-300'
                    : darkMode ? 'bg-gray-800/60 border-gray-600 opacity-75' : 'bg-gray-50 border-gray-200 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    {/* Number Badge */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 font-bold text-white ${
                      index === 0 ? 'bg-green-600' : 'bg-primary-600'
                    }`}>
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      {/* Pharmacy Name */}
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className={`font-bold text-lg ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {pharmacy.name}
                        </h3>
                        {index === 0 && (
                          <span className="badge badge-success">
                            Nearest
                          </span>
                        )}
                        {pharmacy.isOpen === true && (
                          <span className="badge badge-success">
                            Open Now
                          </span>
                        )}
                        {pharmacy.isOpen === false && (
                          <span className="badge badge-danger">
                            Closed
                          </span>
                        )}
                      </div>

                      {/* Address */}
                      <p className={`text-sm mb-2 flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <MapPin className="h-4 w-4 mr-1" />
                        {pharmacy.address}
                      </p>

                      {/* Details */}
                      <div className={`flex items-center space-x-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="flex items-center">
                          <Navigation className="h-4 w-4 mr-1 text-primary-600" />
                          <span className="font-semibold">{pharmacy.distance} km away</span>
                        </span>
                        {pharmacy.rating > 0 && (
                          <span className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" />
                            {pharmacy.rating} ({pharmacy.totalRatings})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <a
                      href={getDirectionsUrl(pharmacy, userLocation)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Directions
                    </a>
                    {pharmacy.phone && (
                      <a
                        href={getCallUrl(pharmacy.phone)}
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

      {/* Info Box */}
      <div className={`card border-2 ${darkMode ? 'bg-blue-900/30 border-blue-600' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-start">
          <MapPin className={`h-6 w-6 mr-3 flex-shrink-0 mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <div>
            <h3 className={`font-semibold mb-1 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
              Using Real Pharmacy Locations
            </h3>
            <p className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-800'}`}>
              This feature uses Google Places API to show actual pharmacies near your location. 
              Locations, ratings, and operating hours are real. Click "Directions" to navigate 
              using Google Maps.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PharmacyFinder