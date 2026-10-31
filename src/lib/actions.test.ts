import { describe, it, expect, vi, beforeEach } from 'vitest';

const patchMock = vi.fn();
vi.mock('./api', () => ({
  api: { patch: patchMock },
  ApiError: class ApiError extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
    }
  },
}));

const revalidatePathMock = vi.fn();
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }));

const { approveUserKycAction, rejectUserKycAction } = await import('./actions');
const { ApiError } = await import('./api');

beforeEach(() => {
  patchMock.mockReset();
  revalidatePathMock.mockReset();
});

describe('approveUserKycAction', () => {
  it('approves through the backend and refreshes every dashboard page', async () => {
    patchMock.mockResolvedValue({});

    await expect(approveUserKycAction('u1')).resolves.toEqual({ ok: true });

    expect(patchMock).toHaveBeenCalledWith('/users/admin/u1/kyc/approve', undefined);
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard', 'layout');
  });

  it("returns the backend's refusal for the UI instead of throwing, and does not refresh", async () => {
    patchMock.mockRejectedValue(new ApiError(404, 'User not found'));

    await expect(approveUserKycAction('missing')).resolves.toEqual({ ok: false, error: 'User not found' });
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it('lets anything that is not an API refusal propagate (e.g. the redirect to login)', async () => {
    patchMock.mockRejectedValue(new Error('NEXT_REDIRECT'));

    await expect(approveUserKycAction('u1')).rejects.toThrow('NEXT_REDIRECT');
  });
});

describe('rejectUserKycAction', () => {
  it('will not decline without a real reason, and never calls the backend', async () => {
    for (const reason of ['', '   ', 'no']) {
      const result = await rejectUserKycAction('u1', reason);
      expect(result.ok).toBe(false);
    }
    expect(patchMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it('sends the trimmed reason and refreshes the dashboard', async () => {
    patchMock.mockResolvedValue({});

    await expect(rejectUserKycAction('u1', '  Certificate belongs to another company  ')).resolves.toEqual({ ok: true });

    expect(patchMock).toHaveBeenCalledWith('/users/admin/u1/kyc/reject', { reason: 'Certificate belongs to another company' });
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard', 'layout');
  });

  it("returns the backend's refusal for the UI", async () => {
    patchMock.mockRejectedValue(new ApiError(403, 'Forbidden resource'));

    await expect(rejectUserKycAction('u1', 'Not the owner')).resolves.toEqual({ ok: false, error: 'Forbidden resource' });
  });
});
