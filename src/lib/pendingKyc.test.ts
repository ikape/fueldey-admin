import { describe, it, expect, vi, beforeEach } from 'vitest';

const getMock = vi.fn();
vi.mock('./api', () => ({ api: { get: getMock } }));
// Real unstable_rethrow re-throws Next's internal errors (redirect, notFound) and ignores the rest.
vi.mock('next/navigation', () => ({
  unstable_rethrow: (error: unknown) => {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error;
  },
}));

const { getPendingKycCount } = await import('./pendingKyc');

// Braces matter: a function returned from beforeEach is run by vitest as a cleanup hook.
beforeEach(() => {
  getMock.mockReset();
});

describe('getPendingKycCount', () => {
  it("reads the overview's pending KYC count", async () => {
    getMock.mockResolvedValue({ pendingKycCount: 4, totalUsers: 99 });

    await expect(getPendingKycCount()).resolves.toBe(4);
    expect(getMock).toHaveBeenCalledWith('/admin/overview');
  });

  it('gives null rather than failing the page when the overview cannot be loaded', async () => {
    getMock.mockRejectedValue(new Error('backend down'));
    await expect(getPendingKycCount()).resolves.toBeNull();

    getMock.mockResolvedValue({});
    await expect(getPendingKycCount()).resolves.toBeNull();
  });

  it('does not swallow the redirect to login on an expired session', async () => {
    getMock.mockRejectedValue(new Error('NEXT_REDIRECT'));

    await expect(getPendingKycCount()).rejects.toThrow('NEXT_REDIRECT');
  });
});
