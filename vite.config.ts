import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Local dev helper for Queue Insights. In production, Vercel serves /api.
      '/api': 'http://127.0.0.1:8787',
    },
  },
})
