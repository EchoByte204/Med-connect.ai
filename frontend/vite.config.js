import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Requests to /api/places/* are forwarded to maps.googleapis.com
      // The API key is already appended by the frontend code in the URL
      '/api/places': {
        target: 'https://maps.googleapis.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/places/, '/maps/api/place'),
      }
    }
  }
})