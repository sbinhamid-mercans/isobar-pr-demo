import express from 'express';
import { listProducts, productPage, searchProducts } from '../services/productService';

const router = express.Router();

router.get('/', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  const products = searchProducts(await listProducts(), q);
  res.json(productPage(products, req.query.page));
});

export default router;
