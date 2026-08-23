import { describe, it, expect, vi, beforeEach } from 'vitest';

const cookiesGetMock = vi.fn();
vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve({ get: cookiesGetMock }),
}));

const redirectMock = vi.fn(() => {
  // The real next/navigation redirect() aborts the render by throwing a
  // special error Next.js recognizes. Mimic that so callers that don't
  // await/return the redirect still can't accidentally proceed.
  throw new Error('NEXT_REDIRECT');
});
vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}));

const { api } = await import('./api');

describe('api request()', () => {
  beforeEach(() => {
    cookiesGetMock.mockReset();
    redirectMock.mockClear();
    global.fetch = vi.fn();
  });

  it('attaches the session cookie as a Bearer token', async () => {
    cookiesGetMock.mockReturnValue({ value: 'abc.def.ghi' });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => JSON.stringify({ ok: true }),
    });

    await api.get('/users/admin');

    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer abc.def.ghi');
  });

  it('does not attach an Authorization header when there is no session cookie', async () => {
    cookiesGetMock.mockReturnValue(undefined);
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => '{}',
    });

    await api.get('/stations');

    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init.headers.Authorization).toBeUndefined();
  });

  it('redirects to /login on a 401 instead of leaking a raw error to the page', async () => {
    cookiesGetMock.mockReturnValue({ value: 'expired.token.here' });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      status: 401,
      ok: false,
      text: async () => JSON.stringify({ message: 'Unauthorized' }),
    });

    await expect(api.get('/users/admin')).rejects.toThrow('NEXT_REDIRECT');
    expect(redirectMock).toHaveBeenCalledWith('/login');
  });

  it('throws ApiError for non-401 failures instead of silently swallowing them', async () => {
    cookiesGetMock.mockReturnValue({ value: 'abc.def.ghi' });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      status: 500,
      ok: false,
      text: async () => JSON.stringify({ message: 'Server exploded' }),
    });

    await expect(api.get('/users/admin')).rejects.toThrow('Server exploded');
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
