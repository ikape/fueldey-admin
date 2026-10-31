export const formatNaira = (value: number | string | null | undefined): string =>
  `₦${Number(value ?? 0).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;

/** How long ago, roughly: "just now", "5 min ago", "3 h ago", "2 d ago". */
export function formatAge(from: string | Date, now: Date = new Date()): string {
  const minutes = Math.floor((now.getTime() - new Date(from).getTime()) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} d ago`;
}

/** A vendor can be paid without their business being verified, which is worth an admin noticing. */
export const needsKycWarning = (kycStatus?: string | null): boolean => kycStatus !== 'approved';

export const WITHDRAWAL_TABS = [
  { value: 'pending', label: 'Awaiting decision' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Paid' },
  { value: 'failed', label: 'Declined / failed' },
  { value: 'all', label: 'All' },
];

export const TRANSACTION_TYPES = [
  { value: '', label: 'All types' },
  { value: 'top_up', label: 'Top-ups' },
  { value: 'purchase', label: 'Purchases' },
  { value: 'refund', label: 'Refunds' },
  { value: 'withdrawal', label: 'Withdrawals' },
];

export const TRANSACTION_STATUSES = [
  { value: '', label: 'Any status' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];
