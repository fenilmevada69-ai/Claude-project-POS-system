import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import CartPanel from '../components/CartPanel';
import ProductCard from '../components/ProductCard';

export default function Payment() {
  const { products, loading, params, setParams, setProducts, fetchProducts } = useProducts({ limit: 50 });
  const { addItem, items } = useCart();
  const [search, setSearch] = useState('');

  const handleAddToCart = (product) => {
    const existing = items.find((i) => i._id === product._id);
    if (existing && existing.quantity >= product.stock) {
      alert(`Maximum stock reached for ${product.name}`);
      return;
    }
    addItem(product);
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="payment-layout">
      {/* Left: Product Grid */}
      <div className="product-panel">
        <div className="product-panel-header">
          <h2 className="page-title">Point of Sale</h2>
          <input
            className="search-input"
            type="text"
            placeholder="Search products or scan barcode…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : (
          <div className="product-grid">
            {filtered.map((product) => (
              <ProductCard key={product._id} product={product} onAdd={() => handleAddToCart(product)} />
            ))}
            {filtered.length === 0 && <p className="empty-state">No products found.</p>}
          </div>
        )}
      </div>

      {/* Right: Cart */}
      <CartPanel setProducts={setProducts} fetchProducts={fetchProducts} />
    </div>
  );
}
