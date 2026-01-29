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

