import { pool } from '../db/pool';
import { daysBetween } from '../../shared/lib/dates';
import type { ChurnRisk, Customer, Order, OrderStatus, OrderSummary, Tier } from '../../shared/types';

const GOLD_SPEND_CENTS = 500_000;
const SILVER_SPEND_CENTS = 150_000;
const GOLD_GRACE_CENTS = 350_000;
const DORMANT_DAYS = 180;
const QUIET_DAYS = 90;

interface CustomerRow {
  id: string;
  name: string;
  tier: Tier;
  region: Customer['region'];
  email: string;
}

interface CustomerOrderRow {
  id: string;
  status: OrderStatus;
  total_cents: string;
}

function toCustomer(row: CustomerRow): Customer {
  return { id: row.id, name: row.name, tier: row.tier, region: row.region, email: row.email };
}

export function tierFor(customer: Customer, spendCents: number): Tier {
  if (spendCents >= GOLD_SPEND_CENTS) return 'gold';
  // Lapsed gold customers drop to silver rather than standard while spend stays above the grace line.
  if (customer.tier === 'gold' && spendCents >= GOLD_GRACE_CENTS) return 'silver';
  if (spendCents >= SILVER_SPEND_CENTS) return 'silver';
  return 'standard';
}

export function churnRisk(customer: Customer, orders: Order[], now = new Date()): ChurnRisk {
  let latest = '';
  for (const order of orders) {
    if (order.createdAt > latest) latest = order.createdAt;
  }
  if (!latest) return 'high';
  const idle = daysBetween(latest, now.toISOString());
  if (idle > DORMANT_DAYS) return 'high';
  if (idle > QUIET_DAYS && customer.tier !== 'gold') return 'medium';
  return 'low';
}

export async function listCustomers(): Promise<Customer[]> {
  const { rows } = await pool.query<CustomerRow>(
    'SELECT id, name, tier, region, email FROM customers ORDER BY name LIMIT $1',
    [500],
  );
  return rows.map(toCustomer);
}

export async function findCustomer(id: string): Promise<Customer | undefined> {
  const { rows } = await pool.query<CustomerRow>('SELECT id, name, tier, region, email FROM customers WHERE id = $1', [
    id,
  ]);
  const row = rows[0];
  return row ? toCustomer(row) : undefined;
}

export async function customerOrders(customer: Customer): Promise<OrderSummary[]> {
  const { rows } = await pool.query<CustomerOrderRow>(
    'SELECT o.id, o.status, COALESCE(SUM(l.quantity * l.unit_price_cents), 0) AS total_cents FROM orders o LEFT JOIN order_lines l ON l.order_id = o.id WHERE o.customer_id = $1 GROUP BY o.id ORDER BY o.created_at DESC',
    [customer.id],
  );
  return rows.map((row) => ({
    id: row.id,
    customer: customer.name,
    totalCents: Number(row.total_cents),
    status: row.status,
  }));
}
