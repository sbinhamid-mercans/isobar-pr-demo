export type Zone = 'local' | 'regional' | 'national' | 'eu' | 'world';

export type Tier = 'standard' | 'silver' | 'gold';

export type OrderStatus = 'draft' | 'paid' | 'shipped' | 'refunded' | 'priority';

export type InvoiceStatus = 'paid' | 'current' | 'overdue' | 'collections';

export type ChurnRisk = 'low' | 'medium' | 'high';

export interface OrderLine {
  sku: string;
  quantity: number;
  unitPriceCents: number;
}

export interface Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  lines: OrderLine[];
  createdAt: string;
  shippedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  tier: Tier;
  region: Zone;
  email: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  priceCents: number;
  weightKg: number;
  active: boolean;
}

export interface Invoice {
  id: string;
  orderId: string;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  dueAt: string;
  paidAt?: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  zone: Zone;
  weightKg: number;
  express: boolean;
  dispatchedAt?: string;
}

export interface OrderSummary {
  id: string;
  customer: string;
  totalCents: number;
  status: OrderStatus;
}

export interface InvoiceSummary {
  period: string;
  count: number;
  billedCents: number;
  paidCents: number;
  outstandingCents: number;
  overdueCount: number;
}

export interface NewOrder {
  customerId: string;
  lines: OrderLine[];
}

export interface Page<T> {
  items: T[];
  page: number;
  size: number;
  pages: number;
  total: number;
}

export interface SentInvoice {
  status: InvoiceStatus;
  lines: number;
  text: string;
}
