import { Plus } from 'lucide-react';

const fmt = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

export default function ProductCard({ product, onAdd }) {
  const isLowStock = product.stock <= product.lowStockThreshold;
  const outOfStock = product.stock === 0;

  return (
    <div
      className={`product-card ${outOfStock ? 'product-card--disabled' : ''}`}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'transform 0.2s, border-color 0.2s',
        height: '100%'
      }}
    >
      {/* Product Image or Placeholder */}
      <div style={{ position: 'relative', width: '100%', height: '140px', overflow: 'hidden' }}>
        {product.image ? (
          <img 
            src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${product.image}`} 
            alt={product.name} 
            style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ 
            width: '100%', height: '140px', 
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.2)', fontSize: '2rem', fontWeight: 'bold'
          }}>
            {product.name?.[0].toUpperCase()}
          </div>
        )}

        {/* Stock Badge */}
        <div 
          className={`stock-pill ${outOfStock ? 'out' : isLowStock ? 'low' : 'ok'}`}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '0.7rem',
            fontWeight: '600',
            background: outOfStock ? 'rgba(244, 63, 94, 0.9)' : isLowStock ? 'rgba(245, 158, 11, 0.9)' : 'rgba(16, 185, 129, 0.9)',
            color: '#fff',
            backdropFilter: 'blur(4px)'
          }}
        >
          {outOfStock ? 'Out' : `${product.stock} left`}
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
        <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: '600', margin: 0 }}>{product.name}</h4>
        <p style={{ color: '#94a3b8', fontSize: '11px', margin: 0 }}>{product.sku}</p>
        
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#a78bfa', fontWeight: '700', fontSize: '16px' }}>{fmt(product.price)}</span>
          
          <button
            onClick={() => !outOfStock && onAdd(product)}
            disabled={outOfStock}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: outOfStock ? '#374151' : '#7c3aed',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: outOfStock ? 'not-allowed' : 'pointer',
              transition: 'transform 0.1s, background 0.2s',
              boxShadow: '0 4px 10px rgba(124, 58, 237, 0.3)'
            }}
            className="add-btn"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
