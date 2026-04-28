import { Elysia } from 'elysia';
import { env } from './env';
import { verifySession, type AdminSession } from './session';
import { errForbidden, errUnauthorized } from './errors';

// Reusable Elysia plugin that exposes `admin` on context after asserting a
// valid session cookie. Use via `.use(requireAdmin)` on protected groups.
export const requireAdmin = new Elysia({ name: 'guard:admin' }).derive(
  { as: 'scoped' },
  ({ cookie }): { admin: AdminSession } => {
    const token = cookie[env.SESSION_COOKIE_NAME]?.value;
    const session = verifySession(token);
    if (!session) throw errUnauthorized();
    return { admin: session };
  },
);

export const requireSuperAdmin = new Elysia({ name: 'guard:super' })
  .use(requireAdmin)
  .onBeforeHandle({ as: 'scoped' }, ({ admin }) => {
    if (!admin.isSuper) throw errForbidden('Super admin only');
  });
