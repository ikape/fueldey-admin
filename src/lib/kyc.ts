import type { ActionResult } from './actionResult';

/** Outcome of an approve/decline. */
export type KycDecisionResult = ActionResult;

/** Declining needs a real reason: it is shown to the user, who has to know what to fix. */
export const MIN_REJECTION_REASON_LENGTH = 5;

export const isValidRejectionReason = (reason: string): boolean =>
  reason.trim().length >= MIN_REJECTION_REASON_LENGTH;

const COMPANY_TYPE_LABELS: Record<string, string> = {
  RC: 'Registered company (RC)',
  BN: 'Business name (BN)',
  IT: 'Incorporated trustees (IT)',
};

export const companyTypeLabel = (type: string): string => COMPANY_TYPE_LABELS[type] ?? type;

// Names are compared as upper-case words; single letters (initials) say too little to count.
const nameWords = (value: string): string[] => value.toUpperCase().split(/[^A-Z]+/).filter((w) => w.length > 1);

/**
 * Directors of the business whose name lines up with the account owner's name, in any word order
 * (Nigerian names often swap first and last). A hint for the reviewer, not a decision: it needs two
 * shared words when the owner has two or more, one when they only have one.
 */
export function matchingDirectors(ownerName: string, directors: string[]): string[] {
  const owner = new Set(nameWords(ownerName));
  if (owner.size === 0) return [];
  const needed = Math.min(2, owner.size);
  return directors.filter((director) => nameWords(director).filter((word) => owner.has(word)).length >= needed);
}
