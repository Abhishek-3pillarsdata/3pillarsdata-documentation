import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// `base: './'` + HashRouter lets the same build run on GitHub Pages (sub-path),
// Netlify, Vercel, or any static file host without rewrite rules.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
