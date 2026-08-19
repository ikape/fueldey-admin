'use client';

import { useState, useTransition } from 'react';
import { approveWithdrawalAction, rejectWithdrawalAction } from '@/lib/actions';

export function WithdrawalControls({ transactionId }: { transactionId: string }) {
  const [reason, setReason] = useState('');
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => approveWithdrawalAction(transactionId))}
        className="rounded-md bg-green-600 px-3 py-1 text-xs text-white disabled:opacity-50"
      >
        Approve
      </button>
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (optional)"
        className="rounded-md border border-slate-300 px-2 py-1 text-xs"
      />
      <button
        disabled={isPending}
        onClick={() => startTransition(() => rejectWithdrawalAction(transactionId, reason))}
        className="rounded-md bg-red-600 px-3 py-1 text-xs text-white disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
