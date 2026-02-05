/**
 * Authentication Controller
 * Handles user registration, login, password reset
 */

import { supabase, supabaseAdmin } from '../config/supabase.js'

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { email, password, fullName, phone, dateOfBirth } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email and password are required'
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Password must be at least 8 characters'
      })
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone
        }
      }
    })

    if (authError) {
      return res.status(400).json({
        error: 'Registration Failed',
        message: authError.message
      })
    }

    // Create user profile
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        full_name: fullName,
        phone,
        date_of_birth: dateOfBirth || null
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // User is created but profile failed - they can still login
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        fullName
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'Registration failed'
    })
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email and password are required'
      })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return res.status(401).json({
        error: 'Login Failed',
        message: error.message
      })
    }

    // Update last login
    await supabaseAdmin
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.user.id)

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        ...profile
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
        expires_at: data.session.expires_at
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'Login failed'
    })
  }
}

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      await supabaseAdmin.auth.admin.signOut(token)
    }

    res.json({
      success: true,
      message: 'Logout successful'
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'Logout failed'
    })
  }
}

/**
 * Get current user
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.userId)
      .single()

    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        ...profile
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get user'
    })
  }
}

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email is required'
      })
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    })

    if (error) {
      return res.status(400).json({
        error: 'Reset Failed',
        message: error.message
      })
    }

    // Always return success (don't reveal if email exists)
    res.json({
      success: true,
      message: 'If that email exists, a password reset link has been sent'
    })
  } catch (error) {
    console.error('Password reset error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'Password reset failed'
    })
  }
}

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Token and new password are required'
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Password must be at least 8 characters'
      })
    }

    const { error } = await supabase.auth.updateUser({
      password
    })

    if (error) {
      return res.status(400).json({
        error: 'Reset Failed',
        message: error.message
      })
    }

    res.json({
      success: true,
      message: 'Password reset successful'
    })
  } catch (error) {
    console.error('Password reset error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'Password reset failed'
    })
  }
}

/**
 * Update user profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, dateOfBirth, gender, bloodGroup, emergencyContact } = req.body

    const updates = {}
    if (fullName !== undefined) updates.full_name = fullName
    if (phone !== undefined) updates.phone = phone
    if (dateOfBirth !== undefined) updates.date_of_birth = dateOfBirth
    if (gender !== undefined) updates.gender = gender
    if (bloodGroup !== undefined) updates.blood_group = bloodGroup
    if (emergencyContact) {
      if (emergencyContact.name) updates.emergency_contact_name = emergencyContact.name
      if (emergencyContact.phone) updates.emergency_contact_phone = emergencyContact.phone
      if (emergencyContact.relation) updates.emergency_contact_relation = emergencyContact.relation
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', req.userId)
      .select()
      .single()

    if (error) {
      return res.status(400).json({
        error: 'Update Failed',
        message: error.message
      })
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: data
    })
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({
      error: 'Server Error',
      message: 'Profile update failed'
    })
  }
}

export default {
  register,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  updateProfile
}
