'use client';

import { useState, useTransition } from 'react';
import { approveWithdrawalAction, rejectWithdrawalAction } from '@/lib/actions';
import { isValidRejectionReason, MIN_REJECTION_REASON_LENGTH } from '@/lib/kyc';
import { formatNaira } from '@/lib/wallet';
import { Button } from '@/components/Button';

/**
 * Approve (sends the money through Paystack) or decline (returns it to the vendor's wallet) a withdrawal.
 * Both ask first, since neither can be taken back; declining needs a reason the vendor will see.
 */
export function WithdrawalControls({ transactionId, amount, vendor }: { transactionId: string; amount: number | string; vendor: string }) {
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [isApprovePending, startApprove] = useTransition();
  const [isRejectPending, startReject] = useTransition();
  const busy = isApprovePending || isRejectPending;

  const approve = () => {
    if (!confirm(`Pay ${formatNaira(amount)} to ${vendor}? The transfer is sent through Paystack.`)) return;
    setNotice(null);
    startApprove(async () => {
      const result = await approveWithdrawalAction(transactionId);
      setNotice(result.ok ? { ok: true, text: 'Approved. The transfer has been started.' } : { ok: false, text: result.error });
    });
  };

  const reject = () => {
    if (!confirm(`Decline this ${formatNaira(amount)} withdrawal? The money goes back to ${vendor}'s wallet.`)) return;
    setNotice(null);
    startReject(async () => {
      const result = await rejectWithdrawalAction(transactionId, reason);
      if (result.ok) setReason('');
      setNotice(result.ok ? { ok: true, text: 'Declined. The money is back in their wallet.' } : { ok: false, text: result.error });
    });
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Button variant="primary" size="sm" disabled={busy} onClick={approve}>
          {isApprovePending ? 'Approving…' : 'Approve'}
        </Button>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={`Reason for declining (min ${MIN_REJECTION_REASON_LENGTH})`}
          aria-label="Reason for declining"
          className="w-56 rounded-full border border-border bg-card px-3 py-1 text-xs transition-colors duration-150 focus:border-primary focus:outline-none"
        />
        <Button variant="danger" size="sm" disabled={busy || !isValidRejectionReason(reason)} onClick={reject}>
          {isRejectPending ? 'Declining…' : 'Decline'}
        </Button>
      </div>
      {notice && (
        <p role={notice.ok ? 'status' : 'alert'} className={`whitespace-normal text-xs ${notice.ok ? 'text-primary' : 'text-danger'}`}>
          {notice.text}
        </p>
      )}
    </div>
  );
}
