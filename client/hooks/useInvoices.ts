import { useEffect, useState } from 'react';
import { listInvoices, sendInvoice } from '../services/invoicesApi';
import { getOrderItems } from '../services/ordersApi';
import type { Invoice, OrderLine } from '../../shared/types';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [lines, setLines] = useState<Record<string, OrderLine[]>>({});
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    listInvoices().then(setInvoices, () => setInvoices([]));
  }, []);

  async function expand(invoice: Invoice) {
    const items = await getOrderItems(invoice.orderId);
    setLines((prev) => ({ ...prev, [invoice.id]: items }));
  }

  async function send(id: string) {
    setSending(id);
    try {
      await sendInvoice(id);
    } finally {
      setSending(null);
    }
  }

  return { invoices, lines, sending, expand, send };
}
