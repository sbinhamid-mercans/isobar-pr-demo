import { useInvoices } from '../hooks/useInvoices';

interface InvoiceSummaryProps {
  limit?: number;
}

export function InvoiceSummary(props: InvoiceSummaryProps) {
  const { invoices, lines, sending, expand, send } = useInvoices();
  const unpaid = invoices.filter((invoice) => !invoice.paidAt).slice(0, props.limit ?? 10);

  return (
    <section>
      <h2>Unpaid invoices ({unpaid.length})</h2>
      <ul>
        {unpaid.map((invoice) => (
          <li key={invoice.id}>
            <button type="button" onClick={() => void expand(invoice)}>
              {invoice.id}
            </button>{' '}
            {(invoice.totalCents / 100).toFixed(2)} due {invoice.dueAt.slice(0, 10)}
            {lines[invoice.id] && <span> · {lines[invoice.id]?.length} lines</span>}
            <button type="button" disabled={sending === invoice.id} onClick={() => void send(invoice.id)}>
              Send
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
