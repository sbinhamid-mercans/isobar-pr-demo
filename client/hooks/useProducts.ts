import { useEffect, useState } from 'react';
import { listProducts, searchProducts } from '../services/productsApi';
import { fetchRevenue } from '../services/reportsApi';
import type { InvoiceSummary, Product } from '../../shared/types';

export function useProducts(query = '') {
  const [products, setProducts] = useState<Product[]>([]);
  const [revenue, setRevenue] = useState<InvoiceSummary | null>(null);

  useEffect(() => {
    const load = query ? searchProducts(query) : listProducts();
    load.then((page) => setProducts(page.items), () => setProducts([]));
  }, [query]);

  useEffect(() => {
    const period = new Date().toISOString().slice(0, 7);
    fetchRevenue(period).then(setRevenue, () => setRevenue(null));
  }, []);

  return { products, revenue };
}
