import { useDashboard } from '../hooks/useDashboard';
import type { Invoice, InvoiceSummary } from '../../shared/types';

export async function fetchDashboard(): Promise<Invoice[]> {
  const res = await fetch('/api/invoices?status=open');
  if (!res.ok) throw new Error(`dashboard: ${res.status}`);
  return res.json();
}

// `period` is YYYY-MM; the invoices route summarises when it is present.
export async function fetchRevenue(period: string): Promise<InvoiceSummary> {
  const res = await fetch(`/api/invoices?period=${encodeURIComponent(period)}`);
  if (!res.ok) throw new Error(`revenue ${period}: ${res.status}`);
  return res.json();
}

export function prefetchDashboard() {
  return useDashboard().refresh();
}

export async function exportOrdersReport(): Promise<Blob> {
  const res = await fetch('/api/orders/export');
  if (!res.ok) throw new Error(`orders export: ${res.status}`);
  return res.blob();
}
