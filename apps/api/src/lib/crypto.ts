import { randomBytes } from 'node:crypto';

export const randomHex = (bytes: number): string => randomBytes(bytes).toString('hex');

// 16 hex chars (matches existing PHP-generated client_id pattern)
export const generateClientId = (): string => randomHex(8);

// 32 hex chars (matches existing PHP-generated client_secret pattern)
export const generateClientSecret = (): string => randomHex(16);

// 64 hex chars for opaque session id
export const generateSessionId = (): string => randomHex(32);
