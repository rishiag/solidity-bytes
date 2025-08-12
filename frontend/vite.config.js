import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, '')
      },
      '/exercises': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true
      },
      '/auth': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true
      },
      '/submissions': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true
      },
      '/progress': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true
      },
      '/me': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})

