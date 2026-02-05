# 🚀 MedConnect AI - Production Backend Setup Guide

## Complete step-by-step guide to deploy your full-fledged medical SaaS

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Setup (Database + Auth)](#step-1-supabase-setup)
3. [Backend Local Setup](#step-2-backend-local-setup)
4. [Stripe Payment Setup](#step-3-stripe-payment-setup)
5. [Deploy to Production](#step-4-deploy-to-production)
6. [Frontend Integration](#step-5-frontend-integration)
7. [Testing & Verification](#step-6-testing)

---

## Prerequisites

### Required Accounts (All FREE to start)
- ✅ [Supabase](https://supabase.com) - Database + Auth
- ✅ [Stripe](https://stripe.com) - Payments
- ✅ [Railway](https://railway.app) - Backend hosting
- ✅ [Vercel](https://vercel.com) - Frontend hosting
- ✅ [GitHub](https://github.com) - Code repository

### Required Software
```bash
node --version  # v18+ required
npm --version   # v9+ required
git --version   # v2+ required
```

---

## Step 1: Supabase Setup (Database + Auth)

### 1.1 Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" → Sign in with GitHub
3. Click "New Project"
4. Fill in:
   - **Name:** `medconnect-ai`
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free (includes 500MB database, 2GB bandwidth)
5. Click "Create new project" (takes 2 minutes)

### 1.2 Run Database Schema
1. In Supabase dashboard → Click **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy entire contents of `/medconnect-backend/database/schema.sql`
4. Paste into SQL editor
5. Click **RUN** (bottom right)
6. Wait for ✅ "Success. No rows returned"

### 1.3 Get API Keys
1. In Supabase dashboard → Click **Settings** → **API**
2. Copy these values:
   ```
   Project URL:        https://xxxxx.supabase.co
   anon/public key:    eyJhbGc...
   service_role key:   eyJhbGc... (click "Reveal" first)
   ```
3. Save these - you'll need them in `.env`

### 1.4 Configure Auth Settings
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Go to **URL Configuration**:
   - **Site URL:** `http://localhost:3000` (for dev)
   - **Redirect URLs:** Add `http://localhost:3000/auth/callback`
4. Save changes

### 1.5 Storage Setup (for prescription uploads)
1. Go to **Storage** → Create new bucket
2. Name: `prescriptions`
3. Public: ❌ No (keep private)
4. Click **Create bucket**
5. Go to **Policies** → Click **New Policy**
6. Select **Insert** → **For authenticated users only**
7. Copy this policy:
   ```sql
   ((bucket_id = 'prescriptions'::text) AND (auth.uid() = owner))
   ```
8. Repeat for **Select**, **Update**, **Delete** operations

---

## Step 2: Backend Local Setup

### 2.1 Install Backend
```bash
cd medconnect-backend
npm install
```

### 2.2 Configure Environment
```bash
cp .env.example .env
nano .env  # or open in your editor
```

Fill in:
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# From Supabase Step 1.3
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

# Generate with: openssl rand -base64 32
JWT_SECRET=your_generated_secret_here

# Your existing Google APIs
GOOGLE_PLACES_API_KEY=AIza...
GOOGLE_GEMINI_API_KEY=AIza...

# Leave blank for now (we'll add Stripe in Step 3)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### 2.3 Test Backend
```bash
npm run dev
```

You should see:
```
╔════════════════════════════════════════════════╗
║     MedConnect AI Backend Server Running      ║
╚════════════════════════════════════════════════╝

🚀 Environment: development
🌐 Server URL:  http://localhost:5000
📡 API Base:    http://localhost:5000/api
💚 Health:      http://localhost:5000/health
```

### 2.4 Test Health Endpoint
Open browser: `http://localhost:5000/health`

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-04T...",
  "environment": "development",
  "version": "1.0.0"
}
```

---

## Step 3: Stripe Payment Setup

### 3.1 Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Click **Sign up**
3. Fill in business details (can use personal for testing)
4. **Important:** Stay in **TEST MODE** (toggle in top-right)

### 3.2 Get API Keys
1. Dashboard → **Developers** → **API keys**
2. Copy:
   ```
   Publishable key: pk_test_...
   Secret key: sk_test_...  (click "Reveal")
   ```
3. Add to backend `.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   ```

### 3.3 Create Products
1. Dashboard → **Products** → **Add product**

**Product 1: Pro Monthly**
- Name: `MedConnect Pro - Monthly`
- Description: `Unlimited prescriptions, AI chatbot, advanced features`
- Pricing: `₹99/month` (or $4.99)
- Click **Save product**
- Copy the **Price ID** (starts with `price_...`) → Add to `.env` as `STRIPE_PRICE_ID_PRO`

**Product 2: Pro Annual** (optional)
- Name: `MedConnect Pro - Annual`
- Pricing: `₹999/year` (save 16%)
- Save and copy Price ID

### 3.4 Setup Webhook (for production)
1. Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://your-backend.railway.app/api/payments/webhook`
4. Events to listen for:
   - `payment_intent.succeeded`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy **Signing secret** (starts with `whsec_...`)
7. Add to backend `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

## Step 4: Deploy to Production

### 4.1 Backend to Railway

#### A. Push to GitHub First
```bash
cd medconnect-backend
git init
git add .
git commit -m "Initial backend"
git remote add origin https://github.com/YOUR_USERNAME/medconnect-backend.git
git push -u origin main
```

#### B. Deploy on Railway
1. Go to [railway.app](https://railway.app)
2. Click **Start a New Project** → **Deploy from GitHub repo**
3. Select `medconnect-backend` repository
4. Click **Add variables** → **Add all from .env**:
   ```
   NODE_ENV=production
   PORT=5000
   SUPABASE_URL=...
   SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_KEY=...
   JWT_SECRET=...
   GOOGLE_PLACES_API_KEY=...
   GOOGLE_GEMINI_API_KEY=...
   STRIPE_SECRET_KEY=...
   STRIPE_WEBHOOK_SECRET=...
   STRIPE_PRICE_ID_PRO=...
   ```
5. Click **Deploy**
6. Wait 2-3 minutes for build
7. Copy your backend URL: `https://medconnect-backend-production.up.railway.app`

#### C. Update Supabase URLs
1. Go back to Supabase → **Authentication** → **URL Configuration**
2. Update:
   - **Site URL:** `https://your-frontend.vercel.app`
   - **Redirect URLs:** Add `https://your-frontend.vercel.app/auth/callback`

### 4.2 Frontend to Vercel

#### A. Update Frontend .env
```bash
cd medconnect-ai
nano .env  # create if doesn't exist
```

Add:
```env
VITE_API_URL=https://your-backend.railway.app
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### B. Update API calls in frontend
Create `/medconnect-ai/src/config/api.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const api = {
  auth: {
    register: `${API_URL}/api/auth/register`,
    login: `${API_URL}/api/auth/login`,
    logout: `${API_URL}/api/auth/logout`,
    me: `${API_URL}/api/auth/me`
  },
  prescriptions: `${API_URL}/api/prescriptions`,
  medications: `${API_URL}/api/medications`,
  reminders: `${API_URL}/api/reminders`,
  appointments: `${API_URL}/api/appointments`
}

export default api
```

#### C. Deploy to Vercel
```bash
npm install -g vercel
cd medconnect-ai
vercel
```

Follow prompts:
- Link to existing project? **N**
- Project name: `medconnect-ai`
- Directory: `./`
- Override settings? **N**

Then:
```bash
vercel --prod
```

Your app is live! 🎉

---

## Step 5: Frontend Integration

### 5.1 Install Supabase Client
```bash
cd medconnect-ai
npm install @supabase/supabase-js
```

### 5.2 Create Auth Context
Create `/medconnect-ai/src/contexts/AuthContext.jsx`:

```javascript
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, metadata) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### 5.3 Create Supabase Config
Create `/medconnect-ai/src/config/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
```

### 5.4 Wrap App with Auth Provider
Update `/medconnect-ai/src/App.jsx`:

```javascript
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
        <Router>
          {/* your existing routes */}
        </Router>
      </DarkModeContext.Provider>
    </AuthProvider>
  )
}
```

### 5.5 Create Login Page
Create `/medconnect-ai/src/pages/Login.jsx`:

```javascript
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
    } else {
      navigate('/')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center">Sign in to MedConnect</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="font-medium text-primary-600 hover:text-primary-500">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}
```

---

## Step 6: Testing & Verification

### 6.1 Test Auth Flow
1. Open `https://your-app.vercel.app/register`
2. Create account
3. Check email for verification
4. Click link → Should redirect to login
5. Login → Should see dashboard

### 6.2 Test Database
1. Go to Supabase → **Table Editor**
2. Click `users` table
3. Should see your user row

### 6.3 Test API Endpoints
```bash
# Health check
curl https://your-backend.railway.app/health

# Register (should work)
curl -X POST https://your-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234","fullName":"Test User"}'

# Login (should work)
curl -X POST https://your-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234"}'
```

### 6.4 Test Payments (Optional)
1. Use Stripe test card: `4242 4242 4242 4242`
2. Expiry: Any future date
3. CVC: Any 3 digits
4. Should create subscription

---

## 🎉 Congratulations!

You now have a **full-fledged production SaaS**:

✅ **Backend API** running on Railway  
✅ **PostgreSQL Database** on Supabase  
✅ **Authentication** with email/password  
✅ **File Storage** for prescriptions  
✅ **Payment Processing** with Stripe  
✅ **Frontend** deployed on Vercel  

---

## 📊 What You Built

| Component | Technology | Cost |
|-----------|-----------|------|
| Frontend | React + Vite + Vercel | FREE |
| Backend | Node.js + Express + Railway | FREE ($5/mo after trial) |
| Database | PostgreSQL + Supabase | FREE (500MB) |
| Auth | Supabase Auth | FREE |
| Storage | Supabase Storage | FREE (1GB) |
| Payments | Stripe | FREE + 2.9% + ₹3 per transaction |
| **Total** | **Complete SaaS** | **~₹400/mo** (~$5) |

---

## 🚀 Next Steps

### Immediate (Week 1)
- [ ] Add remaining API endpoints (prescriptions, medications, etc.)
- [ ] Implement file upload to Supabase Storage
- [ ] Add protected routes in frontend
- [ ] Test all features end-to-end

### Short-term (Month 1)
- [ ] Add email notifications
- [ ] Implement reminder push notifications
- [ ] Add analytics (Plausible/Google Analytics)
- [ ] Create landing page
- [ ] Add pricing page

### Medium-term (Month 2-3)
- [ ] Add doctor/pharmacy accounts
- [ ] Implement real appointment booking
- [ ] Add telemedicine video calls (100ms/Agora)
- [ ] Mobile app (React Native)
- [ ] HIPAA compliance audit

---

## 🆘 Troubleshooting

**"CORS error"**
```javascript
// In backend server.js, update CORS:
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend.vercel.app'],
  credentials: true
}))
```

**"Supabase RLS blocks queries"**
- Check you're passing JWT token in `Authorization: Bearer <token>` header
- Verify RLS policies in Supabase dashboard

**"Railway deployment fails"**
- Check logs: Railway dashboard → Your service → Deployments → View Logs
- Ensure all env vars are set
- Verify Node.js version (needs 18+)

**"Stripe webhook not working"**
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:5000/api/payments/webhook`
- In production, verify webhook URL is publicly accessible

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Stripe Docs](https://stripe.com/docs)
- [React Router](https://reactrouter.com)
- [Express Docs](https://expressjs.com)

---

## 💡 Pro Tips

1. **Start with test mode** - Use Stripe test mode until you have paying users
2. **Monitor costs** - Check Railway/Supabase usage dashboards weekly
3. **Backup database** - Set up automatic backups in Supabase (Settings → Database)
4. **Use environment variables** - NEVER commit API keys to Git
5. **Enable 2FA** - On all accounts (Supabase, Stripe, Railway, GitHub)

---

## 🎓 What You Learned

- ✅ Full-stack architecture (React + Node.js + PostgreSQL)
- ✅ REST API design
- ✅ JWT authentication
- ✅ Database design & migrations
- ✅ Payment processing
- ✅ Cloud deployment
- ✅ Security best practices (RLS, CORS, rate limiting)

---

**You're now ready to launch a real medical SaaS! 🚀**

Need help? Open an issue on GitHub or contact: support@medconnect.ai (replace with your email)
