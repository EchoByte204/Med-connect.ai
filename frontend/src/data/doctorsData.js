/**
 * Doctors Database
 * Sample doctors with Indian names, specialties, and consultation fees
 */

export const doctorsData = [
  // Cardiologists
  {
    id: 'doc_001',
    name: 'Dr. Rajesh Kumar',
    specialty: 'Cardiologist',
    qualifications: 'MBBS, MD (Cardiology), DM',
    experience: 15,
    hospital: 'Apollo Hospital, Bengaluru',
    consultationFee: 800,
    phone: '+91-80-4567-8901',
    languages: ['English', 'Hindi', 'Kannada'],
    availability: 'Mon-Sat: 10 AM - 6 PM',
    rating: 4.8,
    totalRatings: 250,
    expertise: [
      'Heart Disease',
      'Hypertension',
      'Angioplasty',
      'Cardiac Surgery',
      'ECG & Echo'
    ],
    about: 'Specialized in treating heart diseases, hypertension, and cardiac emergencies. 15+ years of experience in interventional cardiology.'
  },
  {
    id: 'doc_002',
    name: 'Dr. Priya Sharma',
    specialty: 'Cardiologist',
    qualifications: 'MBBS, MD, DM (Cardiology)',
    experience: 12,
    hospital: 'Fortis Hospital, Bengaluru',
    consultationFee: 700,
    phone: '+91-80-4567-8902',
    languages: ['English', 'Hindi'],
    availability: 'Mon-Fri: 2 PM - 8 PM',
    rating: 4.7,
    totalRatings: 180,
    expertise: [
      'Preventive Cardiology',
      'Heart Failure',
      'Arrhythmia',
      'Women\'s Heart Health'
    ],
    about: 'Expert in preventive cardiology and women\'s heart health. Focus on lifestyle management and heart disease prevention.'
  },

  // General Physicians
  {
    id: 'doc_003',
    name: 'Dr. Amit Patel',
    specialty: 'General Physician',
    qualifications: 'MBBS, MD (Medicine)',
    experience: 10,
    hospital: 'Manipal Hospital, Bengaluru',
    consultationFee: 500,
    phone: '+91-80-4567-8903',
    languages: ['English', 'Hindi', 'Gujarati'],
    availability: 'Mon-Sat: 9 AM - 5 PM',
    rating: 4.6,
    totalRatings: 320,
    expertise: [
      'Fever & Infections',
      'Diabetes Management',
      'Hypertension',
      'General Health',
      'Preventive Care'
    ],
    about: 'General physician with expertise in managing common ailments, diabetes, and hypertension. Provides comprehensive primary care.'
  },
  {
    id: 'doc_004',
    name: 'Dr. Sunita Reddy',
    specialty: 'General Physician',
    qualifications: 'MBBS, MD',
    experience: 8,
    hospital: 'Columbia Asia Hospital, Bengaluru',
    consultationFee: 450,
    phone: '+91-80-4567-8904',
    languages: ['English', 'Hindi', 'Telugu'],
    availability: 'Mon-Sat: 10 AM - 7 PM',
    rating: 4.5,
    totalRatings: 200,
    expertise: [
      'Family Medicine',
      'Women\'s Health',
      'Lifestyle Diseases',
      'Vaccination'
    ],
    about: 'Family physician specializing in holistic care for all age groups. Expert in managing lifestyle diseases.'
  },

  // Orthopedic Surgeons
  {
    id: 'doc_005',
    name: 'Dr. Vikram Singh',
    specialty: 'Orthopedic Surgeon',
    qualifications: 'MBBS, MS (Ortho), DNB',
    experience: 18,
    hospital: 'Sakra World Hospital, Bengaluru',
    consultationFee: 900,
    phone: '+91-80-4567-8905',
    languages: ['English', 'Hindi', 'Punjabi'],
    availability: 'Mon-Fri: 11 AM - 4 PM',
    rating: 4.9,
    totalRatings: 280,
    expertise: [
      'Joint Replacement',
      'Sports Injuries',
      'Spine Surgery',
      'Arthroscopy',
      'Fracture Treatment'
    ],
    about: 'Senior orthopedic surgeon specializing in joint replacement and sports medicine. 18+ years of surgical experience.'
  },

  // Dermatologists
  {
    id: 'doc_006',
    name: 'Dr. Kavita Menon',
    specialty: 'Dermatologist',
    qualifications: 'MBBS, MD (Dermatology)',
    experience: 12,
    hospital: 'Narayana Health, Bengaluru',
    consultationFee: 600,
    phone: '+91-80-4567-8906',
    languages: ['English', 'Hindi', 'Malayalam'],
    availability: 'Tue-Sun: 10 AM - 6 PM',
    rating: 4.7,
    totalRatings: 310,
    expertise: [
      'Acne Treatment',
      'Skin Allergies',
      'Hair Fall',
      'Cosmetic Dermatology',
      'Laser Treatments'
    ],
    about: 'Expert dermatologist for skin, hair, and nail problems. Specializes in cosmetic dermatology and laser treatments.'
  },

  // Pediatricians
  {
    id: 'doc_007',
    name: 'Dr. Ramesh Iyer',
    specialty: 'Pediatrician',
    qualifications: 'MBBS, MD (Pediatrics), DCH',
    experience: 20,
    hospital: 'Rainbow Children\'s Hospital, Bengaluru',
    consultationFee: 550,
    phone: '+91-80-4567-8907',
    languages: ['English', 'Hindi', 'Tamil'],
    availability: 'Mon-Sat: 9 AM - 8 PM',
    rating: 4.9,
    totalRatings: 420,
    expertise: [
      'Child Healthcare',
      'Vaccination',
      'Growth & Development',
      'Newborn Care',
      'Pediatric Infections'
    ],
    about: 'Experienced pediatrician with 20+ years of practice. Expert in child healthcare and development monitoring.'
  },

  // Gynecologists
  {
    id: 'doc_008',
    name: 'Dr. Anjali Desai',
    specialty: 'Gynecologist',
    qualifications: 'MBBS, MS (OBG)',
    experience: 14,
    hospital: 'Cloudnine Hospital, Bengaluru',
    consultationFee: 750,
    phone: '+91-80-4567-8908',
    languages: ['English', 'Hindi', 'Marathi'],
    availability: 'Mon-Sat: 10 AM - 5 PM',
    rating: 4.8,
    totalRatings: 290,
    expertise: [
      'Pregnancy Care',
      'High-Risk Pregnancy',
      'Gynec Surgery',
      'Infertility',
      'Menstrual Disorders'
    ],
    about: 'Obstetrician and gynecologist specializing in pregnancy care and women\'s health. Expert in handling high-risk pregnancies.'
  },

  // Psychiatrists
  {
    id: 'doc_009',
    name: 'Dr. Arjun Malhotra',
    specialty: 'Psychiatrist',
    qualifications: 'MBBS, MD (Psychiatry)',
    experience: 10,
    hospital: 'NIMHANS, Bengaluru',
    consultationFee: 800,
    phone: '+91-80-4567-8909',
    languages: ['English', 'Hindi'],
    availability: 'Mon-Fri: 3 PM - 9 PM',
    rating: 4.7,
    totalRatings: 150,
    expertise: [
      'Depression',
      'Anxiety Disorders',
      'Stress Management',
      'Bipolar Disorder',
      'Counseling'
    ],
    about: 'Mental health specialist providing therapy and counseling for depression, anxiety, and stress-related disorders.'
  },

  // ENT Specialists
  {
    id: 'doc_010',
    name: 'Dr. Lakshmi Narayan',
    specialty: 'ENT Specialist',
    qualifications: 'MBBS, MS (ENT)',
    experience: 16,
    hospital: 'Sagar Hospitals, Bengaluru',
    consultationFee: 650,
    phone: '+91-80-4567-8910',
    languages: ['English', 'Hindi', 'Kannada'],
    availability: 'Mon-Sat: 11 AM - 6 PM',
    rating: 4.6,
    totalRatings: 190,
    expertise: [
      'Ear Problems',
      'Sinus Treatment',
      'Throat Infections',
      'Hearing Loss',
      'Voice Disorders'
    ],
    about: 'ENT surgeon with expertise in treating ear, nose, and throat disorders. Specializes in endoscopic sinus surgery.'
  },

  // Dentists
  {
    id: 'doc_011',
    name: 'Dr. Neha Kapoor',
    specialty: 'Dentist',
    qualifications: 'BDS, MDS (Prosthodontics)',
    experience: 9,
    hospital: 'Smile Dental Clinic, Bengaluru',
    consultationFee: 400,
    phone: '+91-80-4567-8911',
    languages: ['English', 'Hindi'],
    availability: 'Mon-Sat: 10 AM - 7 PM',
    rating: 4.8,
    totalRatings: 240,
    expertise: [
      'Dental Implants',
      'Root Canal',
      'Teeth Whitening',
      'Braces',
      'Cosmetic Dentistry'
    ],
    about: 'Cosmetic and restorative dentist. Expert in dental implants, smile designing, and advanced dental procedures.'
  },

  // Neurologists
  {
    id: 'doc_012',
    name: 'Dr. Sanjay Gupta',
    specialty: 'Neurologist',
    qualifications: 'MBBS, MD, DM (Neurology)',
    experience: 17,
    hospital: 'BGS Gleneagles Hospital, Bengaluru',
    consultationFee: 1000,
    phone: '+91-80-4567-8912',
    languages: ['English', 'Hindi'],
    availability: 'Mon-Fri: 12 PM - 5 PM',
    rating: 4.9,
    totalRatings: 210,
    expertise: [
      'Stroke Management',
      'Epilepsy',
      'Parkinson\'s Disease',
      'Migraine',
      'Nerve Disorders'
    ],
    about: 'Senior neurologist with expertise in stroke, epilepsy, and movement disorders. 17+ years of clinical experience.'
  }
]

