import { useState } from 'react';
import { CustomerCard } from '../components/CustomerCard';
import { FilterBar } from '../components/FilterBar';
import { OrderTable } from '../components/OrderTable';
import { ProductList } from '../components/ProductList';
import { useOrders } from '../hooks/useOrders';
import type { OrderStatus } from '../../shared/types';

export function OrdersPage() {
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [customerId, setCustomerId] = useState('');
  const { customers } = useOrders();

  return (
    <main>
      <h1>Orders</h1>
      <FilterBar status={status} query={query} onStatusChange={setStatus} onQueryChange={setQuery} />
      <OrderTable status={status} />
      <aside>
        <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
          <option value="">Pick a customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {customerId && <CustomerCard customerId={customerId} />}
      </aside>
      <ProductList query={query} />
    </main>
  );
}
