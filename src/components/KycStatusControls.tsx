'use client';

import { useState, useTransition } from 'react';
import { approveUserKycAction, rejectUserKycAction } from '@/lib/actions';
import { Button } from '@/components/Button';

export function KycStatusControls({ userId }: { userId: string }) {
  const [reason, setReason] = useState('');
  // Separate transitions so clicking Approve doesn't visually disable
  // Reject (and vice versa) — they're independent actions.
  const [isApprovePending, startApproveTransition] = useTransition();
  const [isRejectPending, startRejectTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="primary"
        size="sm"
        disabled={isApprovePending}
        onClick={() => startApproveTransition(() => approveUserKycAction(userId))}
      >
        Approve KYC
      </Button>
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Rejection reason"
        className="rounded-full border border-border bg-card px-2 py-1 text-xs transition-colors duration-150 focus:border-primary focus:outline-none"
      />
      <Button
        variant="danger"
        size="sm"
        disabled={isRejectPending}
        onClick={() => startRejectTransition(() => rejectUserKycAction(userId, reason))}
      >
        Reject KYC
      </Button>
    </div>
  );
}
