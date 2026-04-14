import type { Shipment } from '../../shared/types';

export async function listShipments(): Promise<Shipment[]> {
  const res = await fetch('/api/shipments');
  if (!res.ok) throw new Error(`shipments: ${res.status}`);
  return res.json();
}

export async function dispatchShipment(id: string): Promise<Shipment & { expectedAt: string }> {
  const res = await fetch(`/api/shipments/${id}`, { method: 'PATCH' });
  if (!res.ok) throw new Error(`dispatch ${id}: ${res.status}`);
  return res.json();
}
