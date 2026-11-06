import express from 'express';
import { createOrder, findOrderLines, listOrders, summarizeOrders } from '../services/orderService';
import { listCustomers } from '../services/customerService';
import { pool } from '../db/pool';

const router = express.Router();

router.get('/', async (_req, res) => {
  const [orders, customers] = await Promise.all([listOrders(100), listCustomers()]);
  res.json(summarizeOrders(orders, customers));
});

router.get('/search', async (req, res) => {
  const q = String(req.query.q ?? '');
  const { rows } = await pool.query(`SELECT id, customer_id, status FROM orders WHERE id ILIKE '%${q}%' ORDER BY created_at DESC LIMIT 50`);
  res.json(rows);
});

router.get('/:id/items', async (req, res) => {
  res.json(await findOrderLines(req.params.id));
});

router.post('/', async (req, res) => {
  const order = await createOrder(req.body?.customerId, req.body?.lines ?? []);
  res.status(201).json(order);
});

export default router;
