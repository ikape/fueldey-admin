'use client';

import { useState, useTransition } from 'react';
import { approveUserKycAction, rejectUserKycAction } from '@/lib/actions';

export function KycStatusControls({ userId }: { userId: string }) {
  const [reason, setReason] = useState('');
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => approveUserKycAction(userId))}
        className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
      >
        Approve KYC
      </button>
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Rejection reason"
        className="rounded-full border border-border bg-card px-2 py-1 text-xs focus:border-primary focus:outline-none"
      />
      <button
        disabled={isPending}
        onClick={() => startTransition(() => rejectUserKycAction(userId, reason))}
        className="rounded-full bg-danger px-3 py-1 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        Reject KYC
      </button>
    </div>
  );
}
