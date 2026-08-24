import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: https://aleksandra-mirkanovic.github.io/tb4l-mvp-prototype/
export default defineConfig({
  plugins: [react()],
  base: '/tb4l-mvp-prototype/',
})
