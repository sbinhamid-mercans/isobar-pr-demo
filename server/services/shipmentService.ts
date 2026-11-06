import { pool } from '../db/pool';
import { addDays } from '../../shared/lib/dates';
import type { OrderStatus, Shipment, Zone } from '../../shared/types';

const ZONE_DAYS: Record<Zone, { standard: number; express: number; heavy: number; heavyTwice: boolean }> = {
  local: { standard: 2, express: 1, heavy: 1, heavyTwice: false },
  regional: { standard: 4, express: 2, heavy: 1, heavyTwice: true },
  national: { standard: 6, express: 3, heavy: 2, heavyTwice: false },
  eu: { standard: 8, express: 4, heavy: 2, heavyTwice: true },
  world: { standard: 14, express: 6, heavy: 3, heavyTwice: true },
};

interface ShipmentRow {
  id: string;
  order_id: string;
  zone: Zone;
  weight_kg: string;
  express: boolean;
  dispatched_at: Date | null;
}

function toShipment(row: ShipmentRow): Shipment {
  return {
    id: row.id,
    orderId: row.order_id,
    zone: row.zone,
    weightKg: Number(row.weight_kg),
    express: row.express,
    dispatchedAt: row.dispatched_at?.toISOString(),
  };
}

export function estimateDelivery(zone: Zone, weightKg: number, express: boolean): number {
  const rule = ZONE_DAYS[zone] as (typeof ZONE_DAYS)[Zone] | undefined;
  if (!rule) return 21;
  const surcharges = (weightKg > 20 ? 1 : 0) + (rule.heavyTwice && weightKg > 50 ? 1 : 0);
  return (express ? rule.express : rule.standard) + surcharges * rule.heavy;
}

export async function listShipments(): Promise<Shipment[]> {
  const { rows } = await pool.query<ShipmentRow>(
    'SELECT id, order_id, zone, weight_kg, express, dispatched_at FROM shipments ORDER BY id DESC LIMIT $1',
    [200],
  );
  return rows.map(toShipment);
}

export async function findShipment(id: string): Promise<(Shipment & { orderStatus: OrderStatus }) | undefined> {
  const { rows } = await pool.query<ShipmentRow & { order_status: OrderStatus }>(
    'SELECT s.id, s.order_id, s.zone, s.weight_kg, s.express, s.dispatched_at, o.status AS order_status FROM shipments s JOIN orders o ON o.id = s.order_id WHERE s.id = $1',
    [id],
  );
  const row = rows[0];
  return row ? { ...toShipment(row), orderStatus: row.order_status } : undefined;
}

export async function dispatch(shipment: Shipment): Promise<Shipment & { expectedAt: string }> {
  const dispatchedAt = shipment.dispatchedAt ?? new Date().toISOString();
  const expectedAt = addDays(dispatchedAt, estimateDelivery(shipment.zone, shipment.weightKg, shipment.express));
  await pool.query('UPDATE shipments SET dispatched_at = $1 WHERE id = $2', [dispatchedAt, shipment.id]);
  await pool.query('UPDATE orders SET status = $1, shipped_at = $2 WHERE id = $3', [
    'shipped',
    dispatchedAt,
    shipment.orderId,
  ]);
  return { ...shipment, dispatchedAt, expectedAt };
}
