import type { NewOrder, Order, OrderLine, OrderSummary } from '../../shared/types';

export async function listOrders(): Promise<OrderSummary[]> {
  const res = await fetch('/api/orders');
  if (!res.ok) throw new Error(`orders: ${res.status}`);
  return res.json();
}

