import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy /api calls to backend during development
      '/api': {
        target: 'https://placeai-hcio.onrender.com',
        changeOrigin: true,
      }
    }
  }
})