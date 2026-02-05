/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

import { supabaseAdmin } from '../config/supabase.js'

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header'
      })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      })
    }

    // Attach user to request
    req.user = user
    req.userId = user.id

    next()
  } catch (error) {
    console.error('Authentication error:', error)
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication failed'
    })
  }
}

/**
 * Check if user has active subscription
 */
export const requireSubscription = (tiers = ['pro', 'enterprise']) => {
  return async (req, res, next) => {
    try {
      const { data: userProfile } = await supabaseAdmin
        .from('users')
        .select('subscription_tier, subscription_status, subscription_expires_at')
        .eq('id', req.userId)
        .single()

      if (!userProfile) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'User profile not found'
        })
      }

      // Check if subscription is active
      if (userProfile.subscription_status !== 'active') {
        return res.status(403).json({
          error: 'Subscription Required',
          message: 'This feature requires an active subscription',
          upgradeUrl: '/pricing'
        })
      }

      // Check if subscription tier is sufficient
      if (!tiers.includes(userProfile.subscription_tier)) {
        return res.status(403).json({
          error: 'Upgrade Required',
          message: `This feature requires a ${tiers.join(' or ')} subscription`,
          currentTier: userProfile.subscription_tier,
          upgradeUrl: '/pricing'
        })
      }

      // Check if subscription has expired
      if (userProfile.subscription_expires_at) {
        const expiresAt = new Date(userProfile.subscription_expires_at)
        if (expiresAt < new Date()) {
          return res.status(403).json({
            error: 'Subscription Expired',
            message: 'Your subscription has expired. Please renew to continue.',
            renewUrl: '/pricing'
          })
        }
      }

      req.subscription = userProfile
      next()
    } catch (error) {
      console.error('Subscription check error:', error)
      res.status(500).json({
        error: 'Server Error',
        message: 'Failed to verify subscription'
      })
    }
  }
}

/**
 * Optional authentication - attaches user if token provided
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { data: { user } } = await supabaseAdmin.auth.getUser(token)
      
      if (user) {
        req.user = user
        req.userId = user.id
      }
    }

    next()
  } catch (error) {
    // Continue without authentication
    next()
  }
}

export default { authenticate, requireSubscription, optionalAuth }
