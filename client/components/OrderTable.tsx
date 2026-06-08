import { useOrders } from '../hooks/useOrders';
import type { OrderStatus } from '../../shared/types';

interface OrderTableProps {
  status: OrderStatus | 'all';
  onSelect?: (orderId: string) => void;
}

export function OrderTable(props: OrderTableProps) {
  const { orders, error } = useOrders();
  if (error) return <p role="alert">Could not load orders: {error}</p>;

  const rows = props.status === 'all' ? orders : orders.filter((o) => o.status === props.status);
  if (rows.length === 0) return <p>No orders match.</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>Order</th>
          <th>Customer</th>
          <th>Status</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((order) => (
          <tr key={order.id} onClick={() => props.onSelect?.(order.id)}>
            <td>{order.id}</td>
            <td>{order.customer}</td>
            <td>{order.status}</td>
            <td>{(order.totalCents / 100).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
