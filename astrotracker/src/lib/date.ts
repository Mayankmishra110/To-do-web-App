/**
 * Day handling.
 *
 * A "day" in AstroTracker is a calendar date in the user's own timezone,
 * represented everywhere in the app as a `YYYY-MM-DD` string ("day key") and
 * stored in Postgres as a DATE column. Prisma maps DATE values to a Date at
 * UTC midnight, so conversion happens in exactly these two functions and
 * nowhere else. This is what keeps "today" from silently shifting at 05:30.
 */

export type DayKey = string; // YYYY-MM-DD

const DAY_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isDayKey(value: string): value is DayKey {
  return DAY_KEY_RE.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

/** The current calendar date in the given IANA timezone. */
export function todayIn(timezone: string): DayKey {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Day key -> the Date value stored in a DATE column. */
export function toDbDate(day: DayKey): Date {
  return new Date(`${day}T00:00:00.000Z`);
}

/** A Date read from a DATE column -> day key. */
export function toDayKey(date: Date): DayKey {
  return date.toISOString().slice(0, 10);
}

export function addDays(day: DayKey, amount: number): DayKey {
  const d = toDbDate(day);
  d.setUTCDate(d.getUTCDate() + amount);
  return toDayKey(d);
}

export function daysBetween(from: DayKey, to: DayKey): number {
  return Math.round((toDbDate(to).getTime() - toDbDate(from).getTime()) / 86_400_000);
}

/** 0 = Sunday ... 6 = Saturday, for the habit day-of-week bitmask. */
export function weekdayIndex(day: DayKey): number {
  return toDbDate(day).getUTCDay();
}

export function formatDay(day: DayKey, style: "long" | "short" = "long"): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: style === "long" ? "long" : "short",
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
  }).format(toDbDate(day));
}
