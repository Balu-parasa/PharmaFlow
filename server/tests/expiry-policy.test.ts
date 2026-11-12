import { describe, it, expect } from 'vitest';
import {
  PHARMACY_TIMEZONE,
  getISTDateString,
  isBatchExpired,
  getEndOfTodayIST,
  getFutureISTBoundary
} from '../src/utils/expiry';

describe('Asia/Kolkata Expiry Policy Unit & Boundary Tests', () => {
  it('1. Correctly formats calendar date in Asia/Kolkata (IST)', () => {
    expect(PHARMACY_TIMEZONE).toBe('Asia/Kolkata');
    // 2026-11-12T19:00:00Z is 2026-11-13 00:30:00 AM IST
    const lateUtc = new Date('2026-11-12T19:00:00.000Z');
    expect(getISTDateString(lateUtc)).toBe('2026-11-13');

    // 2026-11-12T18:00:00Z is 2026-11-12 23:30:00 PM IST
    const preMidnightUtc = new Date('2026-11-12T18:00:00.000Z');
    expect(getISTDateString(preMidnightUtc)).toBe('2026-11-12');
  });

  it('2. Preserves date-only strings (YYYY-MM-DD)', () => {
    expect(getISTDateString('2026-11-12')).toBe('2026-11-12');
    expect(getISTDateString('2027-01-01')).toBe('2027-01-01');
  });

  it('3. Yesterday expiry date is expired today', () => {
    // Simulated "now" is Nov 12, 2026 10:00:00 IST (04:30:00 UTC)
    const nowIST = new Date('2026-11-12T04:30:00.000Z');
    const yesterday = '2026-11-11';
    expect(isBatchExpired(yesterday, nowIST)).toBe(true);
  });

  it('4. Today expiry date remains sellable throughout today in IST', () => {
    // Simulated "now" is Nov 12, 2026 23:30:00 IST (18:00:00 UTC)
    const lateTodayIST = new Date('2026-11-12T18:00:00.000Z');
    const today = '2026-11-12';
    // Even at 23:30 IST on Nov 12, a Nov 12 batch is NOT expired yet
    expect(isBatchExpired(today, lateTodayIST)).toBe(false);
  });

  it('5. Midnight boundary transition: batch expiring Nov 12 expires at 00:00:00 IST on Nov 13', () => {
    const today = '2026-11-12';

    // 23:59:59.999 IST on Nov 12 -> 18:29:59.999 UTC on Nov 12
    const endOfNov12 = new Date('2026-11-12T18:29:59.999Z');
    expect(isBatchExpired(today, endOfNov12)).toBe(false);

    // 00:00:00.000 IST on Nov 13 -> 18:30:00.000 UTC on Nov 12
    const startOfNov13 = new Date('2026-11-12T18:30:00.000Z');
    expect(isBatchExpired(today, startOfNov13)).toBe(true);
  });

  it('6. Tomorrow expiry date is not expired', () => {
    const nowIST = new Date('2026-11-12T04:30:00.000Z');
    const tomorrow = '2026-11-13';
    expect(isBatchExpired(tomorrow, nowIST)).toBe(false);
  });

  it('7. Expiry boundary timestamps for Prisma database filtering', () => {
    const nowIST = new Date('2026-11-12T04:30:00.000Z');
    const endOfToday = getEndOfTodayIST(nowIST);
    expect(endOfToday.toISOString()).toBe('2026-11-12T18:29:59.999Z');

    const future30 = getFutureISTBoundary(30, nowIST);
    expect(future30.toISOString()).toBe('2026-12-12T18:29:59.999Z');
  });
});

