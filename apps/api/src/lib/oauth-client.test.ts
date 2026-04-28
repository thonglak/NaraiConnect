import { describe, expect, it } from 'bun:test';
import { buildAuthorizeUrl } from './oauth-client';
import { env } from './env';

describe('buildAuthorizeUrl', () => {
  it('embeds client_id, redirect_uri, scope, state, response_type=code', () => {
    const url = new URL(buildAuthorizeUrl('xyz123'));
    expect(url.origin + url.pathname).toBe(env.OAUTH_AUTHORIZE_URL);
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('client_id')).toBe(env.OAUTH_CLIENT_ID);
    expect(url.searchParams.get('redirect_uri')).toBe(env.OAUTH_REDIRECT_URI);
    expect(url.searchParams.get('scope')).toBe(env.OAUTH_SCOPE);
    expect(url.searchParams.get('state')).toBe('xyz123');
  });

  it('produces different URLs for different states', () => {
    const a = buildAuthorizeUrl('a');
    const b = buildAuthorizeUrl('b');
    expect(a).not.toBe(b);
  });
});
