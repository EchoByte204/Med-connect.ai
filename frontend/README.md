# MedConnect AI - Frontend

This is the React + Vite frontend for MedConnect AI. It handles the entire user interface, local state management, and direct integration with services like Supabase, Google Gemini API, and Google Places.

## Features
- **Dashboard:** Overview of active medications, today's schedule, and health alerts.
- **Prescription Upload:** Uses Google Gemini to perform OCR and structure data from prescription images.
- **Medication Management:** Add, edit, pause, and delete medications.
- **Reminders:** Schedule and receive browser notifications for medications.
- **Locator Services:** Finding hospitals, pharmacies, and doctors on a localized map.
- **Drug Interactions:** Uses Gemini to identify dangerous medicine combinations.

## Development Setup

### 1. Install Dependencies
Make sure you are in the `frontend` directory, then run:
```bash
npm install
```

### 2. Environment Variables (.env)
You must create a `.env` file in the root of the `frontend` folder with the following variables:

```env
# Gemini AI for OCR & Drug Interactions
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Supabase backend (PostgreSQL database & Authentication)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Payment Integration (Optional for local dev)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Backend Connection
VITE_API_URL=http://localhost:5000

# Google Places API for Hospital/Pharmacy Finders
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

### 3. Run the Development Server
```bash
npm run dev
```

## Build for Production
To generate a production-ready build:
```bash
npm run build
```
The output will be placed in the `dist` directory. We use a `vercel.json` file to safely proxy requests to Google Places avoiding CORS issues when deployed.
