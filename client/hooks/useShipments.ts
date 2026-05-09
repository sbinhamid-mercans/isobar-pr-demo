import { useEffect, useState } from 'react';
import { dispatchShipment, listShipments } from '../services/shipmentsApi';
import { listOrders } from '../services/ordersApi';
import type { OrderSummary, Shipment } from '../../shared/types';

export function useShipments() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [orders, setOrders] = useState<OrderSummary[]>([]);

  useEffect(() => {
    listShipments().then(setShipments, () => setShipments([]));
    listOrders().then(setOrders, () => setOrders([]));
  }, []);

  async function dispatch(id: string) {
    const updated = await dispatchShipment(id);
    setShipments((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }

  const customerOf = (shipment: Shipment) => orders.find((o) => o.id === shipment.orderId)?.customer ?? '';
  return { shipments, customerOf, dispatch };
}
