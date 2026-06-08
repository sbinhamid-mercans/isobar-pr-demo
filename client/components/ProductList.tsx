import { useProducts } from '../hooks/useProducts';

interface ProductListProps {
  query: string;
}

export function ProductList(props: ProductListProps) {
  const { products, revenue } = useProducts(props.query);

  return (
    <section>
      <h2>Products</h2>
      {revenue && <p>Billed this month: {(revenue.billedCents / 100).toFixed(2)}</p>}
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.sku} · {product.name} · {(product.priceCents / 100).toFixed(2)}
          </li>
        ))}
      </ul>
    </section>
  );
}
