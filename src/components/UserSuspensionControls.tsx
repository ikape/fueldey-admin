'use client';

import { useState, useTransition } from 'react';
import { suspendUserAction, reactivateUserAction, deleteUserAction } from '@/lib/actions';
import { Button } from '@/components/Button';

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
  // Separate transitions per action — sharing one flag across Suspend/
  // Reactivate and Delete made clicking either button visually disable
  // its sibling even though it wasn't the one clicked.
  const [isStatusPending, startStatusTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

  const size = compact ? 'sm' : 'md';

  if (isDeleted) {
    return <span className="text-xs text-muted">Account deleted</span>;
  }

  const deleteButton = (
    <Button
      variant="dangerOutline"
      size={size}
      disabled={isDeletePending}
      onClick={() => {
        const deleteReason = window.prompt('Reason for deleting this account? (optional)');
        if (deleteReason === null) return;
        if (!confirm('This will permanently deactivate the account. Continue?')) return;
        startDeleteTransition(() => deleteUserAction(userId, deleteReason));
      }}
    >
      Delete
    </Button>
  );

  if (isSuspended) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size={size}
          disabled={isStatusPending}
          onClick={() => startStatusTransition(() => reactivateUserAction(userId))}
        >
          Reactivate
        </Button>
        {deleteButton}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="danger"
          size={size}
          disabled={isStatusPending}
          onClick={() => {
            const suspendReason = window.prompt('Reason for suspending this account? (optional)');
            if (suspendReason === null) return;
            startStatusTransition(() => suspendUserAction(userId, suspendReason));
          }}
        >
          Suspend
        </Button>
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
        className="rounded-full border border-border bg-card px-3 py-1.5 text-sm transition-colors duration-150 focus:border-primary focus:outline-none"
      />
      <Button
        variant="danger"
        size={size}
        disabled={isStatusPending}
        onClick={() => startStatusTransition(() => suspendUserAction(userId, reason))}
      >
        Suspend
      </Button>
      {deleteButton}
    </div>
  );
}
