'use client';

import { useState, useTransition } from 'react';
import { approveDocumentAction, rejectDocumentAction } from '@/lib/actions';

export function DocumentReviewControls({ documentId }: { documentId: string }) {
  const [reason, setReason] = useState('');
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => approveDocumentAction(documentId))}
        className="rounded-md bg-green-600 px-3 py-1 text-xs text-white disabled:opacity-50"
      >
        Approve
      </button>
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Rejection reason"
        className="rounded-md border border-slate-300 px-2 py-1 text-xs"
      />
      <button
        disabled={isPending || !reason}
        onClick={() => startTransition(() => rejectDocumentAction(documentId, reason))}
        className="rounded-md bg-red-600 px-3 py-1 text-xs text-white disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
