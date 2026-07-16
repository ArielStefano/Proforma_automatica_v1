import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/Proforma_automatica_v1/' : '/',
  plugins: [react(), tailwindcss()],
})
