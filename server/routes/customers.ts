import express from 'express';
import { customerOrders, findCustomer, listCustomers } from '../services/customerService';

const router = express.Router();

router.get('/', async (_req, res) => {
  res.json(await listCustomers());
});

router.get('/:id/orders', async (req, res) => {
  const customer = await findCustomer(req.params.id);
  if (!customer) {
    res.status(404).json({ error: 'customer not found' });
    return;
  }
  res.json(await customerOrders(customer));
});

export default router;
