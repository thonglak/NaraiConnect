import { Elysia, t } from 'elysia';
import { randomHex } from '../../lib/crypto';
import { env, isProd } from '../../lib/env';
import { errValidation } from '../../lib/errors';
import { requireAdmin } from '../../lib/guard';
import {
  buildAuthorizeUrl,
  exchangeCode,
  fetchUserInfo,
} from '../../lib/oauth-client';
import { signSession, verifySession } from '../../lib/session';
import { loadActiveAdminByUsername } from './service';

const STATE_COOKIE = 'ncadm_state';
const STATE_MAX_AGE = 600; // 10 minutes

const cookieDefaults = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: env.APP_BASE_PATH || '/',
  secure: isProd,
};

// Elysia's cookie.remove() doesn't repeat the Path attribute, so a cookie
// scoped to /sso_man stays in the browser. Explicitly set the matching
// Path with maxAge=0 to force the browser to drop it.
const clearedCookie = { ...cookieDefaults, value: '', maxAge: 0 };

export const authPlugin = new Elysia({ prefix: '/auth' })
  .get('/login', ({ cookie, redirect }) => {
    const state = randomHex(16);
    cookie[STATE_COOKIE].set({
      ...cookieDefaults,
      value: state,
      maxAge: STATE_MAX_AGE,
    });
    return redirect(buildAuthorizeUrl(state), 302);
  })

  .get(
    '/callback',
    async ({ query, cookie, redirect }) => {
      const expected = cookie[STATE_COOKIE]?.value;
      const existingToken = cookie[env.SESSION_COOKIE_NAME]?.value;

      // Stale callback URL replay: user has a valid signed session already,
      // skip re-doing the OAuth flow and just send them to the app.
      if (verifySession(existingToken)) {
        cookie[STATE_COOKIE].set(clearedCookie);
        return redirect(`${env.WEB_PUBLIC_URL}/dashboard`, 302);
      }

      // No state cookie at all (replay / bookmark / expired) — bounce to home
      // so the user can click login again. Throwing JSON here is hostile.
      if (!expected) {
        cookie[env.SESSION_COOKIE_NAME].set(clearedCookie);
        return redirect(env.WEB_PUBLIC_URL, 302);
      }

      if (expected !== query.state) {
        throw errValidation('Invalid state');
      }
      cookie[STATE_COOKIE].set(clearedCookie);

      const tokens = await exchangeCode(query.code);
      const userInfo = await fetchUserInfo(tokens.access_token);
      const admin = await loadActiveAdminByUsername(userInfo.username);

      const sessionToken = signSession({
        username: admin.username,
        displayName: admin.displayName ?? userInfo.displayName,
        isSuper: admin.isSuper === 1,
      });
      cookie[env.SESSION_COOKIE_NAME].set({
        ...cookieDefaults,
        value: sessionToken,
        maxAge: env.SESSION_MAX_AGE_SECONDS,
      });
      return redirect(`${env.WEB_PUBLIC_URL}/dashboard`, 302);
    },
    {
      query: t.Object({
        code: t.String({ minLength: 1 }),
        state: t.String({ minLength: 1 }),
      }),
    },
  )

  .group('', (g) =>
    g
      .use(requireAdmin)
      .post('/logout', ({ cookie }) => {
        cookie[env.SESSION_COOKIE_NAME].set(clearedCookie);
        return { ok: true };
      })
      .get('/me', ({ admin }) => ({
        username: admin.username,
        displayName: admin.displayName,
        isSuper: admin.isSuper,
        expiresAt: admin.expiresAt,
      })),
  );
