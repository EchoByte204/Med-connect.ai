import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Shield, Loader, Info } from 'lucide-react'
import { medicationStorage } from '../../utils/storage'
import { checkMedicationInteractions, getInteractionColor, getInteractionIcon } from '../../agents/interactionAgent'
import { useDarkMode } from '../../App'

const InteractionChecker = () => {
  const { darkMode } = useDarkMode()
  const [medications, setMedications] = useState([])
  const [checking, setChecking] = useState(false)
  const [interactions, setInteractions] = useState([])
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    loadMedications()
  }, [])

  const loadMedications = () => {
    const activeMeds = medicationStorage.getActive()
    setMedications(activeMeds)
  }

  const handleCheckInteractions = async () => {
    setChecking(true)
    setHasChecked(false)

    try {
      const result = await checkMedicationInteractions(medications)
      
      if (result.success) {
        setInteractions(result.interactions)
        setHasChecked(true)
      } else {
        alert('Failed to check interactions. Please try again.')
      }
    } catch (error) {
      console.error('Error checking interactions:', error)
      alert('Error checking interactions. Please try again.')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <Shield className="h-10 w-10 text-primary-600 mr-4 flex-shrink-0" />
            <div>
              <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Drug Interaction Checker
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Check if your current medications can be safely taken together
              </p>
            </div>
          </div>
        </div>

        {medications.length < 2 ? (
          <div className={`mt-6 p-4 border rounded-lg ${darkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-start">
              <Info className={`h-5 w-5 mr-2 flex-shrink-0 mt-0.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <div>
                <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  You need at least 2 active medications to check for interactions.
                  Add medications from your prescriptions or manually.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-6">
              <h4 className={`font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Current Active Medications ({medications.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {medications.map((med) => (
                  <div
                    key={med.id}
                    className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <p className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{med.name}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {med.dosage} • {med.frequency}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleCheckInteractions}
                disabled={checking}
                className="btn-primary w-full flex items-center justify-center"
              >
                {checking ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    Checking Interactions...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5 mr-2" />
                    Check for Drug Interactions
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Results */}
      {hasChecked && (
        <div className="card">
          {interactions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
              <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                ✅ No Interactions Found
              </h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Your current medications appear to be safe to take together.
              </p>
              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Always consult your doctor or pharmacist for medical advice.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-orange-600 mr-2" />
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {interactions.length} Interaction{interactions.length > 1 ? 's' : ''} Found
                </h3>
              </div>

              <div className="space-y-4">
                {interactions.map((interaction, index) => (
                  <div
                    key={index}
                    className={`p-4 border-2 rounded-lg ${getInteractionColor(interaction.severity)}`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start flex-1">
                        <span className="text-2xl mr-3">
                          {getInteractionIcon(interaction.severity)}
                        </span>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-1">
                            {interaction.medicine1} + {interaction.medicine2}
                          </h4>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold uppercase ${
                            interaction.severity === 'severe' ? 'bg-red-200 text-red-900' :
                            interaction.severity === 'moderate' ? 'bg-orange-200 text-orange-900' :
                            'bg-yellow-200 text-yellow-900'
                          }`}>
                            {interaction.severity} Severity
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-3">
                      <p className="font-semibold text-sm mb-1">What happens:</p>
                      <p className="text-sm">{interaction.description}</p>
                    </div>

                    {/* Recommendation */}
                    <div className={`p-3 rounded-lg border border-current ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <p className="font-semibold text-sm mb-1">⚕️ Recommendation:</p>
                      <p className="text-sm">{interaction.recommendation}</p>
                    </div>

                    {/* Warning for severe */}
                    {interaction.severity === 'severe' && (
                      <div className="mt-3 p-3 bg-red-100 border-2 border-red-300 rounded-lg">
                        <p className="text-sm font-bold text-red-900">
                          🚨 SEVERE INTERACTION - Contact your doctor immediately!
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div className={`mt-6 p-4 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>Medical Disclaimer:</strong> This interaction checker uses AI and should not replace 
                  professional medical advice. Always consult with your doctor or pharmacist before starting, 
                  stopping, or changing any medication.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default InteractionChecker       