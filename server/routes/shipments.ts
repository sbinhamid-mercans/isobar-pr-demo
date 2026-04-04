import express from 'express';
import { dispatch, findShipment, listShipments } from '../services/shipmentService';
import { canTransition } from '../services/orderService';

const router = express.Router();

router.get('/', async (_req, res) => {
  res.json(await listShipments());
});

router.patch('/:id', async (req, res) => {
  const shipment = await findShipment(req.params.id);
  if (!shipment) {
    res.status(404).json({ error: 'shipment not found' });
    return;
  }
  if (!canTransition(shipment.orderStatus, 'shipped')) {
    res.status(409).json({ error: `order is ${shipment.orderStatus}` });
    return;
  }
  res.json(await dispatch(shipment));
});

export default router;
