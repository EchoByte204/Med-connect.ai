# MedConnect AI - Agentic Medical Dashboard

An intelligent medical assistant web application that helps users manage prescriptions, track medications, receive smart reminders, and compare pharmacy prices.

## 🎯 Features

### 1. Prescription Management
- Upload prescription images (JPG, PNG) or PDFs
- Automatic OCR extraction using Tesseract.js
- AI-powered medicine detection and parsing
- Prescription history and file management

### 2. Medication Management
- Track active medications with dosage and frequency
- Automatic reminder scheduling
- Medicine expiry tracking
- Active medications timeline

### 3. Smart Reminders & Alerts
- Time-based medication reminders
- Drug interaction warnings
- Health tip alerts
- Browser push notifications

### 4. Pharmacy Price Comparison
- Real-time price comparison across multiple stores
- Locate nearby pharmacies (Apollo, Medplus, NetMeds)
- Stock availability checking
- Best price recommendations
- Store navigation

### 5. AI Agents
- **OCR Agent**: Extracts text from prescription images using Tesseract.js
- **Extraction Agent**: Parses medicines from prescription text using Claude API
- **Schedule Agent**: Generates reminder schedules automatically
- **Price Agent**: Compares pharmacy prices across stores
- **Interaction Agent**: Detects dangerous drug interactions

## 🛠️ Technology Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **OCR**: Tesseract.js
- **AI**: Anthropic Claude API (Sonnet 4.5)
- **Storage**: Browser LocalStorage
- **Date Handling**: date-fns

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Anthropic API Key** (for AI agents) - Get it from https://console.anthropic.com/

## 🚀 Getting Started

### 1. Clone or Download the Project

```bash
cd medconnect-ai
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- react & react-dom
- react-router-dom
- tesseract.js
- lucide-react
- date-fns
- vite
- tailwindcss
- and other dev dependencies

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

**Important**: Never commit your API key to version control!

### 4. Start the Development Server

```bash
npm run dev
```

The application will open automatically at `http://localhost:3000`

## 📁 Project Structure

```
medconnect-ai/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── Layout/      # Layout components (Navbar, Sidebar)
│   │   └── Notifications/ # Notification components
│   ├── pages/           # Page components (Dashboard, Prescriptions, etc.)
│   ├── models/          # Data models and schemas
│   ├── utils/           # Utility functions
│   │   ├── storage.js   # LocalStorage operations
│   │   └── helpers.js   # Helper functions
│   ├── agents/          # AI agent implementations (to be added)
│   ├── App.jsx          # Main App component with routing
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles + Tailwind
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
└── README.md           # This file
```

## 🎨 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📱 Current Implementation Status

### ✅ Phase 1: Foundation (COMPLETED)
- [x] Project setup with React + Vite
- [x] Tailwind CSS configuration
- [x] Routing setup with React Router
- [x] Layout with navigation and sidebar
- [x] Data models and storage utilities
- [x] Helper functions
- [x] Dashboard page with statistics
- [x] Placeholder pages for all routes

### 🚧 Phase 2: Core Features (IN PROGRESS)
- [ ] Prescription upload component
- [ ] OCR Agent implementation
- [ ] AI Extraction Agent (Claude API)
- [ ] Medication management interface
- [ ] Reminder scheduling system

### 📋 Phase 3: Advanced Features (PLANNED)
- [ ] Drug interaction checker
- [ ] Pharmacy price comparison
- [ ] Browser notifications
- [ ] Pharmacy locator with maps

### 🎨 Phase 4: Polish (PLANNED)
- [ ] UI/UX improvements
- [ ] Testing & bug fixes
- [ ] Performance optimization
- [ ] Documentation

## 💡 Key Concepts

### Data Models
The application uses the following main data structures:
- **Prescription**: Uploaded prescription files with extracted data
- **Medicine**: Individual medications with dosage, frequency, duration
- **Reminder**: Scheduled medication reminders
- **Alert**: System alerts and notifications
- **Pharmacy**: Pharmacy location and information
- **MedicinePrice**: Price information across pharmacies

### Storage System
Data is persisted using browser LocalStorage with dedicated storage utilities:
- `prescriptionStorage` - Manage prescriptions
- `medicationStorage` - Manage medications
- `reminderStorage` - Manage reminders
- `alertStorage` - Manage alerts
- `preferencesStorage` - User preferences

### AI Agents (To be implemented)
The application will use Claude AI for:
1. **OCR Text Extraction** - Reading prescription images
2. **Medicine Parsing** - Extracting structured data from text
3. **Smart Scheduling** - Generating optimal reminder times
4. **Drug Interactions** - Checking for dangerous combinations
5. **Price Intelligence** - Finding best pharmacy prices

## 🔐 Security Notes

- Never commit API keys to version control
- Use environment variables for sensitive data
- Consider implementing user authentication in production
- Validate all user inputs
- Sanitize data before storing

## 🐛 Troubleshooting

### Common Issues

**1. Dependencies won't install**
```bash
rm -rf node_modules package-lock.json
npm install
```

**2. Vite server won't start**
- Check if port 3000 is already in use
- Try changing the port in `vite.config.js`

**3. Tailwind styles not working**
- Ensure PostCSS and Tailwind are properly configured
- Check if `index.css` is imported in `main.jsx`

**4. API calls failing**
- Verify your Anthropic API key is correct
- Check if the key is properly loaded from `.env`
- Ensure you have API credits available

## 📚 Next Steps for Development

1. **Implement OCR Agent** - Start with Tesseract.js integration
2. **Build Upload Component** - Create file upload with preview
3. **Integrate Claude API** - Set up API calls for medicine extraction
4. **Add Medication CRUD** - Complete medication management
5. **Implement Reminders** - Build scheduling and notification system

## 🤝 Contributing

This is a major project. To contribute:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is for educational purposes as a major project.

## 📞 Support

For questions or issues:
- Review the documentation
- Check existing issues
- Create a new issue with details

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Anthropic Claude API](https://docs.anthropic.com)
- [Tesseract.js](https://tesseract.projectnaptha.com)

---

**Built with ❤️ using React, Vite, and Claude AI**
