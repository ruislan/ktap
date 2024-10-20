import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

const backServer = 'http://127.0.0.1:8000';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ktap': '/src',
    }
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api/': backServer,
      '/admin/': backServer,
      '/public/uploads': backServer,
    }
  }
});
