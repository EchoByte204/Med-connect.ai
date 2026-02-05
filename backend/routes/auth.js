/**
 * Authentication Routes
 */

import express from 'express'
import * as authController from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/logout', authController.logout)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password', authController.resetPassword)

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser)
router.put('/profile', authenticate, authController.updateProfile)

export default router
