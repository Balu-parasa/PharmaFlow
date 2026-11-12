/**
 * Precision Pharmacy Expiry Date Governance (Asia/Kolkata Business Policy)
 *
 * Requirements for India-Based Pharmacy Operations:
 * 1. Timezone: All calendar boundaries are evaluated in Asia/Kolkata (IST = UTC+05:30).
 * 2. Expiry Policy:
 *    - A medicine labeled with expiry date YYYY-MM-DD remains legally sellable throughout that calendar day in India (until 23:59:59.999 IST).
 *    - At 00:00:00.000 IST on the following day (YYYY-MM-DD + 1), the batch is officially expired and quarantined.
 * 3. Consistent Cross-Module Application:
 *    - Purchase receiving forbids accepting batches whose expiry date has passed in IST.
 *    - FEFO allocation strictly prioritizes non-expired batches using IST calendar dates.
 *    - POS checkout enforces the same check before deduction.
 *    - Near-expiry and expired alerts in inventory/reports use identical IST day boundaries.
 */

export const PHARMACY_TIMEZONE = 'Asia/Kolkata';

/**
 * Returns the calendar date string (YYYY-MM-DD) for a given date in Asia/Kolkata timezone.
 */
export function getISTDateString(dateInput: string | Date = new Date()): string {
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
    return dateInput.trim();
  }
  const d = new Date(dateInput);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: PHARMACY_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d);
}

/**
 * Checks whether an expiry date has elapsed under the Asia/Kolkata calendar-day policy.
 * A batch expiring on 2026-11-12 remains valid throughout 2026-11-12 in IST,
 * and becomes expired on 2026-11-13 00:00:00 IST.
 */
export function isBatchExpired(expiryDateInput: string | Date, now: Date = new Date()): boolean {
  const expiryDateStr = getISTDateString(expiryDateInput);
  const todayISTStr = getISTDateString(now);
  return expiryDateStr < todayISTStr;
}

/**
 * Returns the UTC timestamp representing the end of today (23:59:59.999 IST) in Asia/Kolkata.
 * Used for database queries comparing DateTime fields stored in UTC.
 */
export function getEndOfTodayIST(now: Date = new Date()): Date {
  const todayStr = getISTDateString(now);
  // 23:59:59.999 IST is 18:29:59.999 UTC
  return new Date(`${todayStr}T18:29:59.999Z`);
}

/**
 * Returns the UTC timestamp representing N days ahead in Asia/Kolkata (at 23:59:59.999 IST).
 */
export function getFutureISTBoundary(daysAhead: number = 30, now: Date = new Date()): Date {
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  const futureStr = getISTDateString(futureDate);
  return new Date(`${futureStr}T18:29:59.999Z`);
}
