import { useEffect, useState } from 'react';
import { listOrders } from '../services/ordersApi';
import { listCustomers } from '../services/customersApi';
import type { Customer, OrderSummary } from '../../shared/types';

export function useOrders() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([listOrders(), listCustomers()])
      .then(([nextOrders, nextCustomers]) => {
        if (!active) return;
        setOrders(nextOrders);
        setCustomers(nextCustomers);
      })
      .catch((err: unknown) => {
        if (active) setError(String(err));
      });
    return () => {
      active = false;
    };
  }, []);

  return { orders, customers, error };
}
