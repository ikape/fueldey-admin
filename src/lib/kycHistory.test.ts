import { describe, it, expect } from 'vitest';
import { decidedByLabel, historyDetail } from './kycHistory';
import type { KycHistoryEntry } from './types';

const entry = (over: Partial<KycHistoryEntry>): KycHistoryEntry => ({
  id: '1',
  at: '2026-10-31T08:00:00Z',
  decision: 'approved',
  automatic: false,
  decidedBy: { id: 'a1', fullName: 'Ada Admin', email: 'ada@que.ng' },
  user: { id: 'v1', fullName: 'Ronald Ekom', email: 'r@e.com', role: 'vendor' },
  ...over,
});

describe('decidedByLabel', () => {
  it('names the admin who decided', () => {
    expect(decidedByLabel(entry({}))).toBe('Ada Admin');
  });

  it('says so when the ID check approved it by itself', () => {
    expect(decidedByLabel(entry({ automatic: true, decidedBy: null }))).toBe('Automatic (ID check)');
  });

  it('credits a submission to the vendor', () => {
    expect(decidedByLabel(entry({ decision: 'submitted', decidedBy: null }))).toBe('Ronald Ekom (vendor)');
  });

  it('copes with an admin account that has been removed', () => {
    expect(decidedByLabel(entry({ decidedBy: null }))).toBe('An admin (account removed)');
  });
});

describe('historyDetail', () => {
  it('shows a decline reason first', () => {
    expect(historyDetail(entry({ decision: 'rejected', reason: 'Not the owner' }))).toBe('Not the owner');
  });

  it('shows the business for a submission', () => {
    expect(historyDetail(entry({ decision: 'submitted', company: { name: 'EKOM LTD', rcNumber: '1234567' } }))).toBe('EKOM LTD · RC 1234567');
    expect(historyDetail(entry({ company: { rcNumber: '99' } }))).toBe('RC 99');
  });

  it('shows which ID type approved an automatic approval', () => {
    expect(historyDetail(entry({ automatic: true, method: 'nin' }))).toBe('NIN matched the account name');
  });

  it('has a dash when there is nothing to add', () => {
    expect(historyDetail(entry({}))).toBe('—');
  });
});
