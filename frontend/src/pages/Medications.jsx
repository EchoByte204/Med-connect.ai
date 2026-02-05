import { useState, useEffect } from 'react'
import { Pill, Plus, Edit2, Trash2, Calendar, Clock, AlertCircle, Info, Shield } from 'lucide-react'
import { medicationStorage, reminderStorage } from '../utils/storage'
import { formatDate, generateId, calculateEndDate, isPastDate } from '../utils/helpers'
import InteractionChecker from '../components/Interactions/InteractionChecker'
import { useDarkMode } from '../App'

const Medications = () => {
  const { darkMode } = useDarkMode()
  const [medications, setMedications] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMed, setEditingMed] = useState(null)
  const [filter, setFilter] = useState('active')

  useEffect(() => { loadMedications() }, [])

  const loadMedications = () => setMedications(medicationStorage.getAll())

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      medicationStorage.delete(id)
      reminderStorage.getByMedicineId(id).forEach(r => reminderStorage.delete(r.id))
      loadMedications()
    }
  }

  const handleToggleActive = (id) => {
    const med = medications.find(m => m.id === id)
    medicationStorage.update(id, { isActive: !med.isActive })
    loadMedications()
  }

  const filteredMedications = medications.filter(med => {
    if (filter === 'active') return med.isActive
    if (filter === 'expired') return isPastDate(med.endDate)
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Medications</h1>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Track and manage your active medications</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" /> Add Medication
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Medications</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{medications.length}</p>
            </div>
            <Pill className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active</p>
              <p className="text-2xl font-bold text-green-600">{medications.filter(m => m.isActive).length}</p>
            </div>
            <Pill className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Expired</p>
              <p className="text-2xl font-bold text-red-600">{medications.filter(m => isPastDate(m.endDate)).length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className={`card cursor-pointer transition-colors ${darkMode ? 'hover:bg-primary-900/30' : 'hover:bg-primary-50'}`} onClick={() => document.getElementById('interaction-checker')?.scrollIntoView({ behavior: 'smooth' })}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Check Interactions</p>
              <p className="text-sm font-bold text-primary-600">Click to Check</p>
            </div>
            <Shield className="h-8 w-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Filter:</span>
          {['all','active','expired'].map(f => {
            const counts = { all: medications.length, active: medications.filter(m => m.isActive).length, expired: medications.filter(m => isPastDate(m.endDate)).length }
            const labels = { all: 'All', active: 'Active', expired: 'Expired' }
            return (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? 'bg-primary-600 text-white' : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
                {labels[f]} ({counts[f]})
              </button>
            )
          })}
        </div>
      </div>

      {/* Drug Interaction Checker */}
      <div id="interaction-checker"><InteractionChecker /></div>

      {/* Medications List */}
      <div className="card">
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Your Medications ({filteredMedications.length})
        </h2>

        {filteredMedications.length === 0 ? (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Pill className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className="text-lg mb-2">No medications found</p>
            <p className="text-sm">{filter === 'all' ? 'Add your first medication to get started' : `No ${filter} medications`}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMedications.map((med) => {
              const isExpired = isPastDate(med.endDate)
              return (
                <div key={med.id} className={`p-4 rounded-lg border-2 transition-all ${
                  isExpired
                    ? darkMode ? 'border-red-800 bg-red-900/20' : 'border-red-300 bg-red-50'
                    : med.isActive
                      ? darkMode ? 'bg-gray-700 border-green-800' : 'bg-white border-green-200'
                      : darkMode ? 'bg-gray-700/50 border-gray-600 opacity-60' : 'bg-gray-50 border-gray-200 opacity-60'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      <Pill className={`h-10 w-10 mr-3 flex-shrink-0 ${med.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className={`font-bold text-lg ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{med.name}</h3>
                          <span className={`badge ${med.category === 'antibiotic' ? 'badge-danger' : med.category === 'painkiller' ? 'badge-warning' : med.category === 'vitamin' ? 'badge-success' : 'badge-info'}`}>{med.category}</span>
                          {isExpired && <span className="badge badge-danger">Expired</span>}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-2">
                          {[['Dosage', med.dosage], ['Frequency', med.frequency], ['Duration', med.duration]].map(([label, val]) => (
                            <div key={label}>
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{label}:</span>
                              <span className={`ml-2 font-medium ${darkMode ? 'text-gray-200' : ''}`}>{val}</span>
                            </div>
                          ))}
                          <div>
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>End Date:</span>
                            <span className={`ml-2 font-medium ${isExpired ? 'text-red-600' : darkMode ? 'text-gray-200' : ''}`}>{formatDate(med.endDate)}</span>
                          </div>
                        </div>

                        {med.instructions && (
                          <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Clock className="inline h-4 w-4 mr-1" />{med.instructions}
                          </p>
                        )}

                        {med.explanation && (
                          <div className={`mt-3 p-3 border rounded-lg ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                            <div className="flex items-start">
                              <Info className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className={`text-xs font-semibold mb-1 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>What this medicine does:</p>
                                <p className={`text-xs ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>{med.explanation}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button onClick={() => handleToggleActive(med.id)} className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        med.isActive
                          ? darkMode ? 'bg-yellow-900/40 text-yellow-300 hover:bg-yellow-900/60' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : darkMode ? 'bg-green-900/40 text-green-300 hover:bg-green-900/60' : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}>
                        {med.isActive ? 'Pause' : 'Resume'}
                      </button>
                      <button onClick={() => setEditingMed(med)} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`} title="Edit">
                        <Edit2 className="h-5 w-5 text-blue-600" />
                      </button>
                      <button onClick={() => handleDelete(med.id)} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`} title="Delete">
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddForm || editingMed) && (
        <MedicationForm
          medication={editingMed}
          onClose={() => { setShowAddForm(false); setEditingMed(null) }}
          onSave={() => { loadMedications(); setShowAddForm(false); setEditingMed(null) }}
        />
      )}
    </div>
  )
}

// Medication Form Component
const MedicationForm = ({ medication, onClose, onSave }) => {
  const { darkMode } = useDarkMode()
  const [formData, setFormData] = useState(
    medication || { name: '', genericName: '', dosage: '', frequency: 'twice daily', duration: '7 days', instructions: '', category: 'other' }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    if (medication) {
      medicationStorage.update(medication.id, formData)
    } else {
      medicationStorage.add({
        id: generateId('med'), ...formData, prescriptionId: null,
        startDate: new Date().toISOString(),
        endDate: calculateEndDate(new Date().toISOString(), formData.duration),
        isActive: true, refillReminder: false
      })
    }
    onSave()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-6">
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {medication ? 'Edit Medication' : 'Add New Medication'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Medicine Name *', key: 'name', type: 'text', required: true, placeholder: 'e.g., Amoxicillin' },
                { label: 'Generic Name', key: 'genericName', type: 'text', required: false, placeholder: 'e.g., Amoxicillin' },
                { label: 'Dosage *', key: 'dosage', type: 'text', required: true, placeholder: 'e.g., 500mg' },
                { label: 'Duration *', key: 'duration', type: 'text', required: true, placeholder: 'e.g., 7 days' }
              ].map(({ label, key, type, required, placeholder }) => (
                <div key={key}>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</label>
                  <input type={type} required={required} value={formData[key]} onChange={(e) => setFormData({...formData, [key]: e.target.value})} className="input-field" placeholder={placeholder} />
                </div>
              ))}

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category *</label>
                <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="input-field">
                  <option value="antibiotic">Antibiotic</option>
                  <option value="painkiller">Painkiller</option>
                  <option value="vitamin">Vitamin</option>
                  <option value="antacid">Antacid</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Frequency *</label>
                <select required value={formData.frequency} onChange={(e) => setFormData({...formData, frequency: e.target.value})} className="input-field">
                  <option value="once daily">Once daily</option>
                  <option value="twice daily">Twice daily</option>
                  <option value="thrice daily">Thrice daily</option>
                  <option value="four times daily">Four times daily</option>
                  <option value="as needed">As needed</option>
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Instructions</label>
              <textarea value={formData.instructions} onChange={(e) => setFormData({...formData, instructions: e.target.value})} className="input-field" rows="3" placeholder="e.g., Take after food, Avoid alcohol" />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">{medication ? 'Update Medication' : 'Add Medication'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Medications