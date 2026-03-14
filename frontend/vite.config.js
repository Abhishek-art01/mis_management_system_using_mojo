import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // 1. The React plugin to handle your frontend code
  plugins: [react()],

  // 2. Fix for CSS loading - ensures assets are found at the root
  base: '/',

  // 3. The Server proxy to connect to Django locally (Updated to port 8002)
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8002',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://127.0.0.1:8002',
        changeOrigin: true,
      }
    }
  }
})