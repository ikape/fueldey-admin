export const SESSION_COOKIE = 'admin_token';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/** Decodes a JWT payload without verifying the signature — the backend already verified it. */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(normalized, 'base64').toString('utf-8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Defense-in-depth expiry check. The backend re-validates the token's
 * signature and expiry on every request, so this is not the source of
 * truth — it just lets the dashboard layout bounce an obviously-expired
 * or malformed token to /login before even making a network round trip.
 */
export function isValidAdminSession(token: string | undefined): boolean {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload || payload.role !== 'admin') return false;
  return payload.exp * 1000 > Date.now();
}
