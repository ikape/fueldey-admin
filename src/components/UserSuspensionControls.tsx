'use client';

import { useState, useTransition } from 'react';
import { suspendUserAction, reactivateUserAction } from '@/lib/actions';

export function UserSuspensionControls({ userId, isSuspended }: { userId: string; isSuspended: boolean }) {
  const [reason, setReason] = useState('');
  const [isPending, startTransition] = useTransition();

  if (isSuspended) {
    return (
      <button
        disabled={isPending}
        onClick={() => startTransition(() => reactivateUserAction(userId))}
        className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
      >
        Reactivate
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (optional)"
        className="rounded-full border border-border bg-card px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
      />
      <button
        disabled={isPending}
        onClick={() => startTransition(() => suspendUserAction(userId, reason))}
        className="rounded-full bg-danger px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        Suspend
      </button>
    </div>
  );
}
