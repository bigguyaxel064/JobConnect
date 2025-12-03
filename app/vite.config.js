import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://backend:5000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
      '/uploads': {
        target: 'http://backend:5000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/uploads/, '/uploads'),
      },
    },
  },
});
