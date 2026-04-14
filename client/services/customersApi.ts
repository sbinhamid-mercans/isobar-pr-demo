import type { Customer, OrderSummary } from '../../shared/types';

export async function listCustomers(): Promise<Customer[]> {
  const res = await fetch('/api/customers');
  if (!res.ok) throw new Error(`customers: ${res.status}`);
  return res.json();
}

export async function getCustomerOrders(id: string): Promise<OrderSummary[]> {
  const res = await fetch(`/api/customers/${id}/orders`);
  if (!res.ok) throw new Error(`customer ${id} orders: ${res.status}`);
  return res.json();
}
