'use client';

import { useState, useTransition } from 'react';
import { approveUserKycAction, rejectUserKycAction } from '@/lib/actions';
import { isValidRejectionReason, MIN_REJECTION_REASON_LENGTH } from '@/lib/kyc';
import type { KycStatus } from '@/lib/types';
import { Button } from '@/components/Button';

type Notice = { tone: 'success' | 'error'; text: string };

/**
 * Approve / decline a user's KYC. Approving asks for confirmation; declining needs a reason, which
 * the user sees in their notification. Only the decisions that change something are offered:
 * an approved account can only be revoked, a declined one can only be approved.
 */
export function KycStatusControls({
  userId,
  status,
  subject = 'identity',
}: {
  userId: string;
  status: KycStatus;
  /** What is being verified — worded into the confirmation. */
  subject?: 'identity' | 'business';
}) {
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isApprovePending, startApproveTransition] = useTransition();
  const [isRejectPending, startRejectTransition] = useTransition();
  // One decision at a time: a second click while the first is in flight could contradict it.
  const busy = isApprovePending || isRejectPending;

  const approve = () => {
    if (!confirm(`Approve this user's ${subject} verification? They will be notified.`)) return;
    setNotice(null);
    startApproveTransition(async () => {
      const result = await approveUserKycAction(userId);
      setNotice(result.ok ? { tone: 'success', text: 'Approved. The user has been notified.' } : { tone: 'error', text: result.error });
    });
  };

  const reject = () => {
    const verb = status === 'approved' ? 'Revoke the approved' : 'Decline the';
    if (!confirm(`${verb} ${subject} verification? The user will be notified with your reason.`)) return;
    setNotice(null);
    startRejectTransition(async () => {
      const result = await rejectUserKycAction(userId, reason);
      if (result.ok) {
        setReason('');
        setNotice({ tone: 'success', text: 'Declined. The user has been notified.' });
      } else {
        setNotice({ tone: 'error', text: result.error });
      }
    });
  };

  const canApprove = status !== 'approved';
  const canReject = status !== 'rejected';

  return (
    <div className="space-y-2">
      {status === 'not_submitted' && (
        <p className="text-xs text-muted">This user has not submitted KYC. Approving overrides the check.</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {canApprove && (
          <Button variant="primary" size="sm" disabled={busy} onClick={approve}>
            {isApprovePending ? 'Approving…' : 'Approve KYC'}
          </Button>
        )}
        {canReject && (
          <>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Reason shown to the user (min ${MIN_REJECTION_REASON_LENGTH} characters)`}
              aria-label="Reason for declining"
              className="w-72 rounded-full border border-border bg-card px-3 py-1 text-xs transition-colors duration-150 focus:border-primary focus:outline-none"
            />
            <Button variant="danger" size="sm" disabled={busy || !isValidRejectionReason(reason)} onClick={reject}>
              {isRejectPending ? 'Declining…' : status === 'approved' ? 'Revoke approval' : 'Decline KYC'}
            </Button>
          </>
        )}
      </div>

      {notice && (
        <p role={notice.tone === 'error' ? 'alert' : 'status'} className={`text-xs ${notice.tone === 'error' ? 'text-danger' : 'text-primary'}`}>
          {notice.text}
        </p>
      )}
    </div>
  );
}
