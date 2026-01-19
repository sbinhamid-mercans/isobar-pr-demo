const SYMBOLS: Record<string, string> = { EUR: '€', USD: '$', GBP: '£' };

export function formatMoney(cents: number, currency: string): string {
  const sign = cents < 0 ? '-' : '';
  const symbol = SYMBOLS[currency] ?? `${currency} `;
  return `${sign}${symbol}${(Math.abs(cents) / 100).toFixed(2)}`;
}

