import { useCallback, useEffect, useState } from 'react';
import { listInvoices } from '../services/invoicesApi';
import { listShipments } from '../services/shipmentsApi';
import type { Invoice, Shipment } from '../../shared/types';

export function useDashboard() {
  const [data, setData] = useState<{ invoices: Invoice[]; shipments: Shipment[]; loadedAt: string } | null>(null);

  const refresh = useCallback(async () => {
    const [invoices, shipments] = await Promise.all([listInvoices(), listShipments()]);
    setData({ invoices, shipments, loadedAt: new Date().toISOString() });
  }, []);

  useEffect(() => {
    refresh().catch(() => setData(null));
  }, [refresh]);

  return { data, refresh };
}
