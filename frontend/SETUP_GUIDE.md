# MedConnect AI - Complete Setup & Development Guide

## 📖 Table of Contents
1. [Initial Setup](#initial-setup)
2. [Understanding the Project Structure](#project-structure)
3. [How to Start Development](#development)
4. [Building Features Step by Step](#building-features)
5. [Testing Your Changes](#testing)
6. [Deployment](#deployment)

---

## 🚀 Initial Setup

### Step 1: Install Node.js
1. Visit https://nodejs.org/
2. Download and install LTS version (v18 or higher)
3. Verify installation:
```bash
node --version
npm --version
```

### Step 2: Setup the Project
```bash
# Navigate to project directory
cd medconnect-ai

# Install all dependencies
npm install

# This will install:
# - React & React DOM
# - React Router for navigation
# - Tailwind CSS for styling
# - Tesseract.js for OCR
# - Lucide React for icons
# - Date-fns for date handling
# - Vite as build tool
```

### Step 3: Get Your API Key
1. Visit https://console.anthropic.com/
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key

### Step 4: Configure Environment
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your API key
# VITE_ANTHROPIC_API_KEY=your_actual_api_key_here
```

### Step 5: Start Development Server
```bash
npm run dev
```
Your app should open at http://localhost:3000

---

## 📁 Project Structure Explained

### Core Files
```
medconnect-ai/
├── src/
│   ├── main.jsx              # App entry point - renders React app
│   ├── App.jsx               # Main component with routing setup
│   ├── index.css             # Global styles + Tailwind directives
│   │
│   ├── components/           # Reusable UI components
│   │   ├── Layout/
│   │   │   └── Layout.jsx    # Main layout with sidebar & navbar
│   │   └── Notifications/
│   │       └── NotificationBell.jsx  # Notification dropdown
│   │
│   ├── pages/                # Page components for each route
│   │   ├── Dashboard.jsx     # Home page with overview
│   │   ├── Prescriptions.jsx # Prescription management
│   │   ├── Medications.jsx   # Medication tracking
│   │   ├── Reminders.jsx     # Reminder management
│   │   ├── PharmacyFinder.jsx # Pharmacy locator
│   │   └── Settings.jsx      # User settings
│   │
│   ├── models/               # Data structures
│   │   └── dataModels.js     # All data model definitions
│   │
│   └── utils/                # Utility functions
│       ├── storage.js        # LocalStorage CRUD operations
│       └── helpers.js        # Helper functions (dates, formatting, etc)
│
├── index.html                # HTML entry point
├── package.json              # Dependencies & scripts
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind customization
└── README.md                 # Project documentation
```

### Key Concepts

**1. React Components**
- Components are reusable UI pieces
- Written in JSX (JavaScript + HTML-like syntax)
- Example: `<Button>` is a component you can use multiple times

**2. Routing**
- React Router manages different pages
- Each route shows a different component
- Example: `/prescriptions` shows `Prescriptions.jsx`

**3. State Management**
- `useState` hook manages component data
- `useEffect` hook runs code when component loads
- Data persists in LocalStorage

**4. Styling**
- Tailwind CSS utility classes (e.g., `bg-blue-500`, `p-4`)
- Custom components defined in `index.css`
- Responsive design with breakpoints

---

## 💻 Development Workflow

### Understanding the Current State
The project currently has:
✅ **Working**: Layout, Navigation, Dashboard, Basic UI
🚧 **To Build**: OCR, AI Extraction, Medication CRUD, Reminders

### How Data Flows
```
User Action → Component → Storage Utility → LocalStorage → Update UI
```

Example:
```javascript
// User uploads prescription
handleUpload() {
  // 1. Read file
  const file = input.files[0]
  
  // 2. Convert to base64
  const base64 = await fileToBase64(file)
  
  // 3. Create prescription object
  const prescription = {
    id: generateId('presc'),
    fileName: file.name,
    fileUrl: base64,
    uploadDate: new Date().toISOString()
  }
  
  // 4. Save to storage
  prescriptionStorage.add(prescription)
  
  // 5. Update UI
  loadPrescriptions()
}
```

---

## 🔨 Building Features Step by Step

### Phase 2A: Prescription Upload (NEXT TO BUILD)

#### Step 1: Create Upload Component
Create `src/components/Prescriptions/PrescriptionUpload.jsx`:

```javascript
import { useState } from 'react'
import { Upload } from 'lucide-react'
import { fileToBase64, generateId } from '../../utils/helpers'
import { prescriptionStorage } from '../../utils/storage'

const PrescriptionUpload = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Show preview
    const base64 = await fileToBase64(file)
    setPreview(base64)
  }

  const handleUpload = async () => {
    if (!preview) return
    
    setUploading(true)
    
    // Create prescription object
    const prescription = {
      id: generateId('presc'),
      fileName: 'prescription.jpg',
      fileUrl: preview,
      fileType: 'image',
      uploadDate: new Date().toISOString(),
      status: 'pending'
    }
    
    // Save to storage
    prescriptionStorage.add(prescription)
    
    setUploading(false)
    setPreview(null)
    
    // Notify parent
    onUploadComplete(prescription)
  }

  return (
    <div className="card">
      <input 
        type="file" 
        accept="image/*,.pdf"
        onChange={handleFileChange}
        className="input-field"
      />
      
      {preview && (
        <div className="mt-4">
          <img src={preview} alt="Preview" className="max-w-md" />
          <button 
            onClick={handleUpload}
            disabled={uploading}
            className="btn-primary mt-4"
          >
            {uploading ? 'Uploading...' : 'Upload Prescription'}
          </button>
        </div>
      )}
    </div>
  )
}

export default PrescriptionUpload
```

#### Step 2: Update Prescriptions Page
Modify `src/pages/Prescriptions.jsx` to use the upload component.

#### Step 3: Test
1. Start dev server: `npm run dev`
2. Navigate to /prescriptions
3. Upload an image
4. Check if it saves (check browser LocalStorage)

### Phase 2B: OCR Agent

#### Step 1: Install Tesseract (already done)
```bash
npm install tesseract.js
```

#### Step 2: Create OCR Agent
Create `src/agents/ocrAgent.js`:

```javascript
import Tesseract from 'tesseract.js'

export const extractTextFromImage = async (imageUrl) => {
  try {
    const result = await Tesseract.recognize(
      imageUrl,
      'eng',
      {
        logger: (m) => console.log(m) // Progress logs
      }
    )
    
    return {
      success: true,
      text: result.data.text,
      confidence: result.data.confidence
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}
```

#### Step 3: Integrate with Upload
After upload, run OCR:
```javascript
const result = await extractTextFromImage(prescription.fileUrl)
prescriptionStorage.update(prescription.id, {
  rawText: result.text,
  status: 'processed'
})
```

### Phase 2C: AI Extraction Agent

#### Step 1: Create API utility
Create `src/utils/claudeApi.js`:

```javascript
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

export const extractMedicinesFromText = async (text) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Extract medicine information from this prescription text:
        
        ${text}
        
        Return a JSON array with: name, dosage, frequency, duration, instructions.`
      }]
    })
  })
  
  const data = await response.json()
  return JSON.parse(data.content[0].text)
}
```

#### Step 2: Use after OCR
```javascript
const ocrResult = await extractTextFromImage(imageUrl)
const medicines = await extractMedicinesFromText(ocrResult.text)

// Save medicines
medicines.forEach(med => {
  medicationStorage.add({
    id: generateId('med'),
    ...med,
    prescriptionId: prescription.id,
    isActive: true
  })
})
```

---

## 🧪 Testing Your Changes

### Manual Testing Checklist
1. **Upload Feature**
   - [ ] Can upload image
   - [ ] Preview shows correctly
   - [ ] Saves to LocalStorage
   - [ ] Shows in prescriptions list

2. **OCR Feature**
   - [ ] Extracts text from image
   - [ ] Shows extracted text
   - [ ] Handles errors gracefully

3. **AI Extraction**
   - [ ] Parses medicines correctly
   - [ ] Creates medication records
   - [ ] Shows in medications list

### Browser DevTools
1. **Console**: Check for errors
2. **Network**: Check API calls
3. **Application → LocalStorage**: Check saved data

---

## 📦 Building for Production

```bash
# Build optimized version
npm run build

# Preview production build
npm run preview
```

The `dist` folder contains your production-ready app.

---

## 🎯 Development Tips

### 1. Start Small
- Build one feature at a time
- Test before moving to next feature
- Use console.log() to debug

### 2. Use the Components
```javascript
// Good - reuse existing components
import { generateId } from '../utils/helpers'

// Bad - reinvent the wheel
const id = Math.random().toString()
```

### 3. Follow the Pattern
Look at existing code (like Dashboard.jsx) as examples.

### 4. Check Storage
Use browser DevTools → Application → LocalStorage to see your data.

### 5. Hot Reload
Vite automatically reloads when you save files.

---

## 🆘 Getting Help

### Common Errors

**"Cannot find module"**
- Solution: `npm install`

**"Port 3000 already in use"**
- Solution: Change port in `vite.config.js` or kill the process

**"API key invalid"**
- Solution: Check `.env` file, make sure no quotes around key

**"Component not found"**
- Solution: Check import path is correct

---

## 📚 Learning Resources

- **React**: https://react.dev/learn
- **Tailwind**: https://tailwindcss.com/docs
- **Vite**: https://vitejs.dev/guide
- **Claude API**: https://docs.anthropic.com

---

## ✅ Next Steps

1. ✅ Setup complete - you're here!
2. 🔜 Build prescription upload
3. 🔜 Add OCR functionality
4. 🔜 Integrate Claude AI
5. 🔜 Complete medication management
6. 🔜 Add reminder system

---

**Remember**: Build incrementally, test often, and don't hesitate to check the existing code for examples!

Good luck with your major project! 🚀
