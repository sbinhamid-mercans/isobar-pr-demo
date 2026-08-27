import { describe, expect, it } from 'vitest';
import { formatMoney, parseMoney, sumCents } from './money';

describe('formatMoney', () => {
  it('uses the currency symbol and two decimals', () => {
    expect(formatMoney(123456, 'EUR')).toBe('€1234.56');
    expect(formatMoney(-500, 'USD')).toBe('-$5.00');
  });

  it('falls back to the currency code', () => {
    expect(formatMoney(100, 'CHF')).toBe('CHF 1.00');
  });
});

describe('parseMoney', () => {
  it('reads amounts with symbols and separators', () => {
    expect(parseMoney('€12.50')).toBe(1250);
    expect(parseMoney(' 1,234.5 ')).toBe(123450);
  });

  it('rejects empty, invalid and negative input', () => {
    expect(parseMoney('')).toBeNull();
    expect(parseMoney('twelve')).toBeNull();
    expect(parseMoney('-3')).toBeNull();
  });
});

describe('sumCents', () => {
  it('skips values that are not finite', () => {
    expect(sumCents([100, 250, Number.NaN, Number.POSITIVE_INFINITY])).toBe(350);
    expect(sumCents([])).toBe(0);
  });
});