/**
 * Get all specialties
 */
export const getSpecialties = () => {
  const specialties = [...new Set(doctorsData.map(doc => doc.specialty))]
  return specialties.sort()
}

/**
 * Filter doctors by specialty
 */
export const getDoctorsBySpecialty = (specialty) => {
  if (!specialty || specialty === 'All') return doctorsData
  return doctorsData.filter(doc => doc.specialty === specialty)
}

/**
 * Search doctors by name or specialty
 */
export const searchDoctors = (query) => {
  const lowercaseQuery = query.toLowerCase()
  return doctorsData.filter(doc => 
    doc.name.toLowerCase().includes(lowercaseQuery) ||
    doc.specialty.toLowerCase().includes(lowercaseQuery) ||
    doc.expertise.some(exp => exp.toLowerCase().includes(lowercaseQuery))
  )
}

/**
 * Get doctor by ID
 */
export const getDoctorById = (id) => {
  return doctorsData.find(doc => doc.id === id)
}

/**
 * Sort doctors by fee
 */
export const sortDoctorsByFee = (doctors, ascending = true) => {
  return [...doctors].sort((a, b) => 
    ascending ? a.consultationFee - b.consultationFee : b.consultationFee - a.consultationFee
  )
}

/**
 * Sort doctors by rating
 */
export const sortDoctorsByRating = (doctors) => {
  return [...doctors].sort((a, b) => b.rating - a.rating)
}

export default {
  doctorsData,
  getSpecialties,
  getDoctorsBySpecialty,
  searchDoctors,
  getDoctorById,
  sortDoctorsByFee,
  sortDoctorsByRating
}