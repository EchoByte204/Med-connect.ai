/**
 * Gemini API Integration
 * Free tier: 15 requests per minute, 1,500 requests per day
 * Perfect for student projects!
 * Get your free API key: https://makersuite.google.com/app/apikey
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-lite:generateContent";

/**
 * Validate if the text is from a medical prescription
 */
export const validatePrescription = async (text) => {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze if this text is from a medical prescription. Look for:
- Medicine names
- Dosage information
- Doctor's prescription format
- Medical terminology

Text to analyze:
${text}

Return ONLY a JSON object:
{
  "isPrescription": true/false,
  "reason": "brief explanation why it is or isn't a prescription"
}

Return ONLY the JSON, no additional text.`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 200,
        }
      })
    })

    if (!response.ok) {
      throw new Error('Validation failed')
    }

    const data = await response.json()
    const generatedText = data.candidates[0].content.parts[0].text
    const cleanedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(cleanedText)
    
    return {
      success: true,
      isPrescription: result.isPrescription,
      reason: result.reason
    }

  } catch (error) {
    console.error('Error validating prescription:', error)
    // If validation fails, assume it's valid to not block the user
    return {
      success: true,
      isPrescription: true,
      reason: 'Validation check failed, proceeding anyway'
    }
  }
}

/**
 * Extract medicines from prescription text using Gemini
 */
export const extractMedicinesFromText = async (text) => {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a medical prescription analyzer. Extract medicine information from this prescription text and return ONLY a valid JSON array.

Prescription Text:
${text}

Return a JSON array where each medicine has:
- name: string (medicine name)
- genericName: string (generic/scientific name if mentioned, else same as name)
- dosage: string (e.g., "500mg", "10ml")
- frequency: string (e.g., "twice daily", "1-0-1", "thrice daily")
- duration: string (e.g., "7 days", "2 weeks", "1 month")
- instructions: string (e.g., "after food", "before sleep", "empty stomach")
- category: string (one of: "antibiotic", "painkiller", "vitamin", "antacid", "other")
- explanation: string (brief 1-2 sentence explanation of what this medicine does and what it treats)

Example output:
[
  {
    "name": "Amoxicillin",
    "genericName": "Amoxicillin",
    "dosage": "500mg",
    "frequency": "thrice daily",
    "duration": "7 days",
    "instructions": "Take after food",
    "category": "antibiotic",
    "explanation": "An antibiotic used to treat bacterial infections such as respiratory infections, ear infections, and urinary tract infections. It works by stopping the growth of bacteria."
  }
]

Return ONLY the JSON array, no additional text.`
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Gemini API error: ${errorData.error?.message || response.status}`)
    }

    const data = await response.json()
    const generatedText = data.candidates[0].content.parts[0].text
    
    // Remove markdown code blocks if present
    const cleanedText = generatedText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    
    const medicines = JSON.parse(cleanedText)
    
    return {
      success: true,
      medicines: medicines,
      rawResponse: generatedText
    }

  } catch (error) {
    console.error('Error extracting medicines:', error)
    return {
      success: false,
      error: error.message,
      medicines: []
    }
  }
}

/**
 * Check for drug interactions using Gemini
 */
export const checkDrugInteractions = async (medicines) => {
  try {
    const medicineList = medicines.join(', ')
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze these medicines for potential drug interactions:

Medicines: ${medicineList}

Return ONLY a valid JSON array of interactions. If no interactions, return empty array [].

Format:
[
  {
    "medicine1": "Medicine A",
    "medicine2": "Medicine B",
    "severity": "mild" | "moderate" | "severe",
    "description": "Brief description",
    "recommendation": "What to do"
  }
]

Return ONLY the JSON array.`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const generatedText = data.candidates[0].content.parts[0].text
    
    const cleanedText = generatedText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    
    const interactions = JSON.parse(cleanedText)
    
    return {
      success: true,
      interactions: interactions
    }

  } catch (error) {
    console.error('Error checking interactions:', error)
    return {
      success: false,
      error: error.message,
      interactions: []
    }
  }
}

/**
 * Generate health tip using Gemini
 */
export const generateHealthTip = async (context = 'general') => {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate a helpful health tip related to: ${context}

Requirements:
- 1-2 sentences maximum
- Practical and actionable
- Safe and evidence-based

Return only the tip text.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const tip = data.candidates[0].content.parts[0].text.trim()
    
    return {
      success: true,
      tip: tip
    }

  } catch (error) {
    console.error('Error generating health tip:', error)
    return {
      success: false,
      tip: 'Stay hydrated and maintain a healthy lifestyle!'
    }
  }
}

/**
 * Health Chatbot — multi-turn conversation
 * @param {Array} history - array of { role: 'user'|'model', text: string }
 * @returns {Promise<{success, reply}>}
 */
export const chatHealthQuery = async (history) => {
  try {
    // Build Gemini contents array from our history
    const contents = history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }))

    // Prepend a system-style instruction as the very first user turn (if not already there)
    if (contents.length === 0 || !contents[0].parts[0].text.startsWith('You are MedConnect')) {
      contents.unshift({
        role: 'user',
        parts: [{
          text: `You are MedConnect Health Assistant, an AI health chatbot inside the MedConnect AI app.

Your job:
1. Listen to the user's symptoms and ask follow-up questions to understand better.
2. Based on symptoms, suggest which medical specialty or type of doctor they should consult (e.g. Cardiologist, Dermatologist, General Physician).
3. Give general health tips and lifestyle advice.
4. Help users understand their medicines if they ask.
5. Answer common health questions simply and clearly.

IMPORTANT RULES:
- You are NOT a replacement for a real doctor. Always remind users to consult a professional for serious issues.
- Never diagnose a disease directly. Say "this could indicate…" and recommend seeing a doctor.
- Keep answers short, friendly and easy to understand.
- If symptoms sound like an emergency (chest pain, difficulty breathing, seizure, heavy bleeding), immediately tell the user to call 112 or go to the nearest emergency room.
- Ask one question at a time when gathering symptom info.

Start by greeting the user warmly and asking how you can help.`
        }]
      })
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 512
        }
      })
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || `Status ${response.status}`)
    }

    const data = await response.json()
    const reply = data.candidates[0].content.parts[0].text.trim()

    return { success: true, reply }
  } catch (error) {
    console.error('chatHealthQuery error:', error)
    return {
      success: false,
      reply: 'Sorry, I had trouble connecting. Please try again in a moment.'
    }
  }
}

export default {
  extractMedicinesFromText,
  checkDrugInteractions,
  generateHealthTip,
  chatHealthQuery
}