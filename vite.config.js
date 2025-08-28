import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Provide fallbacks for environment variables with better error handling
const getEnvVar = (key, fallback) => {
  try {
    return process.env[key] || fallback
  } catch (error) {
    console.warn(`Failed to read environment variable ${key}:`, error)
    return fallback
  }
}

const API_TARGET = getEnvVar('VITE_API_TARGET', 'https://trustteams-backend.vercel.app')
const API_BASE_URL = getEnvVar('VITE_API_BASE_URL', 'https://trustteams-backend.vercel.app/api')
const NODE_ENV = getEnvVar('NODE_ENV', 'production')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: NODE_ENV === 'development' ? {
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
    sourcemap: false,
    // Ensure build is optimized for production
    minify: 'terser',
    // Clear output directory
    emptyOutDir: true
  },
  define: {
    // Make environment variables available in the client with proper fallbacks
    'process.env.VITE_API_BASE_URL': JSON.stringify(API_BASE_URL),
    'process.env.VITE_API_TARGET': JSON.stringify(API_TARGET),
    'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
  },
  // Optimize for production
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})
