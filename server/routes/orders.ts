import express from 'express';
import { createOrder, findOrderLines, listOrders, summarizeOrders } from '../services/orderService';
import { listCustomers } from '../services/customerService';

const router = express.Router();

router.get('/', async (_req, res) => {
  const [orders, customers] = await Promise.all([listOrders(100), listCustomers()]);
  res.json(summarizeOrders(orders, customers));
});

router.get('/:id/items', async (req, res) => {
  res.json(await findOrderLines(req.params.id));
});

router.post('/', async (req, res) => {
  const order = await createOrder(req.body?.customerId, req.body?.lines ?? []);
  res.status(201).json(order);
});

export default router;
