import { useShipments } from '../hooks/useShipments';

interface ShipmentStatusProps {
  expressOnly?: boolean;
}

export function ShipmentStatus(props: ShipmentStatusProps) {
  const { shipments, customerOf, dispatch } = useShipments();
  const visible = props.expressOnly ? shipments.filter((s) => s.express) : shipments;

  return (
    <section>
      <h2>Shipments</h2>
      <ul>
        {visible.map((shipment) => (
          <li key={shipment.id}>
            {shipment.id} · {customerOf(shipment)} · {shipment.zone} · {shipment.weightKg} kg{' '}
            {shipment.dispatchedAt ? (
              `dispatched ${shipment.dispatchedAt.slice(0, 10)}`
            ) : (
              <button type="button" onClick={() => void dispatch(shipment.id)}>
                Dispatch
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
