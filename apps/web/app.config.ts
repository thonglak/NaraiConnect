import { defineConfig } from '@solidjs/start/config';
import tailwindcss from '@tailwindcss/vite';

// Empty in dev (served at "/"), "/sso_man" in prod (served behind nginx
// rewrite at apps.naraiproperty.com/sso_man/). Trailing slash stripped.
const basePath = (process.env.APP_BASE_PATH ?? '').replace(/\/$/, '');

export default defineConfig({
  ...(basePath
    ? {
        server: {
          preset: 'bun',
          baseURL: basePath,
        },
      }
    : {
        server: {
          preset: 'bun',
        },
      }),
  vite: {
    plugins: [tailwindcss()],
    base: basePath ? `${basePath}/` : '/',
    server: {
      host: '0.0.0.0',
      hmr: false,
    },
  },
});
