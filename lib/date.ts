/**
 * Parses an API date. Date-only strings ("2026-10-05") are read as a *local* calendar date —
 * `new Date("2026-10-05")` would be UTC midnight, which shows as the previous day west of UTC.
 */
export function parseApiDate(value: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(value);
}

/** Combines an API date ("YYYY-MM-DD") and optional time ("HH:MM[:SS]") into a local Date. */
export function parseApiDateTime(date: string, time?: string | null): Date {
  const d = parseApiDate(date);
  if (time) {
    const [h, min] = time.split(":").map(Number);
    if (!isNaN(h)) d.setHours(h, isNaN(min) ? 0 : min, 0, 0);
  }
  return d;
}

/** Formats a Date as "YYYY-MM-DD" using its local calendar date (not UTC). */
export function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
