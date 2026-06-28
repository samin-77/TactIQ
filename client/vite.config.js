import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Environment variables starting with VITE_ are automatically exposed to client code
  // Use VITE_API_URL in .env file to set the backend API URL
})
