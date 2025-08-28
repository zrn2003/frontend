import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_TARGET = import.meta.env.VITE_API_TARGET || 'http://localhost:3001'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: import.meta.env.MODE === 'development' ? {
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
    // Make environment variables available in the client
    'process.env.VITE_API_BASE_URL': JSON.stringify(import.meta.env.VITE_API_BASE_URL)
  }
})
