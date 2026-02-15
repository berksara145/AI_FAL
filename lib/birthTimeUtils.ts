/**
 * Birth time utilities: build UTC Date from birth date + time.
 * Store and pass birth date as ISO triple { year, month (1-12), day } only.
 *
 * Single source of truth: (year, month, day, hour, minute) is interpreted as
 * the UTC moment of birth. So birthDate (UTC) and birthTime (hour, minute) always
 * match — no second "time" that differs.
 *
 * TODO: When adding timezone support (e.g. geo-tz + Luxon), interpret hour/minute
 * as local to birth place and convert to UTC; then birthDate will still be the
 * UTC instant and birthTime the displayed local time.
 */

/**
 * Build the UTC Date for the moment of birth.
 * (year, month 1-12, day, hour, minute) is used directly as UTC — so the
 * resulting Date has exactly that hour/minute in UTC, and matches birthTime.
 *
 * @param params year (full), month (1-12), day, hour, minute (longitude unused until tz lookup)
 * @returns Date in UTC for astronomy-engine
 */
export function birthPlaceLocalToUTC(params: {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  longitude: number;
}): Date {
  const { year, month, day, hour, minute } = params;

  if (month < 1 || month > 12) {
    throw new Error(`birthPlaceLocalToUTC: month must be 1-12, got ${month}`);
  }

  return new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
}
