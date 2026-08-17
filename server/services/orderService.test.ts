import { describe, expect, it } from 'vitest';
import { summarizeOrders } from './orderService';
import type { Customer, Order } from '../../shared/types';

const customers: Customer[] = [
  { id: 'cus_ada', name: 'Ada Lovelace', tier: 'standard', region: 'eu', email: 'ada@example.com' },
  { id: 'cus_bob', name: 'Bob Stone', tier: 'standard', region: 'local', email: 'bob@example.com' },
];

const orders: Order[] = [
  {
    id: 'ord_1',
    customerId: 'cus_ada',
    status: 'draft',
    createdAt: '2026-03-02T09:00:00.000Z',
    lines: [
      { sku: 'TEA-01', quantity: 2, unitPriceCents: 450 },
      { sku: 'MUG-02', quantity: 1, unitPriceCents: 1200 },
    ],
  },
  {
    id: 'ord_2',
    customerId: 'cus_bob',
    status: 'paid',
    createdAt: '2026-03-03T14:30:00.000Z',
    lines: [
      { sku: 'TEA-01', quantity: 3, unitPriceCents: 450 },
      { sku: 'GIFT-00', quantity: 0, unitPriceCents: 999 },
    ],
  },
];

describe('summarizeOrders', () => {
  it('joins customer names, totals the lines and keeps the status', () => {
    expect(summarizeOrders(orders, customers)).toEqual([
      { id: 'ord_1', customer: 'Ada Lovelace', totalCents: 2100, status: 'draft' },
      { id: 'ord_2', customer: 'Bob Stone', totalCents: 1350, status: 'paid' },
    ]);
  });

  it('labels orders whose customer is not loaded', () => {
    const [, second] = summarizeOrders(orders, customers.slice(0, 1));
    expect(second?.customer).toBe('unknown');
  });

  it('returns an empty list when there are no orders', () => {
    expect(summarizeOrders([], customers)).toEqual([]);
  });
});
