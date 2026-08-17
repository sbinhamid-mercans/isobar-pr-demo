import { describe, expect, it } from 'vitest';
import { searchProducts } from './productService';
import type { Product } from '../../shared/types';

const products: Product[] = [
  { id: 'prd_1', sku: 'TEA-01', name: 'Breakfast tea', priceCents: 450, weightKg: 0.25, active: true },
  { id: 'prd_2', sku: 'MUG-02', name: 'Stoneware mug', priceCents: 1200, weightKg: 0.4, active: true },
  { id: 'prd_3', sku: 'POT-03', name: 'Tea pot', priceCents: 3200, weightKg: 1.1, active: true },
];

const ids = (list: Product[]) => list.map((p) => p.id);

describe('searchProducts', () => {
  it('returns everything for a blank query', () => {
    expect(searchProducts(products, '  ')).toBe(products);
  });

  it('matches a SKU prefix or a name fragment, ignoring case', () => {
    expect(ids(searchProducts(products, 'mug'))).toEqual(['prd_2']);
    expect(ids(searchProducts(products, ' TEA '))).toEqual(['prd_1', 'prd_3']);
    expect(ids(searchProducts(products, 'ware'))).toEqual(['prd_2']);
  });

  it('returns nothing when no product matches', () => {
    expect(searchProducts(products, 'kettle')).toEqual([]);
  });
});
