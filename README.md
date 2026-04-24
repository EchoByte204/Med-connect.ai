# MedConnect AI

MedConnect AI is a comprehensive, intelligent healthcare and medication management platform. It uses cutting-edge AI to extract prescription data, manage medication adherence via reminders, analyze complex drug interactions, and help users locate nearby healthcare facilities.

## Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)

## Features
- **AI Prescription Parsing:** Upload a photo of a prescription and MedConnect extracts the medicines, dosages, and instructions instantly using Google Gemini AI.
- **Smart Medication Reminders:** Automated reminders help you track your schedule. Never miss a dose.
- **Drug Interaction Checker:** Built-in AI evaluates your current active medications to check for risky drug-to-drug interactions.
- **Locator Agents:** Find nearby Hospitals, Pharmacies, and Doctors using real-time geolocation via Google Places API.
- **Health Chatbot:** An embedded AI assistant acts as your personal health advisor.
- **Secure Cloud Sync:** Powered by Supabase, ensuring your data is accessible and backed up safely across devices.

## Project Structure
This is a monorepo containing both the frontend application and backend service.

```
medconnect-fullstack/
├── frontend/      # React + Vite application (UI, Agents, Storage)
├── backend/       # Express.js + Node server (auth wrapper, future webhooks)
└── README.md      # This file
```

## Tech Stack
### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Vanilla CSS, Tailwind CSS / UI Libraries (Lucide Icons)
- **Routing:** React Router v6
- **Database / Auth:** Supabase (PostgreSQL, Supabase Auth)
- **AI Integration:** Google Gemini API
- **Location Services:** Google Places API
- **Hosting Engine:** Vercel / Netlify

### Backend
- **Framework:** Node.js with Express
- **Authentication Wrapper:** Supabase Admin
- **Hosting Engine:** Railway

## Prerequisites
- Node.js (v18 or higher recommended)
- `npm` or `yarn`
- A Supabase account (for database)
- Google Cloud account (for Gemini AI and Places API)

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/Med-connect.ai.git
cd Med-connect.ai
```

### 2. Setup Frontend
To run the user interface:
```bash
cd frontend
npm install
npm run dev
```
The React app will typically run on `http://localhost:3000` or `3001`.

### 3. Setup Backend (Optional for current configuration)
The backend handles securely scoped tasks (e.g., payment webhooks, protected endpoints).
```bash
cd backend
npm install
npm run dev
```
The backend server will run on `http://localhost:5000`.

## Environment Variables
Both `frontend` and `backend` directories require their own `.env` files. Please see their respective READMEs for the exact keys required.

- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)
