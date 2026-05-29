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

export function taxFor(customer: Customer, subtotalCents: number, lines: OrderLine[]): number {
  const exempt = lines.some((line) => line.sku.startsWith(EXEMPT_SKU_PREFIX));
  const units = lines.reduce((sum, line) => sum + line.quantity, 0);
  let rate: number;
  if (customer.region === 'local') {
    rate = 0.08;
    if (exempt) rate = 0;
  } else if (customer.region === 'regional') {
    rate = 0.1;
    if (exempt) rate = 0.02;
    if (units > BULK_UNITS) rate -= 0.01;
  } else if (customer.region === 'national') {
    rate = 0.12;
    if (exempt && customer.tier !== 'standard') rate = 0.05;
  } else if (customer.region === 'eu') {
    rate = 0.2;
    if (subtotalCents < SMALL_ORDER_CENTS) rate = 0;
  } else if (customer.region === 'world') {
    rate = 0;
    if (subtotalCents > IMPORT_THRESHOLD_CENTS) rate = 0.05;
  } else {
    rate = 0.12;
  }
  return Math.round(subtotalCents * rate);
}

export function roundCents(value: number, mode: 'half-up' | 'bankers' = 'half-up'): number {
  // 'bankers' sends exact halves to the even neighbour.
  if (mode === 'half-up') return Math.round(value);
  const floor = Math.floor(value);
  if (value - floor !== 0.5) return Math.round(value);
  return floor % 2 === 0 ? floor : floor + 1;
}

export function buildInvoice(order: Order, customer: Customer, issuedAt = new Date()): Invoice {
  if (order.status === 'draft' || order.status === 'refunded') {
    throw new Error(`order ${order.id} cannot be invoiced while ${order.status}`);
  }
  let subtotal = 0;
  let discount = 0;
  for (const line of order.lines) {
    const total = lineTotal(line);
    if (total === 0) continue;
    subtotal += total;
    if (line.sku.startsWith(PROMO_SKU_PREFIX)) {
      discount += line.quantity >= BULK_QUANTITY ? total * 0.1 : total * 0.05;
    } else if (customer.tier !== 'standard') {
      discount += applyDiscount(total, customer.tier);
    }
  }
  if (discount > subtotal) discount = subtotal;
  const discountCents = roundCents(discount, 'bankers');
  const taxCents = taxFor(customer, subtotal - discountCents, order.lines);
  return {
    id: newId('inv'),
    orderId: order.id,
    subtotalCents: subtotal,
    discountCents,
    taxCents,
    totalCents: subtotal - discountCents + taxCents,
    dueAt: addDays(issuedAt.toISOString(), PAYMENT_TERMS_DAYS),
  };
}

export function overdueStatus(invoice: Invoice, now = new Date()): InvoiceStatus {
  if (invoice.paidAt) return 'paid';
  const late = daysBetween(invoice.dueAt, now.toISOString());
  if (late <= GRACE_DAYS) return 'current';
  if (late > COLLECTIONS_AFTER_DAYS) return 'collections';
  return 'overdue';
}

export function formatInvoice(invoice: Invoice, currency = 'EUR'): string {
  const rows = [
    `Invoice ${invoice.id} (order ${invoice.orderId})`,
    `Subtotal ${formatMoney(invoice.subtotalCents, currency)}`,
  ];
  if (invoice.discountCents > 0) rows.push(`Discount -${formatMoney(invoice.discountCents, currency)}`);
  if (invoice.taxCents > 0) {
    rows.push(`Tax ${formatMoney(invoice.taxCents, currency)}`);
  } else {
    rows.push('Tax exempt');
  }
  rows.push(`Total ${formatMoney(invoice.totalCents, currency)}`);
  rows.push(invoice.paidAt ? `Paid ${invoice.paidAt.slice(0, 10)}` : `Due ${invoice.dueAt.slice(0, 10)}`);
  return rows.join('\n');
}

