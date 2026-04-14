import type { Invoice, SentInvoice } from '../../shared/types';

export async function listInvoices(): Promise<Invoice[]> {
  const res = await fetch('/api/invoices');
  if (!res.ok) throw new Error(`invoices: ${res.status}`);
  return res.json();
}

export async function sendInvoice(id: string): Promise<SentInvoice> {
  const res = await fetch(`/api/invoices/${id}/send`, { method: 'POST' });
  if (!res.ok) throw new Error(`send invoice ${id}: ${res.status}`);
  return res.json();
}
