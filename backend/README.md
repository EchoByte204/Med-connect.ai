# MedConnect AI - Backend

This is the Express.js Node backend for MedConnect AI. 
Currently, the frontend interacts directly with Supabase for data operations, so this backend serves as a secure environment for tasks that should not be handled in the browser.

## Responsibilities
- **Secure Authentication Wrappers:** Validating Supabase tokens safely.
- **Payment Processing:** Integrating Stripe for subscription models (webhooks and secret key interactions).
- **Future Integration:** Server-side file processing, email delivery, and advanced API proxies.

## Development Setup

### 1. Install Dependencies
Make sure you are in the `backend` directory, then run:
```bash
npm install
```

### 2. Environment Variables (.env)
You must create a `.env` file in the root of the `backend` folder with the following variables:

```env
# Server Port
PORT=5000

# Client origin for CORS
CLIENT_URL=http://localhost:3000

# Supabase Admin Connection
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Payment Integration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Places API (If you decide to proxy from the backend instead of Vite)
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

### 3. Run the Development Server
```bash
# Starts server with nodemon for auto-reload
npm run dev

# Or run it standardly
npm start
```
The server will run on the port specified in your `.env` file (defaults to `5000`).

## Deployment
This backend is configured to be easily deployable on **Railway**. Ensure you inject all the `.env` variables into the Railway project settings before deploying.
