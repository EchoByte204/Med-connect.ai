/**
 * MedConnect AI - Production Backend Server
 * Main entry point for the API
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

// Security headers
app.use(helmet())

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
    next()
  })
}

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  })
})

// API Routes (we'll add these step by step)
// TODO: Import route modules here
// import authRoutes from './routes/auth.js'
// import prescriptionRoutes from './routes/prescriptions.js'
// import medicationRoutes from './routes/medications.js'
// import reminderRoutes from './routes/reminders.js'
// import appointmentRoutes from './routes/appointments.js'
// import paymentRoutes from './routes/payments.js'

// app.use('/api/auth', authRoutes)
// app.use('/api/prescriptions', prescriptionRoutes)
// app.use('/api/medications', medicationRoutes)
// app.use('/api/reminders', reminderRoutes)
// app.use('/api/appointments', appointmentRoutes)
// app.use('/api/payments', paymentRoutes)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'MedConnect AI Backend API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      prescriptions: '/api/prescriptions',
      medications: '/api/medications',
      reminders: '/api/reminders',
      appointments: '/api/appointments',
      payments: '/api/payments'
    }
  })
})

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} does not exist`,
    timestamp: new Date().toISOString()
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production' ? 'Server Error' : err.name,
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// ═══════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════╗')
  console.log('║     MedConnect AI Backend Server Running      ║')
  console.log('╚════════════════════════════════════════════════╝')
  console.log(``)
  console.log(`🚀 Environment: ${process.env.NODE_ENV}`)
  console.log(`🌐 Server URL:  http://localhost:${PORT}`)
  console.log(`📡 API Base:    http://localhost:${PORT}/api`)
  console.log(`💚 Health:      http://localhost:${PORT}/health`)
  console.log(``)
  console.log(`Press CTRL+C to stop`)
  console.log(``)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing server gracefully')
  process.exit(0)
})

export default app
