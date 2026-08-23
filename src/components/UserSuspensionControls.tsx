'use client';

import { useState, useTransition } from 'react';
import { suspendUserAction, reactivateUserAction, deleteUserAction } from '@/lib/actions';

export function UserSuspensionControls({
  userId,
  isSuspended,
  isDeleted = false,
  compact = false,
}: {
  userId: string;
  isSuspended: boolean;
  isDeleted?: boolean;
  compact?: boolean;
}) {
  const [reason, setReason] = useState('');
  const [isPending, startTransition] = useTransition();

  const buttonClass = compact
    ? 'rounded-full px-3 py-1 text-xs font-semibold disabled:opacity-50'
    : 'rounded-full px-4 py-1.5 text-sm font-semibold disabled:opacity-50';

  if (isDeleted) {
    return <span className="text-xs text-muted">Account deleted</span>;
  }

  const deleteButton = (
    <button
      disabled={isPending}
      onClick={() => {
        const deleteReason = window.prompt('Reason for deleting this account? (optional)');
        if (deleteReason === null) return;
        if (!confirm('This will permanently deactivate the account. Continue?')) return;
        startTransition(() => deleteUserAction(userId, deleteReason));
      }}
      className={`${buttonClass} border border-danger/40 text-danger hover:bg-danger-bg`}
    >
      Delete
    </button>
  );

  if (isSuspended) {
    return (
      <div className="flex items-center gap-2">
        <button
          disabled={isPending}
          onClick={() => startTransition(() => reactivateUserAction(userId))}
          className={`${buttonClass} bg-primary text-primary-foreground hover:bg-primary-hover`}
        >
          Reactivate
        </button>
        {deleteButton}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          disabled={isPending}
          onClick={() => {
            const suspendReason = window.prompt('Reason for suspending this account? (optional)');
            if (suspendReason === null) return;
            startTransition(() => suspendUserAction(userId, suspendReason));
          }}
          className={`${buttonClass} bg-danger text-white hover:opacity-90`}
        >
          Suspend
        </button>
        {deleteButton}
      </div>
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
        className={`${buttonClass} bg-danger text-white hover:opacity-90`}
      >
        Suspend
      </button>
      {deleteButton}
    </div>
  );
}
