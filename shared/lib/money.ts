const SYMBOLS: Record<string, string> = { EUR: '€', USD: '$', GBP: '£' };

export function formatMoney(cents: number, currency: string): string {
  const sign = cents < 0 ? '-' : '';
  const symbol = SYMBOLS[currency] ?? `${currency} `;
  return `${sign}${symbol}${(Math.abs(cents) / 100).toFixed(2)}`;
}

export function parseMoney(input: string): number | null {
  const cleaned = input.trim().replace(/[€$£,\s]/g, '');
  if (cleaned === '') return null;
  const value = Number(cleaned);
  if (Number.isNaN(value)) return null;
  if (value < 0) return null;
  return Math.round(value * 100);
}

