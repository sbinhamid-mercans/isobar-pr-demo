import type { Page, Product } from '../../shared/types';

export async function listProducts(): Promise<Page<Product>> {
  const res = await fetch('/api/products');
  if (!res.ok) throw new Error(`products: ${res.status}`);
  return res.json();
}

