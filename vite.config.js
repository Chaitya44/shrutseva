import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/front': {
        target: 'https://147.93.155.190/test',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'https://147.93.155.190/test',
        changeOrigin: true,
        secure: false,
      },
      '/get_bhandars_list': {
        target: 'https://147.93.155.190/test',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
