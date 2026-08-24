'use client';

import { useState, useTransition } from 'react';
import { approveDocumentAction, rejectDocumentAction } from '@/lib/actions';

export function DocumentReviewControls({ documentId }: { documentId: string }) {
  const [reason, setReason] = useState('');
  // Separate transitions so clicking Approve doesn't visually disable
  // Reject (and vice versa) — they're independent actions.
  const [isApprovePending, startApproveTransition] = useTransition();
  const [isRejectPending, startRejectTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={isApprovePending}
        onClick={() => startApproveTransition(() => approveDocumentAction(documentId))}
        className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
      >
        Approve
      </button>
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Rejection reason"
        className="rounded-full border border-border bg-card px-2 py-1 text-xs focus:border-primary focus:outline-none"
      />
      <button
        disabled={isRejectPending || !reason}
        onClick={() => startRejectTransition(() => rejectDocumentAction(documentId, reason))}
        className="rounded-full bg-danger px-3 py-1 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
