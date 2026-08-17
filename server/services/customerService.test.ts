import { describe, expect, it } from 'vitest';
import { churnRisk, tierFor } from './customerService';
import type { Customer, Order } from '../../shared/types';

const standard: Customer = { id: 'cus_1', name: 'Ada', tier: 'standard', region: 'eu', email: 'ada@example.com' };
const gold: Customer = { ...standard, id: 'cus_2', tier: 'gold' };
const now = new Date('2026-06-30T12:00:00.000Z');

function orderOn(createdAt: string): Order {
  return { id: `ord_${createdAt}`, customerId: standard.id, status: 'paid', lines: [], createdAt };
}

describe('tierFor', () => {
  it('promotes on spend thresholds', () => {
    expect(tierFor(standard, 500_000)).toBe('gold');
    expect(tierFor(standard, 150_000)).toBe('silver');
    expect(tierFor(standard, 149_999)).toBe('standard');
  });

  it('keeps lapsed gold customers at silver above the grace line', () => {
    expect(tierFor(gold, 400_000)).toBe('silver');
    expect(tierFor(gold, 100_000)).toBe('standard');
  });
});

describe('churnRisk', () => {
  it('is high with no orders or a long silence', () => {
    expect(churnRisk(standard, [], now)).toBe('high');
    expect(churnRisk(standard, [orderOn('2025-11-01T00:00:00.000Z')], now)).toBe('high');
  });

  it('is medium after a quiet quarter unless the customer is gold', () => {
    const orders = [orderOn('2026-01-01T00:00:00.000Z'), orderOn('2026-03-01T00:00:00.000Z')];
    expect(churnRisk(standard, orders, now)).toBe('medium');
    expect(churnRisk(gold, orders, now)).toBe('low');
  });

  it('is low for recent buyers', () => {
    expect(churnRisk(standard, [orderOn('2026-06-20T00:00:00.000Z')], now)).toBe('low');
  });
});
