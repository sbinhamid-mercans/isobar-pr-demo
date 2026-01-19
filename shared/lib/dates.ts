const DAY_MS = 86_400_000;

export function addDays(iso: string, days: number): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) throw new RangeError(`invalid date: ${iso}`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

// Whole days from `from` to `to`; zero when `to` is not after `from`.
export function daysBetween(from: string, to: string): number {
  const diff = Date.parse(to) - Date.parse(from);
  return diff > 0 ? Math.floor(diff / DAY_MS) : 0;
}

export function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}
