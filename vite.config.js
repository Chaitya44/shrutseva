import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/front': {
        target: 'http://147.93.155.190/test',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://147.93.155.190/test',
        changeOrigin: true,
      },
      '/get_bhandars_list': {
        target: 'http://147.93.155.190/test',
        changeOrigin: true,
      }
    }
  }
})
