// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Add each of your backend's top-level routes here
      '/exercises': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/submissions': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/progress': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/me': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})