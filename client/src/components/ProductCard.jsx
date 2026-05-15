const fmt = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

export default function ProductCard({ product, onAdd }) {
  const isLowStock = product.stock <= product.lowStockThreshold;
  const outOfStock = product.stock === 0;

  return (
    <button
      className={`product-card ${outOfStock ? 'product-card--disabled' : ''}`}
      onClick={() => !outOfStock && onAdd(product)}
      disabled={outOfStock}
      aria-label={`Add ${product.name} to cart`}
    >
      {/* Category color strip */}
      <div className="card-strip" style={{ background: product.category?.color || '#6366f1' }} />

      <div className="card-body">
        <p className="card-name">{product.name}</p>
        <p className="card-sku">{product.sku}</p>
        <div className="card-footer">
          <span className="card-price">{fmt(product.price)}</span>
          <span className={`stock-pill ${outOfStock ? 'out' : isLowStock ? 'low' : 'ok'}`}>
            {outOfStock ? 'Out of stock' : `${product.stock} left`}
          </span>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="card-add-overlay">
        <span>+ Add</span>
      </div>
    </button>
  );
}
