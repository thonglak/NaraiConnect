import { env } from './env';
import { AppError } from './errors';

export type TokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
};

export type UserInfo = {
  username: string;
  displayName: string | null;
  raw: Record<string, unknown>;
};

export const buildAuthorizeUrl = (state: string): string => {
  const url = new URL(env.OAUTH_AUTHORIZE_URL);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', env.OAUTH_CLIENT_ID);
  url.searchParams.set('redirect_uri', env.OAUTH_REDIRECT_URI);
  url.searchParams.set('scope', env.OAUTH_SCOPE);
  url.searchParams.set('state', state);
  return url.toString();
};

export const exchangeCode = async (code: string): Promise<TokenResponse> => {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: env.OAUTH_REDIRECT_URI,
    client_id: env.OAUTH_CLIENT_ID,
    client_secret: env.OAUTH_CLIENT_SECRET,
  });
  const res = await fetch(env.OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new AppError('OAUTH_TOKEN_FAILED', `Token exchange failed: ${res.status} ${text}`, 502);
  }
  return (await res.json()) as TokenResponse;
};

export const fetchUserInfo = async (accessToken: string): Promise<UserInfo> => {
  const res = await fetch(env.OAUTH_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new AppError('OAUTH_USERINFO_FAILED', `Userinfo failed: ${res.status} ${text}`, 502);
  }
  const raw = (await res.json()) as Record<string, unknown>;
  const username = pickString(raw, ['username', 'user_id', 'sub', 'preferred_username']);
  if (!username) {
    throw new AppError('OAUTH_USERINFO_INVALID', 'Userinfo missing username field', 502);
  }
  const displayName = pickString(raw, ['display_name', 'name', 'first_name']) ?? null;
  return { username, displayName, raw };
};

const pickString = (obj: Record<string, unknown>, keys: readonly string[]): string | undefined => {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.length > 0) return v;
  }
  return undefined;
};
