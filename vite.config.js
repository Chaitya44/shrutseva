import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/get_bhandars_list': {
        target: 'https://www.shrutseva.com/test',
        changeOrigin: true,
        secure: false,
      },
      '/front': {
        target: 'https://www.shrutseva.com/test',
        changeOrigin: true,
        secure: false,
      },
      '/login': {
        target: 'https://www.shrutseva.com/test',
        changeOrigin: true,
        secure: false,
      },
      '/front_login': {
        target: 'https://www.shrutseva.com/test',
        changeOrigin: true,
        secure: false,
      },
      '/logout': {
        target: 'https://www.shrutseva.com/test',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'https://www.shrutseva.com/test',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    }
  }
});
