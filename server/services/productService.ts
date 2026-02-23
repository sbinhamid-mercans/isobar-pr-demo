import { pool } from '../db/pool';
import { paginate } from '../../shared/lib/pagination';
import { toPositiveInt } from '../../shared/lib/validation';
import type { Product } from '../../shared/types';

const PAGE_SIZE = 25;

interface ProductRow {
  id: string;
  sku: string;
  name: string;
  price_cents: number;
  weight_kg: string;
  active: boolean;
}

export async function listProducts(): Promise<Product[]> {
  const { rows } = await pool.query<ProductRow>(
    'SELECT id, sku, name, price_cents, weight_kg, active FROM products WHERE active = $1 ORDER BY name',
    [true],
  );
  return rows.map((row) => ({
    id: row.id,
    sku: row.sku,
    name: row.name,
    priceCents: row.price_cents,
    weightKg: Number(row.weight_kg),
    active: row.active,
  }));
}

export function searchProducts(products: Product[], q: string): Product[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return products;
  return products.filter((p) => p.sku.toLowerCase().startsWith(needle) || p.name.toLowerCase().indexOf(needle) >= 0);
}

export function productPage(products: Product[], page: unknown) {
  return paginate(products, toPositiveInt(page, 1), PAGE_SIZE);
}
