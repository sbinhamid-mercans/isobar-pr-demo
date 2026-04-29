import { pool } from '../db/pool';
import { newId } from '../../shared/lib/ids';
import { requireString } from '../../shared/lib/validation';
import type { Customer, Order, OrderLine, OrderStatus, OrderSummary } from '../../shared/types';

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ['paid', 'priority'],
  priority: ['paid'],
  paid: ['shipped', 'refunded'],
  shipped: ['refunded'],
  refunded: [],
};

interface OrderRow {
  id: string;
  customer_id: string;
  status: OrderStatus;
  created_at: Date;
  shipped_at: Date | null;
}

interface LineRow {
  order_id: string;
  sku: string;
  quantity: number;
  unit_price_cents: number;
}

function toOrder(row: OrderRow, lines: OrderLine[]): Order {
  return {
    id: row.id,
    customerId: row.customer_id,
    status: row.status,
    lines,
    createdAt: row.created_at.toISOString(),
    shippedAt: row.shipped_at?.toISOString(),
  };
}

async function linesFor(orderIds: string[]): Promise<Map<string, OrderLine[]>> {
  const byOrder = new Map<string, OrderLine[]>();
  if (orderIds.length === 0) return byOrder;
  const { rows } = await pool.query<LineRow>(
    'SELECT order_id, sku, quantity, unit_price_cents FROM order_lines WHERE order_id = ANY($1)',
    [orderIds],
  );
  for (const row of rows) {
    const lines = byOrder.get(row.order_id) ?? [];
    lines.push({ sku: row.sku, quantity: row.quantity, unitPriceCents: row.unit_price_cents });
    byOrder.set(row.order_id, lines);
  }
  return byOrder;
}

export function orderTotal(order: Order): number {
  let total = 0;
  for (const line of order.lines) {
    if (line.quantity > 0) total += line.quantity * line.unitPriceCents;
  }
  return total;
}

export function summarizeOrders(orders: Order[], customers: Customer[]): OrderSummary[] {
  if (orders.length === 0) return [];
  const byId = new Map(customers.map((c) => [c.id, c]));
  return orders.map((order) => ({
    id: order.id,
    customer: byId.get(order.customerId)?.name ?? 'unknown',
    totalCents: orderTotal(order),
    status: order.status,
  }));
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return false;
  return TRANSITIONS[from].includes(to);
}

