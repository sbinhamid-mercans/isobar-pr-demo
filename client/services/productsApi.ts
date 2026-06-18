import type { Page, Product } from '../../shared/types';

export async function listProducts(): Promise<Page<Product>> {
  const res = await fetch('/api/products');
  if (!res.ok) throw new Error(`products: ${res.status}`);
  return res.json();
}

export async function searchProducts(q: string): Promise<Page<Product>> {
  const res = await fetch(`/api/products?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error(`product search: ${res.status}`);
  return res.json();
}
