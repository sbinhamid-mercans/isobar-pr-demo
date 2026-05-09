import { useEffect, useState } from 'react';
import { getCustomerOrders, listCustomers } from '../services/customersApi';
import { createOrder, getOrderItems } from '../services/ordersApi';
import type { Customer, OrderSummary } from '../../shared/types';

export function useCustomers(customerId?: string) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [history, setHistory] = useState<OrderSummary[]>([]);

  useEffect(() => {
    listCustomers().then(setCustomers, () => setCustomers([]));
  }, []);

  useEffect(() => {
    if (!customerId) return;
    getCustomerOrders(customerId).then(setHistory, () => setHistory([]));
  }, [customerId]);

  // Copies the lines of a past order into a new draft for the same customer.
  async function reorder(orderId: string) {
    if (!customerId) return;
    const lines = await getOrderItems(orderId);
    await createOrder({ customerId, lines });
    setHistory(await getCustomerOrders(customerId));
  }

  const customer = customers.find((c) => c.id === customerId);
  return { customer, customers, history, reorder };
}
