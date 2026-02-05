/**
 * Interaction Agent - Checks for drug interactions using Gemini AI
 */

import { checkDrugInteractions } from '../utils/geminiApi'
import { alertStorage } from '../utils/storage'
import { generateId } from '../utils/helpers'

/**
 * Check interactions between multiple medications
 * @param {Array} medications - Array of medication objects
 * @returns {Promise} - Interaction results
 */
export const checkMedicationInteractions = async (medications) => {
  if (!medications || medications.length < 2) {
    return {
      success: true,
      interactions: [],
      message: 'Need at least 2 medications to check interactions'
    }
  }

  // Extract medicine names
  const medicineNames = medications.map(med => med.name)
  
  // Call Gemini AI to check interactions
  const result = await checkDrugInteractions(medicineNames)
  
  // Create alerts for severe interactions
  if (result.success && result.interactions.length > 0) {
    result.interactions.forEach(interaction => {
      if (interaction.severity === 'severe' || interaction.severity === 'moderate') {
        createInteractionAlert(interaction)
      }
    })
  }
  
  return result
}

/**
 * Check interaction between two specific medicines
 * @param {Object} medicine1 
 * @param {Object} medicine2 
 * @returns {Promise}
 */
export const checkTwoMedicines = async (medicine1, medicine2) => {
  const result = await checkDrugInteractions([medicine1.name, medicine2.name])
  return result
}

/**
 * Create alert for drug interaction
 */
const createInteractionAlert = (interaction) => {
  alertStorage.add({
    id: generateId('alert'),
    type: 'interaction',
    severity: interaction.severity === 'severe' ? 'danger' : 'warning',
    title: `⚠️ Drug Interaction Warning`,
    message: `${interaction.medicine1} and ${interaction.medicine2}: ${interaction.description}`,
    timestamp: new Date().toISOString(),
    isRead: false,
    actionRequired: true,
    relatedId: null
  })
}

/**
 * Get interaction severity color
 */
export const getInteractionColor = (severity) => {
  const colors = {
    mild: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    moderate: 'bg-orange-50 border-orange-300 text-orange-800',
    severe: 'bg-red-50 border-red-300 text-red-800'
  }
  return colors[severity] || colors.mild
}

/**
 * Get interaction icon
 */
export const getInteractionIcon = (severity) => {
  const icons = {
    mild: '⚠️',
    moderate: '🔶',
    severe: '🚨'
  }
  return icons[severity] || '⚠️'
}

export default {
  checkMedicationInteractions,
  checkTwoMedicines,
  getInteractionColor,
  getInteractionIcon
}