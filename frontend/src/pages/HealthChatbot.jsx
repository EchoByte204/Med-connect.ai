import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Send, MessageSquare, RotateCcw, Stethoscope } from 'lucide-react'
import { chatHealthQuery } from '../utils/geminiApi'
import { chatHistoryStorage } from '../utils/storage'
import { getSpecialties } from '../data/doctorsData'
import { useDarkMode } from '../App'

/* ── quick-suggestion chips ── */
const SUGGESTIONS = [
  'I have a headache and fever',
  'What does Paracetamol do?',
  'I feel anxious lately',
  'I have skin rash and itching',
  'Tips to stay healthy',
  'My chest feels tight'
]

/* ── specialty → keywords that Gemini might say ── */
const SPECIALTY_KEYWORDS = {
  'Cardiologist':        ['cardiolog', 'heart', 'chest pain', 'cardiac'],
  'General Physician':   ['general physician', 'general doctor', 'gp'],
  'Orthopedic Surgeon':  ['orthopedic', 'orthopaedic', 'bone', 'joint', 'fracture'],
  'Dermatologist':       ['dermatolog', 'skin', 'rash', 'acne', 'eczema'],
  'Pediatrician':        ['pediatric', 'paediatric', 'child doctor'],
  'Gynecologist':        ['gynecolog', 'gynaecolog', 'women', 'menstrual'],
  'Psychiatrist':        ['psychiatr', 'mental health', 'anxiety', 'depression', 'therapy'],
  'ENT Specialist':      ['ent ', 'ear', 'nose', 'throat', 'sinus'],
  'Dentist':             ['dentist', 'dental', 'teeth', 'tooth'],
  'Neurologist':         ['neurolog', 'brain', 'nerve', 'migraine', 'seizure']
}

/**
 * Scan a bot reply for specialty keywords and return the first match (or null).
 */
const detectSpecialty = (text) => {
  const lower = text.toLowerCase()
  for (const [specialty, keywords] of Object.entries(SPECIALTY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return specialty
  }
  return null
}

const HealthChatbot = () => {
  const { darkMode } = useDarkMode()
  const [messages, setMessages]           = useState([])
  const [geminiHistory, setGeminiHistory] = useState([])
  const [input, setInput]                 = useState('')
  const [loading, setLoading]             = useState(false)
  const [initialized, setInitialized]     = useState(false)
  const bottomRef                         = useRef(null)

  /* ── hydrate from localStorage on first mount ── */
  useEffect(() => {
    const saved = chatHistoryStorage.get()
    if (saved.messages.length > 0) {
      setMessages(saved.messages)
      setGeminiHistory(saved.geminiHistory)
      setInitialized(true)
    } else {
      // fresh session — fetch greeting
      sendToGemini(null)
      setInitialized(true)
    }
  }, [])

  /* ── persist whenever messages change ── */
  useEffect(() => {
    if (initialized) chatHistoryStorage.save(messages, geminiHistory)
  }, [messages, geminiHistory, initialized])

  /* ── auto-scroll ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  /* ── core send ── */
  const sendToGemini = async (userText) => {
    setLoading(true)
    let historyToSend = [...geminiHistory]
    if (userText) historyToSend.push({ role: 'user', text: userText })

    const { success, reply } = await chatHealthQuery(historyToSend)

    const updatedHistory = userText
      ? [...historyToSend, { role: 'model', text: reply }]
      : [{ role: 'model', text: reply }]

    setGeminiHistory(updatedHistory)
    setMessages(prev => [
      ...prev,
      { id: Date.now(), role: 'bot', text: success ? reply : 'Sorry, I had trouble connecting. Please try again.', time: now(), detectedSpecialty: success ? detectSpecialty(reply) : null }
    ])
    setLoading(false)
  }

  const handleSend = (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: msg, time: now(), detectedSpecialty: null }])
    setInput('')
    sendToGemini(msg)
  }

  const handleReset = () => {
    setMessages([])
    setGeminiHistory([])
    setInput('')
    chatHistoryStorage.clear()
    setTimeout(() => sendToGemini(null), 200)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-h-[820px] mx-auto w-full">
      {/* Top bar */}
      <div className={`flex items-center justify-between border-b-2 px-5 py-3 rounded-t-xl flex-shrink-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className={`font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>MedConnect Health Assistant</p>
            <p className="text-xs text-green-600 font-medium">● Online — AI Powered</p>
          </div>
        </div>
        <button onClick={handleReset} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'}`} title="Reset conversation">
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>

      {/* Message area */}
      <div className={`flex-1 overflow-y-auto px-4 py-4 space-y-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'bot' && (
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
            )}
            <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`px-4 py-2.5 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-br-sm' : darkMode ? 'bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-sm' : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>

              {/* ── Doctor recommendation card (only on bot messages where specialty detected) ── */}
              {msg.role === 'bot' && msg.detectedSpecialty && (
                <Link
                  to={`/doctors?specialty=${encodeURIComponent(msg.detectedSpecialty)}`}
                  className={`mt-2 ml-0 w-full max-w-[260px] border rounded-xl px-3 py-2.5 flex items-center gap-2.5 transition-colors shadow-sm ${darkMode ? 'bg-primary-900/40 border-primary-700 hover:bg-primary-900/60' : 'bg-primary-50 border-primary-200 hover:bg-primary-100'}`}
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className={`text-xs font-bold ${darkMode ? 'text-primary-300' : 'text-primary-800'}`}>See {msg.detectedSpecialty}s near you →</p>
                    <p className={`text-xs ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}>Browse our doctor directory</p>
                  </div>
                </Link>
              )}

              <p className="text-xs text-gray-400 mt-1 px-1">{msg.time}</p>
            </div>
          </div>
        ))}

        {/* typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <div className={`rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ animationDelay: '0ms' }} />
                <span className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ animationDelay: '150ms' }} />
                <span className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestion chips */}
      <div className={`border-t px-4 pt-3 pb-1 flex flex-wrap gap-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => handleSend(s)} disabled={loading}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors disabled:opacity-40 ${darkMode ? 'bg-primary-900/40 text-primary-300 border-primary-700 hover:bg-primary-900/60' : 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className={`border-t-2 px-4 py-3 flex items-center gap-3 rounded-b-xl flex-shrink-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your symptoms or question…" disabled={loading}
          className={`flex-1 px-4 py-2.5 rounded-xl border-2 focus:outline-none text-sm disabled:opacity-50 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-primary-500' : 'border-gray-200 focus:border-primary-400'}`} />
        <button onClick={() => handleSend()} disabled={loading || !input.trim()}
          className="bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white w-11 h-11 rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
          <Send className="h-5 w-5" />
        </button>
      </div>

      {/* Disclaimer */}
      <p className={`text-center text-xs py-2 rounded-b-xl ${darkMode ? 'text-gray-500 bg-gray-800' : 'text-gray-400 bg-white'}`}>
        ⚕️ This chatbot is for informational purposes only. Please consult a real doctor for medical advice.
      </p>
    </div>
  )
}

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export default HealthChatbot