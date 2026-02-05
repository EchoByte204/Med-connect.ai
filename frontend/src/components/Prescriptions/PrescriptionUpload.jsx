import { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Loader, Info } from 'lucide-react'
import { fileToBase64, generateId, formatFileSize } from '../../utils/helpers'
import { prescriptionStorage, medicationStorage } from '../../utils/storage'
import { extractTextFromImage } from '../../agents/ocrAgent'
import { extractMedicinesFromText, validatePrescription } from '../../utils/geminiApi'
import { createRemindersForMedication } from '../../agents/scheduleAgent'
import { checkMedicationInteractions } from '../../agents/interactionAgent'
import { useDarkMode } from '../../App'

const PrescriptionUpload = ({ onUploadComplete }) => {
  const { darkMode } = useDarkMode()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [extractedText, setExtractedText] = useState('')
  const [extractedMedicines, setExtractedMedicines] = useState([])
  const [interactionWarnings, setInteractionWarnings] = useState([])
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  /* ── shared validation extracted so both click & drop use it ── */
  const validateAndSet = (selectedFile) => {
    if (!selectedFile) return
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a valid image (JPG, PNG) or PDF file')
      return
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }
    setError('')
    setFile(selectedFile)
    if (selectedFile.type.startsWith('image/')) {
      fileToBase64(selectedFile).then(b => setPreview(b))
    }
  }

  /* ── drag-and-drop handlers ── */
  const handleDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = (e) => { e.preventDefault(); setDragging(false) }
  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    validateAndSet(e.dataTransfer.files[0])
  }

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return
    validateAndSet(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setStatus('Uploading prescription...')
    setError('')

    try {
      // Step 1: Convert file to base64
      const base64 = await fileToBase64(file)

      // Step 2: Create prescription object
      const prescription = {
        id: generateId('presc'),
        fileName: file.name,
        fileUrl: base64,
        fileType: file.type.startsWith('image/') ? 'image' : 'pdf',
        uploadDate: new Date().toISOString(),
        doctorName: '',
        patientName: '',
        medicines: [],
        rawText: '',
        status: 'pending',
        processedDate: ''
      }

      // Step 3: Save prescription
      prescriptionStorage.add(prescription)
      setStatus('Prescription uploaded! Starting OCR...')

      // Step 4: Extract text using OCR
      setProcessing(true)
      const ocrResult = await extractTextFromImage(base64, (progress) => {
        setOcrProgress(Math.round(progress * 100))
      })

      if (!ocrResult.success) {
        throw new Error('OCR failed: ' + ocrResult.error)
      }

      setExtractedText(ocrResult.text)
      setStatus('Text extracted! Validating prescription...')

      // Step 5: Validate if it's a prescription
      const validation = await validatePrescription(ocrResult.text)
      
      if (!validation.isPrescription) {
        setError(`❌ This doesn't appear to be a medical prescription. ${validation.reason}`)
        setStatus('Validation failed')
        prescriptionStorage.update(prescription.id, {
          rawText: ocrResult.text,
          status: 'error'
        })
        setUploading(false)
        setProcessing(false)
        return
      }

      setStatus('✅ Valid prescription! Analyzing with AI...')

      // Step 6: Update prescription with OCR text
      prescriptionStorage.update(prescription.id, {
        rawText: ocrResult.text,
        status: 'processing'
      })

      // Step 7: Extract medicines using Gemini AI
      const aiResult = await extractMedicinesFromText(ocrResult.text)

      if (!aiResult.success || aiResult.medicines.length === 0) {
        // Still save as processed even if no medicines found
        prescriptionStorage.update(prescription.id, {
          status: 'processed',
          processedDate: new Date().toISOString()
        })
        setStatus('Processing complete! No medicines detected.')
        setUploading(false)
        setProcessing(false)
        return
      }

      setExtractedMedicines(aiResult.medicines)
      setStatus('Medicines extracted! Saving...')

      // Step 8: Save extracted medicines and create reminders
      aiResult.medicines.forEach((med) => {
        const medication = {
          id: generateId('med'),
          name: med.name,
          genericName: med.genericName || med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instructions: med.instructions,
          category: med.category || 'other',
          explanation: med.explanation || 'No explanation available',
          prescriptionId: prescription.id,
          startDate: new Date().toISOString(),
          endDate: calculateEndDate(new Date(), med.duration),
          isActive: true,
          refillReminder: false
        }
        medicationStorage.add(medication)
        
        // Automatically create reminders for this medication
        createRemindersForMedication(medication)
      })

      // Step 9: Update prescription status
      prescriptionStorage.update(prescription.id, {
        medicines: aiResult.medicines,
        status: 'processed',
        processedDate: new Date().toISOString()
      })

      // Step 10: Check for drug interactions
      setStatus('Checking for drug interactions...')
      const allActiveMeds = medicationStorage.getActive()
      if (allActiveMeds.length >= 2) {
        const interactionResult = await checkMedicationInteractions(allActiveMeds)
        if (interactionResult.success && interactionResult.interactions.length > 0) {
          setInteractionWarnings(interactionResult.interactions)
        }
      }

      setStatus('✅ Success! Prescription processed and medicines added.')
      
      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete(prescription)
      }

      // Reset after 2 seconds
      setTimeout(() => {
        resetForm()
      }, 2000)

    } catch (error) {
      console.error('Upload error:', error)
      setError(error.message || 'Something went wrong. Please try again.')
      setStatus('❌ Error occurred')
    } finally {
      setUploading(false)
      setProcessing(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setPreview(null)
    setExtractedText('')
    setExtractedMedicines([])
    setInteractionWarnings([])
    setStatus('')
    setOcrProgress(0)
  }

  const calculateEndDate = (startDate, duration) => {
    const start = new Date(startDate)
    const durationLower = duration.toLowerCase()
    
    let days = 0
    if (durationLower.includes('day')) {
      days = parseInt(durationLower)
    } else if (durationLower.includes('week')) {
      days = parseInt(durationLower) * 7
    } else if (durationLower.includes('month')) {
      days = parseInt(durationLower) * 30
    }
    
    start.setDate(start.getDate() + days)
    return start.toISOString()
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="card">
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Upload Prescription
        </h3>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragging ? 'border-primary-500 bg-primary-50 scale-[1.02]' : darkMode ? 'border-gray-600 hover:border-primary-500' : 'border-gray-300 hover:border-primary-500'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="prescription-upload"
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading || processing}
          />
          
          <label
            htmlFor="prescription-upload"
            className="cursor-pointer block"
          >
            <Upload className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <p className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Click to upload or drag and drop
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              JPG, PNG or PDF (Max 10MB)
            </p>
            <p className={`text-xs mt-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              ⚠️ Only medical prescriptions will be accepted
            </p>
          </label>
        </div>

        {error && (
          <div className={`mt-4 p-3 border rounded-lg flex items-center ${darkMode ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {file && !uploading && !processing && (
          <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <p className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{file.name}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleUpload}
                className="btn-primary"
              >
                Process Prescription
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      {preview && (
        <div className="card">
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Preview
          </h3>
          <img
            src={preview}
            alt="Prescription preview"
            className={`max-w-full h-auto rounded-lg border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
          />
        </div>
      )}

      {/* Processing Status */}
      {(uploading || processing) && (
        <div className="card">
          <div className="flex items-center space-x-3">
            <Loader className="h-6 w-6 text-primary-600 animate-spin" />
            <div className="flex-1">
              <p className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{status}</p>
              {processing && ocrProgress > 0 && (
                <div className="mt-2">
                  <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${ocrProgress}%` }}
                    />
                  </div>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {ocrProgress}% complete
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Extracted Text */}
      {extractedText && !processing && (
        <div className="card">
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Extracted Text (OCR)
          </h3>
          <div className={`p-4 rounded-lg border max-h-60 overflow-y-auto ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <pre className={`text-sm whitespace-pre-wrap font-mono ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {extractedText}
            </pre>
          </div>
        </div>
      )}

      {/* Extracted Medicines with Explanations */}
      {extractedMedicines.length > 0 && (
        <div className="card">
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
            Extracted Medicines ({extractedMedicines.length})
          </h3>
          <div className="space-y-3">
            {extractedMedicines.map((med, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg ${darkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className={`font-semibold text-lg ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {med.name}
                    </h4>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span className="font-medium">Dosage:</span> {med.dosage} • 
                      <span className="font-medium"> Frequency:</span> {med.frequency} • 
                      <span className="font-medium"> Duration:</span> {med.duration}
                    </p>
                    {med.instructions && (
                      <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="font-medium">Instructions:</span> {med.instructions}
                      </p>
                    )}
                  </div>
                  <span className="badge badge-success">
                    {med.category}
                  </span>
                </div>
                
                {/* Medicine Explanation */}
                {med.explanation && (
                  <div className={`mt-3 p-3 border rounded-lg ${darkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex items-start">
                      <Info className={`h-5 w-5 mr-2 flex-shrink-0 mt-0.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <div>
                        <p className={`text-sm font-semibold mb-1 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                          What this medicine does:
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                          {med.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Message */}
      {status.includes('✅') && (
        <div className={`card border-2 ${darkMode ? 'bg-green-900/30 border-green-600' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className={`font-semibold ${darkMode ? 'text-green-300' : 'text-green-900'}`}>
                Prescription Processed Successfully!
              </p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                {extractedMedicines.length} medicine(s) have been added to your medications with explanations and reminders set automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interaction Warnings */}
      {interactionWarnings.length > 0 && (
        <div className={`card border-2 ${darkMode ? 'bg-orange-900/30 border-orange-600' : 'bg-orange-50 border-orange-300'}`}>
          <div className="flex items-start space-x-3">
            <AlertCircle className={`h-8 w-8 flex-shrink-0 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
            <div className="flex-1">
              <h3 className={`font-semibold mb-2 ${darkMode ? 'text-orange-300' : 'text-orange-900'}`}>
                ⚠️ Drug Interaction Warning Detected!
              </h3>
              <p className={`text-sm mb-3 ${darkMode ? 'text-orange-400' : 'text-orange-800'}`}>
                {interactionWarnings.length} potential interaction(s) found between your medications:
              </p>
              <div className="space-y-2">
                {interactionWarnings.map((interaction, index) => (
                  <div key={index} className={`p-3 border-2 rounded-lg ${darkMode ? 'bg-gray-800 border-orange-700' : 'bg-white border-orange-200'}`}>
                    <p className={`font-semibold text-sm mb-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {interaction.medicine1} + {interaction.medicine2}
                    </p>
                    <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {interaction.description}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                      interaction.severity === 'severe' ? 'bg-red-200 text-red-900' :
                      interaction.severity === 'moderate' ? 'bg-orange-200 text-orange-900' :
                      'bg-yellow-200 text-yellow-900'
                    }`}>
                      {interaction.severity.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
              <p className={`text-sm mt-3 font-semibold ${darkMode ? 'text-orange-300' : 'text-orange-900'}`}>
                📞 Please consult your doctor before taking these medications together!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PrescriptionUpload