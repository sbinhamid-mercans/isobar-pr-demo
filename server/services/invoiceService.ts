import { pool } from '../db/pool';
import { formatMoney } from '../../shared/lib/money';
import { addDays, daysBetween } from '../../shared/lib/dates';
import { newId } from '../../shared/lib/ids';
import type { Customer, Invoice, InvoiceStatus, InvoiceSummary, Order, OrderLine, Tier } from '../../shared/types';

const PAYMENT_TERMS_DAYS = 30;
const GRACE_DAYS = 5;
const COLLECTIONS_AFTER_DAYS = 60;
const EXEMPT_SKU_PREFIX = 'BOOK-';
const PROMO_SKU_PREFIX = 'PROMO-';
const BULK_QUANTITY = 10;
const BULK_UNITS = 100;
const SMALL_ORDER_CENTS = 15_000;
const IMPORT_THRESHOLD_CENTS = 80_000;
const MAX_DISCOUNT_RATE = 0.25;
const TIER_DISCOUNT: Record<Tier, number> = { standard: 0, silver: 0.03, gold: 0.07 };

interface InvoiceRow {
  id: string;
  order_id: string;
  subtotal_cents: number;
  discount_cents: number;
  tax_cents: number;
  total_cents: number;
  due_at: Date;
  paid_at: Date | null;
}

function toInvoice(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    orderId: row.order_id,
    subtotalCents: row.subtotal_cents,
    discountCents: row.discount_cents,
    taxCents: row.tax_cents,
    totalCents: row.total_cents,
    dueAt: row.due_at.toISOString(),
    paidAt: row.paid_at?.toISOString(),
  };
}

export function lineTotal(line: OrderLine): number {
  if (line.quantity <= 0 || line.unitPriceCents < 0) return 0;
  return line.quantity * line.unitPriceCents;
}

export function applyDiscount(amountCents: number, tier: Tier, couponPercent = 0): number {
  if (couponPercent < 0 || couponPercent > 100) {
    throw new RangeError(`coupon must be between 0 and 100, got ${couponPercent}`);
  }
  if (amountCents <= 0) return 0;
  const rate = Math.min(TIER_DISCOUNT[tier] + couponPercent / 100, MAX_DISCOUNT_RATE);
  return Math.round(amountCents * rate);
}

