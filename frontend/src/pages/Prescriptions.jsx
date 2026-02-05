import { useState, useEffect } from 'react'
import { FileText, Calendar, Eye, Trash2, Info, Share2, Copy, Check } from 'lucide-react'
import PrescriptionUpload from '../components/Prescriptions/PrescriptionUpload'
import { prescriptionStorage } from '../utils/storage'
import { formatDate, formatDateTime, copyToClipboard } from '../utils/helpers'
import { useDarkMode } from '../App'

const Prescriptions = () => {
  const { darkMode } = useDarkMode()
  const [prescriptions, setPrescriptions] = useState([])
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [showUpload, setShowUpload] = useState(true)
  const [shareModal, setShareModal] = useState(null)
  const [shareCopied, setShareCopied] = useState(false)

  const buildShareText = (p) => {
    let txt = `📋 Prescription — ${p.fileName}\n`
    txt    += `📅 Date: ${formatDateTime(p.uploadDate)}\n`
    txt    += `📊 Status: ${p.status}\n`
    if (p.medicines?.length) {
      txt  += `\n💊 Medicines (${p.medicines.length}):\n`
      p.medicines.forEach((m, i) => {
        txt += `  ${i + 1}. ${m.name}\n`
        txt += `     Dosage: ${m.dosage} | Frequency: ${m.frequency} | Duration: ${m.duration}\n`
        if (m.instructions) txt += `     Instructions: ${m.instructions}\n`
        if (m.explanation)  txt += `     Info: ${m.explanation}\n`
      })
    }
    if (p.rawText) txt += `\n📝 OCR Text:\n${p.rawText}\n`
    txt += `\n— Shared via MedConnect AI`
    return txt
  }

  const handleShare = async () => {
    const ok = await copyToClipboard(buildShareText(shareModal))
    if (ok) { setShareCopied(true); setTimeout(() => setShareCopied(false), 2000) }
  }

  useEffect(() => { loadPrescriptions() }, [])

  const loadPrescriptions = () => {
    setPrescriptions([...prescriptionStorage.getAll()].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)))
  }

  const handleUploadComplete = () => { loadPrescriptions(); setShowUpload(false) }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      prescriptionStorage.delete(id); loadPrescriptions()
      if (selectedPrescription?.id === id) setSelectedPrescription(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Prescriptions</h1>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Upload and manage your medical prescriptions</p>
        </div>
        <button onClick={() => setShowUpload(!showUpload)} className="btn-primary">
          {showUpload ? 'Hide Upload' : 'Upload New Prescription'}
        </button>
      </div>

      {showUpload && <PrescriptionUpload onUploadComplete={handleUploadComplete} />}

      {/* Prescriptions List */}
      <div className="card">
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Your Prescriptions ({prescriptions.length})
        </h2>

        {prescriptions.length === 0 ? (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <FileText className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className="text-lg mb-2">No prescriptions yet</p>
            <p className="text-sm">Upload your first prescription to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className={`p-4 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <FileText className="h-10 w-10 text-primary-600 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold mb-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{prescription.fileName}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className={`flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <Calendar className="h-4 w-4 mr-1" />{formatDate(prescription.uploadDate)}
                        </span>
                        {prescription.medicines?.length > 0 && <span className="badge badge-info">{prescription.medicines.length} medicine(s)</span>}
                        <span className={`badge ${prescription.status === 'processed' ? 'badge-success' : prescription.status === 'processing' ? 'badge-warning' : 'badge-danger'}`}>
                          {prescription.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button onClick={() => setSelectedPrescription(prescription)} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-white'}`}>
                      <Eye className="h-5 w-5 text-primary-600" />
                    </button>
                    <button onClick={() => setShareModal(prescription)} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-white'}`}>
                      <Share2 className="h-5 w-5 text-green-600" />
                    </button>
                    <button onClick={() => handleDelete(prescription.id)} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-white'}`}>
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Prescription Details</h2>
                <button onClick={() => setSelectedPrescription(null)} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}>✕</button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  ['File Name', selectedPrescription.fileName],
                  ['Upload Date', formatDateTime(selectedPrescription.uploadDate)],
                  ['Medicines Found', String(selectedPrescription.medicines?.length || 0)]
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
                    <p className={`font-medium ${darkMode ? 'text-gray-100' : ''}`}>{val}</p>
                  </div>
                ))}
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</p>
                  <span className={`badge ${selectedPrescription.status === 'processed' ? 'badge-success' : 'badge-warning'}`}>{selectedPrescription.status}</span>
                </div>
              </div>

              {selectedPrescription.fileType === 'image' && (
                <div className="mb-6">
                  <h3 className={`font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Image</h3>
                  <img src={selectedPrescription.fileUrl} alt="Prescription" className={`w-full rounded-lg border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`} />
                </div>
              )}

              {selectedPrescription.rawText && (
                <div className="mb-6">
                  <h3 className={`font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Extracted Text (OCR)</h3>
                  <div className={`p-4 rounded-lg border max-h-60 overflow-y-auto ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <pre className={`text-sm whitespace-pre-wrap font-mono ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedPrescription.rawText}</pre>
                  </div>
                </div>
              )}

              {selectedPrescription.medicines?.length > 0 && (
                <div>
                  <h3 className={`font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Medicines ({selectedPrescription.medicines.length})</h3>
                  <div className="space-y-3">
                    {selectedPrescription.medicines.map((med, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`}>
                        <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{med.name}</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[['Dosage', med.dosage], ['Frequency', med.frequency], ['Duration', med.duration], ['Category', med.category]].map(([label, val]) => (
                            <div key={label}>
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{label}:</span>
                              <span className={`ml-2 font-medium ${darkMode ? 'text-gray-200' : ''}`}>{val}</span>
                            </div>
                          ))}
                        </div>
                        {med.instructions && <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}><span className="font-medium">Instructions:</span> {med.instructions}</p>}
                        {med.explanation && (
                          <div className={`mt-3 p-3 rounded-lg border ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                            <div className="flex items-start">
                              <Info className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className={`text-xs font-semibold mb-1 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>What this medicine does:</p>
                                <p className={`text-xs ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>{med.explanation}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`rounded-xl max-w-lg w-full p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className={`text-xl font-bold flex items-center ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}><Share2 className="h-5 w-5 mr-2 text-green-600" />Share Prescription</h2>
              <button onClick={() => { setShareModal(null); setShareCopied(false) }} className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} text-2xl leading-none`}>✕</button>
            </div>
            <div className={`rounded-lg p-4 mb-4 max-h-52 overflow-y-auto border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <pre className={`text-sm whitespace-pre-wrap font-mono ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{buildShareText(shareModal)}</pre>
            </div>
            {shareCopied && (
              <div className="mb-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 animate-slide-in-up">
                <Check className="h-5 w-5 text-green-600" /><p className="text-sm text-green-800 font-semibold">Copied to clipboard!</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={handleShare} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg flex items-center justify-center font-semibold transition-colors">
                <Copy className="h-5 w-5 mr-2" />Copy to Clipboard
              </button>
              <button onClick={() => { setShareModal(null); setShareCopied(false) }} className={`px-5 py-2.5 rounded-lg border-2 font-semibold transition-colors ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Prescriptions