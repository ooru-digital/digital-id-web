import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // ISSUER_* (no VITE_ prefix) is only visible to this dev server, never to the browser bundle
  const env = loadEnv(mode, '.', 'ISSUER_');

  // Only the dev/preview server proxies issuer calls; production builds get the token from nginx at runtime
  if (command === 'serve' && !env.ISSUER_API_TOKEN?.trim()) {
    throw new Error('ISSUER_API_TOKEN is not set. Add it to .env.local (see .env.example) before running the dev server.');
  }

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
          headers: { Authorization: `Bearer ${env.ISSUER_API_TOKEN}` },
        },
      },
    },
  };
});
