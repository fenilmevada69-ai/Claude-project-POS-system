import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useCheckout } from '../hooks/useOrders';

const fmt = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

const PAYMENT_METHODS = [
  { id: 'cash',   label: 'Cash',   icon: '💵' },
  { id: 'card',   label: 'Card',   icon: '💳' },
  { id: 'upi',    label: 'UPI',    icon: '📱' },
  { id: 'wallet', label: 'Wallet', icon: '👛' },
];

export default function CartPanel({ setProducts, fetchProducts }) {
  const {
    items, subtotal, taxAmount, discountAmount, total, discount, paymentMethod,
    removeItem, updateQty, setDiscount, setPaymentMethod, clearCart,
  } = useCart();

  const { checkout, loading } = useCheckout();
  const [success, setSuccess] = useState(null);
  const [error, setError]     = useState('');

  const handleIncrement = (item) => {
    if (item.quantity >= item.stock) {
      alert(`Only ${item.stock} units available for ${item.name}`);
      return;
    }
    updateQty(item._id, item.quantity + 1);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setError('');

    // Final stock validation loop
    for (const item of items) {
      if (item.quantity > item.stock) {
        setError(`Insufficient stock for ${item.name}. Available: ${item.stock}`);
        return;
      }
    }

    try {
      const order = await checkout();
      
      // 1. Optimistic stock update (using cart data — cart must still exist here)
      if (setProducts && Array.isArray(items)) {
        setProducts(prev => {
          if (!Array.isArray(prev)) return prev;
          return prev.map(p => {
            const cartItem = items.find(c => c._id === p._id);
            if (cartItem) {
              return { ...p, stock: p.stock - cartItem.quantity };
            }
            return p;
          });
        });
      }

      // 2. Clear cart
      clearCart();

      // 3. Fetch fresh data from backend
      if (fetchProducts) {
        fetchProducts();
      }

      setSuccess(order);
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data?.error || 'Checkout failed');
    }
  };

  // Success receipt
  if (success) {
    return (
      <div className="cart-panel receipt-panel">
        <div className="receipt-icon">✅</div>
        <h3 className="receipt-title">Payment Complete!</h3>
        <p className="receipt-order">{success.orderNumber}</p>
        <p className="receipt-total">{fmt(success.total)}</p>
        <button 
          className="btn btn-primary mt-6" 
          style={{ width: '200px', marginInline: 'auto' }}
          onClick={() => setSuccess(null)}
        >
          New Transaction
        </button>
      </div>
    );
  }

  return (
    <div className="cart-panel">
      {/* Header */}
      <div className="cart-header">
        <h3>Cart <span className="cart-count">{items.length}</span></h3>
        {items.length > 0 && (
          <button className="btn-link" onClick={clearCart}>Clear all</button>
        )}
      </div>

      {/* Items */}
      <div className="cart-items">
        {items.length === 0 && (
          <div className="cart-empty">
            <span className="cart-empty-icon">🛒</span>
            <p>Add products to get started</p>
          </div>
        )}
        {items.map((item) => (
          <div key={item._id} className="cart-item">
            <div className="cart-item-info">
              <p className="cart-item-name">{item.name}</p>
              <p className="cart-item-price">{fmt(item.price)} × {item.quantity} = {fmt(item.price * item.quantity)}</p>
            </div>
            <div className="cart-item-controls">
              <button className="qty-btn" onClick={() => updateQty(item._id, item.quantity - 1)}>−</button>
              <span className="qty-val">{item.quantity}</span>
              <button
                className="qty-btn"
                onClick={() => handleIncrement(item)}
              >
                +
              </button>
              <button className="remove-btn" onClick={() => removeItem(item._id)}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Discount */}
      <div className="cart-discount">
        <label>Discount (%)</label>
        <input
          type="number"
          min={0}
          max={100}
          placeholder="0"
          value={discount}
          onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
          className="discount-input"
        />
      </div>

      {/* Payment Method */}
      <div className="payment-methods">
        {PAYMENT_METHODS.map((m) => (
          <button
            key={m.id}
            className={`pay-method-btn ${paymentMethod === m.id ? 'active' : ''}`}
            onClick={() => setPaymentMethod(m.id)}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* Totals */}
      <div className="cart-totals">
        <div className="totals-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
        <div className="totals-row"><span>Tax</span><span>{fmt(taxAmount)}</span></div>
        {discount > 0 && (
          <div className="totals-row totals-discount">
            <span>Discount <em className="discount-pct">({discount}%)</em></span>
            <span>−{fmt(discountAmount)}</span>
          </div>
        )}
        <div className="totals-row totals-grand"><span>Total</span><span>{fmt(total)}</span></div>
      </div>

      {error && <p className="alert alert-error mt-2">{error}</p>}

      {/* Checkout */}
      <button
        className="btn btn-primary btn-full btn-checkout"
        onClick={handleCheckout}
        disabled={loading || items.length === 0}
      >
        {loading ? 'Processing…' : `Charge ${fmt(total)}`}
      </button>
    </div>
  );
}
