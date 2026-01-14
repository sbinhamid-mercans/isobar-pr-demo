import express from 'express';
import ordersRouter from './routes/orders';
import customersRouter from './routes/customers';
import productsRouter from './routes/products';
import invoicesRouter from './routes/invoices';
import shipmentsRouter from './routes/shipments';

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/orders', ordersRouter);
  app.use('/api/customers', customersRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/invoices', invoicesRouter);
  app.use('/api/shipments', shipmentsRouter);
  return app;
}
