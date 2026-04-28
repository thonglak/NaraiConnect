import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { ErrorBoundary, Suspense } from 'solid-js';
import './app.css';

// Vite injects BASE_URL as the value of `vite.base` from app.config.ts.
// Solid Router wants no trailing slash, e.g. "/sso_man".
const routerBase = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');

export default function App() {
  return (
    <Router
      base={routerBase}
      root={(props) => (
        <ErrorBoundary
          fallback={(err) => (
            <div class="m-8 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <strong>App error:</strong>{' '}
              {err instanceof Error ? err.message : String(err)}
            </div>
          )}
        >
          <Suspense
            fallback={<div class="p-8 text-sm text-neutral-500">Loading…</div>}
          >
            {props.children}
          </Suspense>
        </ErrorBoundary>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
