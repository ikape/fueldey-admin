import type { KycHistoryEntry } from './types';

export const DECISION_FILTERS = [
  { value: '', label: 'All events' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Declined' },
  { value: 'submitted', label: 'Submitted' },
];

export const DECISION_LABEL: Record<KycHistoryEntry['decision'], string> = {
  approved: 'Approved',
  rejected: 'Declined',
  submitted: 'Submitted',
};

export const DECISION_TONE: Record<KycHistoryEntry['decision'], 'green' | 'red' | 'yellow'> = {
  approved: 'green',
  rejected: 'red',
  submitted: 'yellow',
};

/** Who is behind the event, in words. */
export function decidedByLabel(entry: KycHistoryEntry): string {
  if (entry.decision === 'submitted') return entry.user?.fullName ? `${entry.user.fullName} (vendor)` : 'Vendor';
  if (entry.automatic) return 'Automatic (ID check)';
  return entry.decidedBy?.fullName ?? 'An admin (account removed)';
}

/** The detail worth showing beside the event: a decline's reason, the business, or the ID type used. */
export function historyDetail(entry: KycHistoryEntry): string {
  if (entry.reason) return entry.reason;
  if (entry.company?.name || entry.company?.rcNumber) {
    return [entry.company.name, entry.company.rcNumber && `RC ${entry.company.rcNumber}`].filter(Boolean).join(' · ');
  }
  if (entry.method) return `${entry.method.toUpperCase()} matched the account name`;
  return '—';
}
