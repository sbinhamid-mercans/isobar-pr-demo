import { useCustomers } from '../hooks/useCustomers';

interface CustomerCardProps {
  customerId: string;
}

export function CustomerCard(props: CustomerCardProps) {
  const { customer, history, reorder } = useCustomers(props.customerId);
  if (!customer) return <article>Loading customer…</article>;

  const last = history[0];
  return (
    <article>
      <h3>{customer.name}</h3>
      <p>
        {customer.email} · {customer.tier} · {customer.region}
      </p>
      <p>{history.length} orders</p>
      {last && (
        <button type="button" onClick={() => void reorder(last.id)}>
          Repeat order {last.id}
        </button>
      )}
    </article>
  );
}
