import { defineConfig, loadEnv, type Connect, type Plugin } from 'vite';

type GuardedRequest = Parameters<Connect.NextHandleFunction>[0] & { url?: string };
import react from '@vitejs/plugin-react';

// Same allow-list as nginx.conf: only these issuer calls are proxied with the token
const ISSUER_ROUTE = /^\/api\/credentials\/(issue\/client\/bulk|issued\/[^/?]+|presentation)(\?.*)?$/;

const rejectOtherIssuerPaths: Connect.NextHandleFunction = (req, res, next) => {
  const { url } = req as GuardedRequest;
  if (url?.startsWith('/api/credentials') && !ISSUER_ROUTE.test(url)) {
    res.statusCode = 404;
    res.end();
    return;
  }
  next();
};

const issuerRouteGuard = (): Plugin => ({
  name: 'issuer-route-guard',
  configureServer: server => {
    server.middlewares.use(rejectOtherIssuerPaths);
  },
  configurePreviewServer: server => {
    server.middlewares.use(rejectOtherIssuerPaths);
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // ISSUER_* (no VITE_ prefix) is only visible to this dev server, never to the browser bundle
  const env = loadEnv(mode, '.', 'ISSUER_');

  // Only the dev/preview server proxies issuer calls; production builds get the token from nginx at runtime
  if (command === 'serve' && !env.ISSUER_API_TOKEN?.trim()) {
    throw new Error('ISSUER_API_TOKEN is not set. Add it to .env.local (see .env.example) before running the dev server.');
  }

  return {
    plugins: [react(), issuerRouteGuard()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      proxy: {
        // A key starting with ^ is treated as a RegExp, so the token is only attached to allowed routes
        [ISSUER_ROUTE.source]: {
          target: 'https://api.credissuer.com',
          changeOrigin: true,
          secure: true,
          headers: { Authorization: `Bearer ${env.ISSUER_API_TOKEN}` },
        },
      },
    },
  };
});
