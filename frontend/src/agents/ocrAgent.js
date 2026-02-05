/**
 * OCR Agent - Extracts text from prescription images
 * Uses Tesseract.js (runs in browser, no API needed!)
 */

import Tesseract from 'tesseract.js'

/**
 * Extract text from image file or base64
 * @param {string|File} imageSource - Image file or base64 string
 * @param {function} onProgress - Progress callback (optional)
 * @returns {Promise} - Extracted text and confidence
 */
export const extractTextFromImage = async (imageSource, onProgress = null) => {
  try {
    console.log('Starting OCR extraction...')
    
    const result = await Tesseract.recognize(
      imageSource,
      'eng',
      {
        logger: (m) => {
          // Log progress
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
            if (onProgress) {
              onProgress(m.progress)
            }
          }
        }
      }
    )
    
    console.log('OCR completed successfully')
    
    return {
      success: true,
      text: result.data.text,
      confidence: result.data.confidence,
      rawData: result.data
    }
    
  } catch (error) {
    console.error('OCR Error:', error)
    return {
      success: false,
      error: error.message,
      text: '',
      confidence: 0
    }
  }
}

/**
 * Extract text from multiple images
 * @param {Array} imageFiles - Array of image files
 * @param {function} onProgress - Progress callback
 * @returns {Promise} - Array of extraction results
 */
export const extractTextFromMultipleImages = async (imageFiles, onProgress = null) => {
  const results = []
  
  for (let i = 0; i < imageFiles.length; i++) {
    const result = await extractTextFromImage(imageFiles[i], (progress) => {
      if (onProgress) {
        const totalProgress = (i + progress) / imageFiles.length
        onProgress(totalProgress, i + 1, imageFiles.length)
      }
    })
    results.push(result)
  }
  
  return results
}

/**
 * Preprocess image for better OCR results
 * (Simple preprocessing - can be enhanced)
 */
export const preprocessImage = async (imageFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Create canvas for preprocessing
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Set canvas size
        canvas.width = img.width
        canvas.height = img.height
        
        // Draw image
        ctx.drawImage(img, 0, 0)
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        
        // Simple grayscale conversion
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
          data[i] = avg     // R
          data[i + 1] = avg // G
          data[i + 2] = avg // B
        }
        
        // Put processed data back
        ctx.putImageData(imageData, 0, 0)
        
        // Convert to base64
        resolve(canvas.toDataURL('image/png'))
      }
      
      img.onerror = reject
      img.src = e.target.result
    }
    
    reader.onerror = reject
    reader.readAsDataURL(imageFile)
  })
}

/**
 * Clean and normalize extracted text
 */
export const cleanExtractedText = (text) => {
  if (!text) return ''
  
  return text
    .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
    .replace(/\s{2,}/g, ' ')     // Remove excessive spaces
    .trim()
}

export default {
  extractTextFromImage,
  extractTextFromMultipleImages,
  preprocessImage,
  cleanExtractedText
}