import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
         //target: 'https://eduflow-modern-digital-learning-platform.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
