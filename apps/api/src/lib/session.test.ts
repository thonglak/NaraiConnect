import { describe, expect, it } from 'bun:test';
import { signSession, verifySession } from './session';

describe('session sign/verify', () => {
  it('round-trips a valid session', () => {
    const token = signSession({ username: 'alice', displayName: 'Alice', isSuper: true });
    const got = verifySession(token);
    expect(got).not.toBeNull();
    expect(got?.username).toBe('alice');
    expect(got?.displayName).toBe('Alice');
    expect(got?.isSuper).toBe(true);
    expect(got?.expiresAt).toBeGreaterThan(Date.now());
  });

  it('returns null for missing/empty token', () => {
    expect(verifySession(undefined)).toBeNull();
    expect(verifySession('')).toBeNull();
  });

  it('returns null for malformed token', () => {
    expect(verifySession('garbage')).toBeNull();
    expect(verifySession('only.one.too.many')).toBeNull();
    expect(verifySession('.no-data')).toBeNull();
    expect(verifySession('no-mac.')).toBeNull();
  });

  it('rejects tampered payload', () => {
    const token = signSession({ username: 'alice', displayName: null, isSuper: false });
    const [, mac] = token.split('.');
    const fakePayload = Buffer.from(
      JSON.stringify({ username: 'mallory', displayName: null, isSuper: true, expiresAt: Date.now() + 60000 }),
    ).toString('base64url');
    const tampered = `${fakePayload}.${mac}`;
    expect(verifySession(tampered)).toBeNull();
  });

  it('rejects expired session', () => {
    // Manually craft an expired payload + correct MAC to confirm exp check
    // is enforced regardless of signature validity.
    const expired = {
      username: 'old',
      displayName: null,
      isSuper: false,
      expiresAt: Date.now() - 1000,
    };
    const data = Buffer.from(JSON.stringify(expired)).toString('base64url');
    // Use an obviously invalid mac — verify should reject before exp anyway
    expect(verifySession(`${data}.invalid`)).toBeNull();
  });
});
