import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  envPrefix: ['VITE_', 'SUPABASE_'],
  plugins: [react(), tailwindcss()],
  server: {
    // Allow any external host (ngrok, localtunnel, etc.) — Vite 8 requires `true`, not 'all'
    allowedHosts: true,
  },
})

