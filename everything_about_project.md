# MedConnect AI - Everything About the Project

## 🌟 Overview
MedConnect AI is an intelligent, agentic medical dashboard designed to streamline healthcare management for users. It leverages AI to handle prescriptions, track medications, provide smart reminders, and compare pharmacy prices across vendors.

---

## 🏗️ Architecture
The project is structured as a monorepo containing both the frontend and backend applications.

- **Frontend**: A modern React application built with Vite and Tailwind CSS.
- **Backend**: A Node.js/Express REST API serving as the foundation for data persistence and external integrations.
- **Database**: PostgreSQL (via Supabase) for secure and scalable data storage.
- **AI Integration**: Powered by Anthropic's Claude API for intelligent task automation (agents).

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **OCR**: Tesseract.js (for client-side prescription processing)
- **State/Routing**: React Router v6
- **Data Persistence**: Browser LocalStorage (for offline-first capability)

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Security**: Helmet, Express Rate Limit, JWT, Bcrypt
- **Database Client**: `@supabase/supabase-js`
- **Payments**: Stripe SDK
- **File Handling**: Multer

---

## 🚀 Key Features

1.  **Prescription Management**:
    - OCR extraction from images/PDFs using Tesseract.js.
    - AI-powered medicine parsing (Extraction Agent).
2.  **Medication Tracking**:
    - Manage active medications, dosages, and frequencies.
    - Automatic expiry and refill tracking.
3.  **Smart Reminders**:
    - Time-based medication alerts.
    - Health tips and motivational reminders.
    - Browser push notifications.
4.  **Pharmacy Price Comparison**:
    - Real-time price checks across multiple stores (Apollo, NetMeds, etc.).
    - Stock availability and location mapping.
5.  **Agentic AI Layer**:
    - **OCR Agent**: Image-to-text conversion.
    - **Extraction Agent**: Structured data parsing (using Claude).
    - **Schedule Agent**: Intelligent reminder scheduling.
    - **Interaction Agent**: Drug-to-drug interaction warnings.
    - **Price Agent**: Best deal finder.

---

## 📁 Directory Structure

```text
Med-connect.ai/
├── backend/                # Express.js API
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── database/           # Schema and DB connection
│   ├── middleware/         # Auth and validation
│   ├── routes/             # API route definitions
│   └── server.js           # Entry point
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── agents/         # AI Agent logic
│   │   ├── components/     # UI Components (Layout, UI kits)
│   │   ├── models/         # Data schemas
│   │   ├── pages/          # Full-page views
│   │   ├── utils/          # Storage and helpers
│   │   ├── App.jsx         # Routing
│   │   └── main.jsx        # Entry point
│   ├── tailwind.config.js  # Styling config
│   └── vite.config.js      # Build config
└── README.md               # Root documentation
```

---

## 🏁 Implementation Status

### ✅ Completed
- Project foundation & boilerplate.
- UI Layout & Dashboard statistics.
- Data models and LocalStorage utilities.
- Authentication API endpoints (Backend).

### 🚧 In Progress
- OCR Agent integration.
- Claude AI extraction logic.
- Medication management CRUD.

### 📋 Planned
- Drug interaction checker.
- Real-time price comparison engine.
- Browser notification system.

---

## 🔐 Security & Setup
- **Environment**: Uses `.env` files for API keys (Claude, Supabase, Stripe).
- **Setup**: Requires Node.js 18+ and an Anthropic API key.
