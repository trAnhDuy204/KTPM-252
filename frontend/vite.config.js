import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
  host: true,
  port: 5173,
  strictPort: true,
  allowedHosts: [
    ".ngrok-free.app",
    ".ngrok-free.dev",
    "localhost"
  ]
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: true,
  },
  

})
