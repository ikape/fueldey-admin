import { describe, it, expect } from 'vitest';
import { decodeJwtPayload, isValidAdminSession, type JwtPayload } from './auth';

function makeToken(payload: Partial<JwtPayload>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.signature`;
}

describe('decodeJwtPayload', () => {
  it('decodes a well-formed token', () => {
    const token = makeToken({ sub: 'u1', email: 'a@b.com', role: 'admin', iat: 1, exp: 9999999999 });
    const payload = decodeJwtPayload(token);
    expect(payload?.role).toBe('admin');
    expect(payload?.email).toBe('a@b.com');
  });

  it('returns null for a malformed token', () => {
    expect(decodeJwtPayload('not-a-jwt')).toBeNull();
    expect(decodeJwtPayload('')).toBeNull();
  });

  it('returns null for unparsable base64 payload', () => {
    expect(decodeJwtPayload('header.%%%invalid%%%.sig')).toBeNull();
  });
});

describe('isValidAdminSession', () => {
  it('rejects when no token is present', () => {
    expect(isValidAdminSession(undefined)).toBe(false);
  });

  it('rejects a non-admin role even with a valid, unexpired token', () => {
    const token = makeToken({ sub: 'u1', email: 'a@b.com', role: 'commuter', iat: 1, exp: Math.floor(Date.now() / 1000) + 3600 });
    expect(isValidAdminSession(token)).toBe(false);
  });

  it('rejects an expired admin token', () => {
    const token = makeToken({ sub: 'u1', email: 'a@b.com', role: 'admin', iat: 1, exp: Math.floor(Date.now() / 1000) - 3600 });
    expect(isValidAdminSession(token)).toBe(false);
  });

  it('accepts a valid, unexpired admin token', () => {
    const token = makeToken({ sub: 'u1', email: 'a@b.com', role: 'admin', iat: 1, exp: Math.floor(Date.now() / 1000) + 3600 });
    expect(isValidAdminSession(token)).toBe(true);
  });

  it('rejects garbage input instead of throwing', () => {
    expect(isValidAdminSession('garbage')).toBe(false);
  });
});
