import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { User, Phone, Star, Award, Clock, Search, IndianRupee, Stethoscope, Calendar, X } from 'lucide-react'
import { doctorsData, getSpecialties, getDoctorsBySpecialty, searchDoctors, sortDoctorsByFee, sortDoctorsByRating } from '../data/doctorsData'
import { appointmentStorage } from '../utils/storage'
import { generateId } from '../utils/helpers'

const DoctorDirectory = () => {
  const [searchParams]                            = useSearchParams()
  const [doctors, setDoctors]                     = useState(doctorsData)
  const [filteredDoctors, setFilteredDoctors]     = useState(doctorsData)
  const [selectedSpecialty, setSelectedSpecialty] = useState('All')
  const [searchQuery, setSearchQuery]             = useState('')
  const [sortBy, setSortBy]                       = useState('rating')
  const [selectedDoctor, setSelectedDoctor]       = useState(null)
  const [specialties, setSpecialties]             = useState([])
  // appointment modal
  const [bookingDoctor, setBookingDoctor]         = useState(null)
  const [bookingDate, setBookingDate]             = useState('')
  const [bookingTime, setBookingTime]             = useState('')
  const [bookingNote, setBookingNote]             = useState('')
  const [bookingSaved, setBookingSaved]           = useState(false)

  /* ── on mount read ?specialty= from URL (chatbot bridge) ── */
  useEffect(() => {
    const sp = searchParams.get('specialty')
    if (sp) setSelectedSpecialty(sp)
    setSpecialties(['All', ...getSpecialties()])
  }, [searchParams])

  useEffect(() => { filterAndSort() }, [selectedSpecialty, searchQuery, sortBy])

  const filterAndSort = () => {
    let result = doctors
    if (selectedSpecialty && selectedSpecialty !== 'All') result = getDoctorsBySpecialty(selectedSpecialty)
    if (searchQuery.trim()) result = searchDoctors(searchQuery)
    if (sortBy === 'fee-low')  result = sortDoctorsByFee(result, true)
    else if (sortBy === 'fee-high') result = sortDoctorsByFee(result, false)
    else if (sortBy === 'rating')   result = sortDoctorsByRating(result)
    setFilteredDoctors(result)
  }

  /* ── next-7-days date options for booking ── */
  const getNextDates = () => {
    const dates = []
    for (let i = 1; i <= 7; i++) {
      const d = new Date(); d.setDate(d.getDate() + i)
      dates.push({ value: d.toISOString().split('T')[0], label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) })
    }
    return dates
  }

  const TIME_SLOTS = ['09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM']

  const handleBookSave = () => {
    if (!bookingDate || !bookingTime) return
    appointmentStorage.add({
      id: generateId('appt'),
      doctorId: bookingDoctor.id,
      doctorName: bookingDoctor.name,
      specialty: bookingDoctor.specialty,
      hospital: bookingDoctor.hospital,
      phone: bookingDoctor.phone,
      date: bookingDate,
      time: bookingTime,
      note: bookingNote,
      createdAt: new Date().toISOString()
    })
    setBookingSaved(true)
    setTimeout(() => { setBookingSaved(false); setBookingDoctor(null); setBookingDate(''); setBookingTime(''); setBookingNote('') }, 2200)
  }

  // ── stats
  const avgFee = Math.round(doctorsData.reduce((s, d) => s + d.consultationFee, 0) / doctorsData.length)

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Directory</h1>
        <p className="text-gray-600">Find and consult with specialized doctors</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Total Doctors', value: doctorsData.length, color:'text-gray-900' },
          { label:'Specialties',   value: getSpecialties().length, color:'text-primary-600' },
          { label:'Avg Fee',       value: `₹${avgFee}`, color:'text-green-600' },
          { label:'Avg Rating',    value: (doctorsData.reduce((s,d)=>s+d.rating,0)/doctorsData.length).toFixed(1), color:'text-yellow-600' }
        ].map(s => (
          <div key={s.label} className="card">
            <p className="text-sm text-gray-600">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Doctor</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or specialty..." className="input-field pl-10" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
            <select value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)} className="input-field">
              {specialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field">
              <option value="rating">Highest Rating</option>
              <option value="fee-low">Fee: Low to High</option>
              <option value="fee-high">Fee: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Doctor Cards */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Doctors ({filteredDoctors.length})</h2>
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Stethoscope className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No doctors match your search</p>
            <p className="text-sm">Try a different specialty or clear the search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="p-4 border-2 border-gray-200 rounded-xl hover:border-primary-300 transition-colors cursor-pointer" onClick={() => setSelectedDoctor(doctor)}>
                <div className="flex items-start">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 mr-4">
                    {doctor.name.split(' ').slice(-1)[0][0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{doctor.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 font-semibold">{doctor.specialty}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{doctor.qualifications} • {doctor.experience} yrs</p>
                    <p className="text-xs text-gray-600 mb-2">{doctor.hospital}</p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-sm text-yellow-600"><Star className="h-4 w-4 mr-1 fill-yellow-500" />{doctor.rating} <span className="text-gray-400 ml-1">({doctor.totalRatings})</span></span>
                      <span className="text-sm font-bold text-green-700">₹{doctor.consultationFee}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {doctor.expertise.slice(0, 3).map(e => <span key={e} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{e}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Doctor Detail Modal ── */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Doctor Profile</h2>
              <button onClick={() => setSelectedDoctor(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">✕</button>
            </div>
            {/* avatar + name */}
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                {selectedDoctor.name.split(' ').slice(-1)[0][0]}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedDoctor.name}</h3>
                <p className="text-sm text-gray-500">{selectedDoctor.specialty} • {selectedDoctor.experience} years</p>
                <div className="flex items-center mt-1 text-yellow-600 text-sm"><Star className="h-4 w-4 mr-1 fill-yellow-500" />{selectedDoctor.rating} ({selectedDoctor.totalRatings} reviews)</div>
              </div>
            </div>
            {/* info grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Hospital</p><p className="text-sm font-semibold">{selectedDoctor.hospital}</p></div>
              <div className="p-3 bg-green-50 rounded-lg"><p className="text-xs text-gray-500">Consultation Fee</p><p className="text-sm font-semibold text-green-700">₹{selectedDoctor.consultationFee}</p></div>
              <div className="p-3 bg-blue-50 rounded-lg"><p className="text-xs text-gray-500">Availability</p><p className="text-sm font-semibold">{selectedDoctor.availability}</p></div>
              <div className="p-3 bg-purple-50 rounded-lg"><p className="text-xs text-gray-500">Languages</p><p className="text-sm font-semibold">{selectedDoctor.languages.join(', ')}</p></div>
            </div>
            {/* about */}
            <div className="mb-4"><h4 className="font-semibold text-gray-900 mb-2">About</h4><p className="text-sm text-gray-700">{selectedDoctor.about}</p></div>
            {/* expertise */}
            <div className="mb-5">
              <h4 className="font-semibold text-gray-900 mb-2">Areas of Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {selectedDoctor.expertise.map(e => <span key={e} className="text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-700">{e}</span>)}
              </div>
            </div>
            {/* action buttons */}
            <div className="flex gap-3">
              <a href={`tel:${selectedDoctor.phone}`} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg flex items-center justify-center font-semibold transition-colors">
                <Phone className="h-5 w-5 mr-2" />Call
              </a>
              <button onClick={() => { setBookingDoctor(selectedDoctor); setSelectedDoctor(null) }}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg flex items-center justify-center font-semibold transition-colors">
                <Calendar className="h-5 w-5 mr-2" />Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Book Appointment Modal ── */}
      {bookingDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            {bookingSaved ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Appointment Saved!</h3>
                <p className="text-sm text-gray-600">Your appointment with {bookingDoctor.name} has been noted.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-gray-900">Book Appointment</h2>
                  <button onClick={() => setBookingDoctor(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">✕</button>
                </div>
                {/* doctor summary */}
                <div className="flex items-center p-3 bg-gray-50 rounded-lg mb-5">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold mr-3">{bookingDoctor.name.split(' ').slice(-1)[0][0]}</div>
                  <div><p className="font-semibold text-gray-900">{bookingDoctor.name}</p><p className="text-xs text-gray-500">{bookingDoctor.specialty} • {bookingDoctor.hospital}</p></div>
                  <span className="ml-auto text-sm font-bold text-green-700">₹{bookingDoctor.consultationFee}</span>
                </div>
                {/* date */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Date *</label>
                  <select value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="input-field">
                    <option value="">Choose a date</option>
                    {getNextDates().map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
                {/* time */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Time *</label>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map(t => (
                      <button key={t} onClick={() => setBookingTime(t)}
                        className={`text-xs py-2 rounded-lg border transition-colors ${bookingTime === t ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-700 hover:border-primary-300'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                {/* note */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Note (Optional)</label>
                  <textarea value={bookingNote} onChange={(e) => setBookingNote(e.target.value)} className="input-field" rows="2" placeholder="e.g., Follow-up for blood pressure" />
                </div>
                {/* buttons */}
                <div className="flex gap-3">
                  <button onClick={() => setBookingDoctor(null)} className="flex-1 py-2.5 rounded-lg border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                  <button onClick={handleBookSave} disabled={!bookingDate || !bookingTime}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white py-2.5 rounded-lg font-semibold transition-colors">
                    Confirm Appointment
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorDirectory