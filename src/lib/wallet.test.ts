import { describe, it, expect } from 'vitest';
import { formatAge, formatNaira, needsKycWarning } from './wallet';

describe('formatNaira', () => {
  it('formats amounts with separators, from numbers or the strings a decimal column gives', () => {
    expect(formatNaira(125000)).toBe('₦125,000');
    expect(formatNaira('2500.50')).toBe('₦2,500.5');
    expect(formatNaira(0)).toBe('₦0');
  });

  it('treats a missing amount as zero', () => {
    expect(formatNaira(null)).toBe('₦0');
    expect(formatNaira(undefined)).toBe('₦0');
  });
});

describe('formatAge', () => {
  const now = new Date('2026-10-31T12:00:00Z');
  const ago = (ms: number) => new Date(now.getTime() - ms);

  it('says how long a request has been waiting', () => {
    expect(formatAge(ago(20_000), now)).toBe('just now');
    expect(formatAge(ago(5 * 60_000), now)).toBe('5 min ago');
    expect(formatAge(ago(3 * 3_600_000 + 60_000), now)).toBe('3 h ago');
    expect(formatAge(ago(50 * 3_600_000), now)).toBe('2 d ago');
  });

  it('accepts a date string', () => {
    expect(formatAge('2026-10-31T11:00:00Z', now)).toBe('1 h ago');
  });
});

describe('needsKycWarning', () => {
  it('flags anyone whose KYC is not approved, including an unknown status', () => {
    expect(needsKycWarning('approved')).toBe(false);
    expect(needsKycWarning('pending')).toBe(true);
    expect(needsKycWarning('not_submitted')).toBe(true);
    expect(needsKycWarning(undefined)).toBe(true);
  });
});
