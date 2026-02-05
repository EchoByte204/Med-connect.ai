import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // every request to /api/places/* is rewritten to Google Maps
      // and the key is injected server-side — no CORS issue, key stays hidden
      '/api/places': {
        target: 'https://maps.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/places/, '/maps/api/place'),
        // append the key from the real .env (not .env.example)
        bypass: (req, res, options) => {
          // let vite load the env so we can grab it
          const key = process.env.VITE_GOOGLE_PLACES_API_KEY
          if (key) {
            const sep = req.url.includes('?') ? '&' : '?'
            req.url += `${sep}key=${key}`
          }
        }
      }
    }
  }
})