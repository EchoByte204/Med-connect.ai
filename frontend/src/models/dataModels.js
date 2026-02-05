/**
 * Data Models for MedConnect AI
 * These define the structure of our main data entities
 */

// Prescription Model
export const PrescriptionModel = {
  id: '', // Unique identifier
  fileName: '', // Original file name
  fileUrl: '', // URL or base64 of uploaded file
  fileType: '', // 'image' or 'pdf'
  uploadDate: '', // ISO date string
  doctorName: '', // Extracted doctor name
  patientName: '', // Extracted patient name
  medicines: [], // Array of Medicine objects
  rawText: '', // Raw OCR text
  status: 'pending', // 'pending' | 'processed' | 'error'
  processedDate: '' // ISO date string
}

// Medicine Model
export const MedicineModel = {
  id: '', // Unique identifier
  name: '', // Medicine name
  genericName: '', // Generic/scientific name
  dosage: '', // e.g., "500mg"
  frequency: '', // e.g., "twice daily", "1-0-1"
  duration: '', // e.g., "7 days", "2 weeks"
  instructions: '', // Special instructions (before/after food, etc.)
  category: '', // 'antibiotic' | 'painkiller' | 'vitamin' | 'other'
  explanation: '', // What this medicine does and treats
  prescriptionId: '', // Reference to prescription
  startDate: '', // ISO date string
  endDate: '', // ISO date string (calculated from duration)
  isActive: true, // Boolean
  refillReminder: false // Boolean
}

// Reminder Model
export const ReminderModel = {
  id: '', // Unique identifier
  medicineId: '', // Reference to medicine
  medicineName: '', // Medicine name (denormalized for easy access)
  dosage: '', // Dosage amount
  time: '', // Time in HH:mm format
  frequency: '', // 'daily' | 'twice-daily' | 'thrice-daily' | 'custom'
  days: [], // Array of day numbers [0-6] for custom frequency
  isActive: true, // Boolean
  lastTaken: '', // ISO date string
  nextReminder: '', // ISO date string
  notificationEnabled: true, // Boolean
  notes: '' // Additional notes
}

// Pharmacy Model
export const PharmacyModel = {
  id: '', // Unique identifier
  name: '', // Pharmacy name
  chain: '', // 'Apollo' | 'Medplus' | 'NetMeds' | 'Local'
  address: '', // Full address
  coordinates: { lat: 0, lng: 0 }, // GPS coordinates
  phone: '', // Contact number
  distance: 0, // Distance in km
  isOpen: true, // Boolean
  operatingHours: '', // e.g., "9 AM - 10 PM"
  rating: 0, // Rating out of 5
  hasDelivery: false // Boolean
}

// Medicine Price Model
export const MedicinePriceModel = {
  id: '', // Unique identifier
  medicineName: '', // Medicine name
  pharmacyId: '', // Reference to pharmacy
  pharmacyName: '', // Pharmacy name (denormalized)
  price: 0, // Price in INR
  inStock: true, // Boolean
  discount: 0, // Discount percentage
  finalPrice: 0, // Price after discount
  lastUpdated: '' // ISO date string
}

// Drug Interaction Model
export const DrugInteractionModel = {
  medicine1: '', // First medicine name
  medicine2: '', // Second medicine name
  severity: '', // 'mild' | 'moderate' | 'severe'
  description: '', // Description of interaction
  recommendation: '' // What to do
}

// Alert Model
export const AlertModel = {
  id: '', // Unique identifier
  type: '', // 'reminder' | 'interaction' | 'expiry' | 'refill' | 'tip'
  severity: '', // 'info' | 'warning' | 'danger'
  title: '', // Alert title
  message: '', // Alert message
  timestamp: '', // ISO date string
  isRead: false, // Boolean
  actionRequired: false, // Boolean
  relatedId: '' // Reference to related entity (medicine, prescription, etc.)
}

// User Preferences Model
export const UserPreferencesModel = {
  notificationsEnabled: true,
  reminderSound: true,
  darkMode: false,
  language: 'en',
  defaultPharmacy: null,
  emergencyContact: {
    name: '',
    phone: '',
    relation: ''
  }
}

// Sample/Mock Data for Testing
export const samplePrescription = {
  id: 'presc_001',
  fileName: 'prescription_sample.jpg',
  fileUrl: '/sample-prescription.jpg',
  fileType: 'image',
  uploadDate: new Date().toISOString(),
  doctorName: 'Dr. Rajesh Kumar',
  patientName: 'Patient Name',
  medicines: [
    {
      id: 'med_001',
      name: 'Amoxicillin',
      genericName: 'Amoxicillin',
      dosage: '500mg',
      frequency: 'thrice daily',
      duration: '7 days',
      instructions: 'Take after food',
      category: 'antibiotic',
      prescriptionId: 'presc_001',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      refillReminder: false
    },
    {
      id: 'med_002',
      name: 'Paracetamol',
      genericName: 'Acetaminophen',
      dosage: '650mg',
      frequency: 'twice daily',
      duration: '5 days',
      instructions: 'Take when needed for fever',
      category: 'painkiller',
      prescriptionId: 'presc_001',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      refillReminder: false
    }
  ],
  rawText: 'Sample OCR extracted text...',
  status: 'processed',
  processedDate: new Date().toISOString()
}

export const samplePharmacies = [
  {
    id: 'pharm_001',
    name: 'Apollo Pharmacy',
    chain: 'Apollo',
    address: 'MG Road, Bengaluru, Karnataka 560001',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    phone: '+91-80-12345678',
    distance: 1.2,
    isOpen: true,
    operatingHours: '8 AM - 11 PM',
    rating: 4.5,
    hasDelivery: true
  },
  {
    id: 'pharm_002',
    name: 'Medplus',
    chain: 'Medplus',
    address: 'Indiranagar, Bengaluru, Karnataka 560038',
    coordinates: { lat: 12.9784, lng: 77.6408 },
    phone: '+91-80-23456789',
    distance: 2.5,
    isOpen: true,
    operatingHours: '9 AM - 10 PM',
    rating: 4.2,
    hasDelivery: true
  },
  {
    id: 'pharm_003',
    name: 'NetMeds Pharmacy',
    chain: 'NetMeds',
    address: 'Koramangala, Bengaluru, Karnataka 560034',
    coordinates: { lat: 12.9352, lng: 77.6245 },
    phone: '+91-80-34567890',
    distance: 3.8,
    isOpen: true,
    operatingHours: '24/7',
    rating: 4.7,
    hasDelivery: true
  }
]