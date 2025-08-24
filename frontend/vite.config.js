// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Proxy all API routes to backend server
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})