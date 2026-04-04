import express from 'express';
import {
  findInvoice,
  formatInvoice,
  listInvoices,
  markInvoiceSent,
  overdueStatus,
  summarizeInvoices,
} from '../services/invoiceService';
import { findOrderLines } from '../services/orderService';

const router = express.Router();

router.get('/', async (req, res) => {
  const invoices = await listInvoices(req.query.status === 'open' ? 'open' : undefined);
  const period = typeof req.query.period === 'string' ? req.query.period : '';
  res.json(period ? summarizeInvoices(invoices, period) : invoices);
});

router.post('/:id/send', async (req, res) => {
  const invoice = await findInvoice(req.params.id);
  if (!invoice) {
    res.status(404).json({ error: 'invoice not found' });
    return;
  }
  const lines = await findOrderLines(invoice.orderId);
  await markInvoiceSent(invoice.id);
  res.json({ status: overdueStatus(invoice), lines: lines.length, text: formatInvoice(invoice) });
});

export default router;
