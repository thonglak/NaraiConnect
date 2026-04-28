import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from './env';

export type AdminSession = {
  username: string;
  displayName: string | null;
  isSuper: boolean;
  expiresAt: number; // epoch ms
};

const ALG = 'sha256';
const SEP = '.';

const b64urlEncode = (buf: Buffer): string => buf.toString('base64url');
const b64urlDecode = (s: string): Buffer => Buffer.from(s, 'base64url');

const hmac = (data: string): string =>
  b64urlEncode(createHmac(ALG, env.SESSION_SECRET).update(data).digest());

// Stateless session token — survives api hot-reloads and horizontal scaling.
// Format: <base64url(payload-json)>.<base64url(hmac-sha256)>
export const signSession = (payload: Omit<AdminSession, 'expiresAt'>): string => {
  const full: AdminSession = {
    ...payload,
    expiresAt: Date.now() + env.SESSION_MAX_AGE_SECONDS * 1000,
  };
  const data = b64urlEncode(Buffer.from(JSON.stringify(full), 'utf8'));
  return `${data}${SEP}${hmac(data)}`;
};

export const verifySession = (token: string | undefined): AdminSession | null => {
  if (!token) return null;
  const idx = token.indexOf(SEP);
  if (idx <= 0 || idx === token.length - 1) return null;
  const data = token.slice(0, idx);
  const mac = token.slice(idx + 1);
  const expected = hmac(data);

  const a = b64urlDecode(mac);
  const b = b64urlDecode(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(b64urlDecode(data).toString('utf8')) as AdminSession;
    if (
      typeof payload.username !== 'string' ||
      typeof payload.expiresAt !== 'number' ||
      payload.expiresAt <= Date.now()
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};
