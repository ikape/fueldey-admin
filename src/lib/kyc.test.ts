import { describe, it, expect } from 'vitest';
import { companyTypeLabel, isValidRejectionReason, matchingDirectors, MIN_REJECTION_REASON_LENGTH } from './kyc';

describe('isValidRejectionReason', () => {
  it('needs a real reason, ignoring surrounding whitespace', () => {
    expect(isValidRejectionReason('')).toBe(false);
    expect(isValidRejectionReason('   ')).toBe(false);
    expect(isValidRejectionReason('no')).toBe(false);
    expect(isValidRejectionReason(' '.repeat(10) + 'ab')).toBe(false);
    expect(isValidRejectionReason('x'.repeat(MIN_REJECTION_REASON_LENGTH))).toBe(true);
    expect(isValidRejectionReason('Certificate is for a different company')).toBe(true);
  });
});

describe('matchingDirectors', () => {
  const directors = ['RONALD DONATIUS EKOM', 'ANITA JOHNSON', 'DEL LAYAN ADE'];

  it('matches the account owner to a director regardless of word order or a middle name', () => {
    expect(matchingDirectors('Ronald Ekom', directors)).toEqual(['RONALD DONATIUS EKOM']);
    expect(matchingDirectors('Ekom Ronald', directors)).toEqual(['RONALD DONATIUS EKOM']);
    expect(matchingDirectors('anita johnson', directors)).toEqual(['ANITA JOHNSON']);
  });

  it('is not fooled by sharing just one name when the owner has two', () => {
    expect(matchingDirectors('Ronald Okafor', directors)).toEqual([]);
    expect(matchingDirectors('Grace Johnson', directors)).toEqual([]);
  });

  it('accepts a single shared name only when the owner has a single name', () => {
    expect(matchingDirectors('Ekom', directors)).toEqual(['RONALD DONATIUS EKOM']);
  });

  it('ignores punctuation, extra spaces and single-letter initials', () => {
    expect(matchingDirectors('  Ronald   O. Ekom ', ['RONALD EKOM'])).toEqual(['RONALD EKOM']);
    expect(matchingDirectors('A. B.', ['A B'])).toEqual([]);
  });

  it('finds nothing without directors or without a usable owner name', () => {
    expect(matchingDirectors('Ronald Ekom', [])).toEqual([]);
    expect(matchingDirectors('', directors)).toEqual([]);
  });
});

describe('companyTypeLabel', () => {
  it('spells out the CAC registration types and passes unknown ones through', () => {
    expect(companyTypeLabel('RC')).toBe('Registered company (RC)');
    expect(companyTypeLabel('BN')).toBe('Business name (BN)');
    expect(companyTypeLabel('IT')).toBe('Incorporated trustees (IT)');
    expect(companyTypeLabel('XX')).toBe('XX');
  });
});
