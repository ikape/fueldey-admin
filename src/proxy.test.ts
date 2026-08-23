import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from './proxy';
import { SESSION_COOKIE } from './lib/auth';

/**
 * This is the route guard for the whole /dashboard/* tree, implemented as
 * Next.js 16's "proxy" convention (the renamed successor to middleware.ts —
 * a file literally named middleware.ts still works but is deprecated and
 * logs a build warning). Keep the filename/export name exactly `proxy.ts` /
 * `proxy`, since that's what Next.js's route-matching convention requires.
 */
describe('proxy (dashboard route guard)', () => {
  it('redirects to /login when the session cookie is missing', () => {
    const request = new NextRequest('https://admin.example.com/dashboard/users');

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://admin.example.com/login');
  });

  it('allows the request through when the session cookie is present', () => {
    const request = new NextRequest('https://admin.example.com/dashboard/users', {
      headers: { cookie: `${SESSION_COOKIE}=some.jwt.token` },
    });

    const response = proxy(request);

    // NextResponse.next() responses carry this internal header marking a
    // pass-through rather than a redirect/rewrite.
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('only matches dashboard routes, per the exported config', async () => {
    const { config } = await import('./proxy');
    expect(config.matcher).toEqual(['/dashboard/:path*']);
  });
});
