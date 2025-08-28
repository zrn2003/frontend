import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Provide fallbacks for environment variables
const API_TARGET = process.env.VITE_API_TARGET || 'http://localhost:3001'
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://trustteams-backend.vercel.app/api'

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
  build: {
    // Disable eval for CSP compatibility
    rollupOptions: {
      output: {
        // Use a single bundle to avoid dynamic imports
        manualChunks: undefined,
        // Ensure no eval is used in chunk loading
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Use a different chunking strategy
    chunkSizeWarningLimit: 2000,
    // Ensure no eval is used
    target: 'es2015',
    // Disable source maps in production to avoid eval
    sourcemap: false
  },
  define: {
    // Make environment variables available in the client with proper fallbacks
    'process.env.VITE_API_BASE_URL': JSON.stringify(API_BASE_URL),
    'process.env.VITE_API_TARGET': JSON.stringify(API_TARGET)
  }
})
