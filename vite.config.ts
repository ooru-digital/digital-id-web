import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // ISSUER_* (no VITE_ prefix) is only visible to this dev server, never to the browser bundle
  const env = loadEnv(mode, '.', 'ISSUER_');

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      proxy: {
        '/api/credentials': {
          target: 'https://api.credissuer.com',
          changeOrigin: true,
          secure: true,
          headers: { Authorization: `Bearer ${env.ISSUER_API_TOKEN ?? ''}` },
        },
      },
    },
  };
});
