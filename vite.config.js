import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_TARGET = process.env.VITE_API_TARGET || 'http://localhost:3001'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: process.env.NODE_ENV === 'development' ? {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        secure: false
      }
    } : undefined
  },
  define: {
    // Make environment variables available in the client
    'process.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL)
  }
})
