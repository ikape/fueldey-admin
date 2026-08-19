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
        className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
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
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
      />
      <button
        disabled={isPending}
        onClick={() => startTransition(() => suspendUserAction(userId, reason))}
        className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        Suspend
      </button>
    </div>
  );
}
