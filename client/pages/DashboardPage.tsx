import { InvoiceSummary } from '../components/InvoiceSummary';
import { ShipmentStatus } from '../components/ShipmentStatus';
import { useDashboard } from '../hooks/useDashboard';

export function DashboardPage() {
  const { data, refresh } = useDashboard();
  const openInvoices = data ? data.invoices.filter((i) => !i.paidAt).length : 0;
  const waiting = data ? data.shipments.filter((s) => !s.dispatchedAt).length : 0;

  return (
    <main>
      <header>
        <h1>Dashboard</h1>
        <button type="button" onClick={() => void refresh()}>
          Refresh
        </button>
        {data && <small>Updated {data.loadedAt.slice(11, 16)} UTC</small>}
      </header>
      <p>
        {openInvoices} open invoices · {waiting} shipments waiting
      </p>
      <InvoiceSummary limit={5} />
      <ShipmentStatus />
    </main>
  );
}
