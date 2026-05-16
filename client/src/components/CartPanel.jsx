import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useCheckout } from '../hooks/useOrders';
import { useToast } from '../context/ToastContext';

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
  const { showToast } = useToast();
  const [success, setSuccess] = useState(null);
  const [error, setError]     = useState('');

  // Sub-panel states
  const [showSubPanel, setShowSubPanel] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [cardType, setCardType] = useState('Debit Card');

  const handleIncrement = (item) => {
    if (item.quantity >= item.stock) {
      alert(`Only ${item.stock} units available for ${item.name}`);
      return;
    }
    updateQty(item._id, item.quantity + 1);
  };

  const handleMethodClick = (id) => {
    setPaymentMethod(id);
    setShowSubPanel(true);
  };

  const handleCheckout = async (subMethodInfo = '') => {
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
      // Create a descriptive payment method string for the order matching server enum
      let finalPaymentMethod = paymentMethod;
      
      if (paymentMethod === 'card') {
        finalPaymentMethod = cardType === 'Debit Card' ? 'card-debit' : 'card-credit';
      } else if (paymentMethod === 'wallet') {
        const walletMap = {
          'PhonePe': 'wallet-phonepe',
          'Google Pay': 'wallet-googlepay',
          'Paytm': 'wallet-paytm',
          'Amazon Pay': 'wallet-amazonpay'
        };
        finalPaymentMethod = walletMap[selectedWallet] || 'wallet';
      }
      
      const order = await checkout({
        paymentMethod: finalPaymentMethod
      });
      
      // 1. Optimistic stock update
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
      setShowSubPanel(false);
      setCashReceived('');
      setSelectedWallet('');

      // 3. Fetch fresh data from backend
      if (fetchProducts) {
        fetchProducts();
      }

      setSuccess(order);
      showToast('Payment successful!', 'success');
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.error || 'Checkout failed';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  // Success receipt
  if (success) {
    const printReceipt = () => window.print();
    
    return (
      <div className="cart-panel receipt-panel">
        {/* Screen UI */}
        <div className="receipt-screen-ui no-print">
          <div className="receipt-icon">✅</div>
          <h3 className="receipt-title">Payment Complete!</h3>
          <p className="receipt-order">{success.orderNumber}</p>
          <p className="receipt-total">{fmt(success.total)}</p>
          <div className="receipt-actions mt-6" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={printReceipt}>Print Receipt</button>
            <button className="btn btn-primary" onClick={() => setSuccess(null)}>New Transaction</button>
          </div>
        </div>

        {/* Printable Thermal Receipt (Hidden on screen) */}
        <div className="thermal-receipt print-only">
          <div className="receipt-header">
            <h2>Lumina POS</h2>
            <p>123 Business Street</p>
            <p>Phone: (555) 123-4567</p>
          </div>
          <div className="receipt-meta">
            <p>Order: {success.orderNumber}</p>
            <p>Date: {new Date(success.createdAt || Date.now()).toLocaleString()}</p>
            <p>Cashier: {success.cashier?.name || 'Staff'}</p>
          </div>
          <table className="receipt-items">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Item</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {success.items?.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ textAlign: 'left' }}>{item.name}<br/><small>{fmt(item.unitPrice)}</small></td>
                  <td style={{ textAlign: 'center', verticalAlign: 'top' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', verticalAlign: 'top' }}>{fmt(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="receipt-summary">
            <div className="summary-row"><span>Subtotal:</span><span>{fmt(success.subtotal)}</span></div>
            {success.discountAmount > 0 && <div className="summary-row"><span>Discount:</span><span>-{fmt(success.discountAmount)}</span></div>}
            <div className="summary-row"><span>Tax:</span><span>{fmt(success.taxAmount)}</span></div>
            <div className="summary-row grand-total"><span>Total:</span><span>{fmt(success.total)}</span></div>
          </div>
          <div className="receipt-meta" style={{ marginTop: '1rem' }}>
            <p>Payment Method: {success.paymentMethod.toUpperCase()}</p>
          </div>
          <div className="receipt-footer">
            <p>Thank you for your purchase!</p>
            <p>Please come again</p>
          </div>
        </div>
      </div>
    );
  }

  const rawTotal = parseFloat(String(total).replace(/[^0-9.]/g, '')) || 0;
  const rawCashReceived = parseFloat(String(cashReceived).replace(/[^0-9.]/g, '')) || 0;
  const isCashSufficient = rawCashReceived >= rawTotal;
  const changeToReturn = rawCashReceived - rawTotal;

  const qrAmount = parseFloat(String(total).replace(/[^0-9.]/g, '')) || 0;
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=lumina@upi&pn=LuminaPOS&am=${qrAmount}&cu=INR`)}`;

  return (
    <div className="cart-panel">
      {/* SECTION 1 - Cart Items (TOP) */}
      <div className="cart-main-section">
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
      </div>

      {/* SECTION 2 - Payment Panel (BOTTOM) */}
      <div className="cart-footer">
        {/* Totals */}
        <div className="cart-totals">
          <div className="totals-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
          <div className="totals-row"><span>Tax</span><span>{fmt(taxAmount)}</span></div>
          <div className="cart-discount" style={{ padding: '0.3rem 0', border: 'none' }}>
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
          {discount > 0 && (
            <div className="totals-row totals-discount">
              <span>Discount <em className="discount-pct">({discount}%)</em></span>
              <span>−{fmt(discountAmount)}</span>
            </div>
          )}
          <div className="totals-row totals-grand"><span>Total</span><span>{fmt(total)}</span></div>
        </div>

        {/* Payment Method */}
        <div className="payment-methods">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.id}
              className={`pay-method-btn ${paymentMethod === m.id ? 'active' : ''}`}
              onClick={() => handleMethodClick(m.id)}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {/* Payment Sub-Panels */}
        {showSubPanel && items.length > 0 && (
          <div className="payment-panel">
            {paymentMethod === 'cash' && (
              <div className="cash-panel">
                <div className="panel-title">💵 Cash Payment</div>
                <div className="info-box">Collect Cash Payment</div>
                <div className="amount-collect">
                  <span className="label">Amount to Collect</span>
                  <span className="value">{fmt(total)}</span>
                </div>
                <div className="form-group">
                  <label>Cash Received (₹)</label>
                  <input 
                    type="number" 
                    min={0}
                    placeholder="Enter amount..." 
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className={`change-row ${isCashSufficient ? 'success' : 'insufficient'}`}>
                  {cashReceived ? (
                    <>
                      <span>{isCashSufficient ? '✓ Change to return:' : 'Status:'}</span>
                      <span>{isCashSufficient ? `₹${changeToReturn.toFixed(2)}` : 'Insufficient amount'}</span>
                    </>
                  ) : null}
                </div>
                <div className="sticky-btn-wrapper">
                  <button 
                    className={`btn btn-primary btn-full mt-4 ${(!isCashSufficient || !cashReceived) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!isCashSufficient || !cashReceived || loading}
                    onClick={() => handleCheckout()}
                  >
                    Confirm Cash Payment
                  </button>
                </div>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div className="upi-panel">
                <div className="panel-title">📱 UPI Payment</div>
                <div className="qr-container">
                  <img src={upiQrUrl} alt="UPI QR" className="qr-image" />
                  <p className="qr-text">Scan to pay {fmt(total)}</p>
                  <span className="upi-id">lumina@upi</span>
                  <p className="upi-hint">Ask customer to scan and confirm payment</p>
                </div>
                <div className="sticky-btn-wrapper">
                  <button 
                    className="btn btn-primary btn-full mt-4"
                    disabled={loading}
                    onClick={() => handleCheckout()}
                  >
                    Payment Received
                  </button>
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="card-panel">
                <div className="panel-title">💳 Card Payment</div>
                <div className="card-type-pills">
                  {['Debit Card', 'Credit Card'].map(t => (
                    <button 
                      key={t}
                      className={`pill ${cardType === t ? 'active' : ''}`}
                      onClick={() => setCardType(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="card-brands">
                  <span>Visa</span><span>Mastercard</span><span>RuPay</span><span>Amex</span>
                </div>
                <div className="card-illustration">
                  <div className="chip"></div>
                  <div className="card-num">**** **** **** ****</div>
                </div>
                <p className="terminal-text">Swipe, insert or tap card on terminal</p>
                <div className="amount-collect" style={{ marginBottom: '0.5rem' }}>
                  <span className="value" style={{ fontSize: '1.1rem' }}>{fmt(total)}</span>
                </div>
                <div className="sticky-btn-wrapper">
                  <button 
                    className="btn btn-primary btn-full mt-2"
                    disabled={loading}
                    onClick={() => handleCheckout(cardType)}
                  >
                    Payment Done
                  </button>
                </div>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="wallet-panel">
                <div className="panel-title">👛 Digital Wallet</div>
                <div className="wallet-grid">
                  {[
                    { id: 'PhonePe', color: 'phonepe', icon: '🟣' },
                    { id: 'Google Pay', color: 'gpay', icon: '🌈' },
                    { id: 'Paytm', color: 'paytm', icon: '🔵' },
                    { id: 'Amazon Pay', color: 'amazon', icon: '🟠' },
                  ].map(w => (
                    <button 
                      key={w.id}
                      className={`wallet-btn ${w.color} ${selectedWallet === w.id ? 'active' : ''}`}
                      onClick={() => setSelectedWallet(w.id)}
                    >
                      <span className="wallet-icon">{w.icon}</span>
                      <span className="wallet-name">{w.id}</span>
                    </button>
                  ))}
                </div>
                
                {selectedWallet && (
                  <div className="qr-container mt-4" style={{ animation: 'slideDown 0.3s ease-out' }}>
                    <img src={upiQrUrl} alt="Wallet QR" className="qr-image" style={{ width: '120px', height: '120px' }} />
                    <p className="qr-text" style={{ fontSize: '0.75rem' }}>Scan with {selectedWallet}</p>
                    <div className="sticky-btn-wrapper">
                      <button 
                        className="btn btn-primary btn-full mt-2"
                        disabled={loading}
                        onClick={() => handleCheckout(selectedWallet)}
                      >
                        Payment Received
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {error && <p className="alert alert-error mt-2" style={{ margin: '0.5rem 0.75rem' }}>{error}</p>}

        {/* Checkout Button */}
        <button
          className="btn btn-primary btn-full btn-checkout"
          onClick={() => setShowSubPanel(true)}
          disabled={loading || items.length === 0 || showSubPanel}
        >
          {loading ? 'Processing…' : `Charge ${fmt(total)}`}
        </button>
      </div>
    </div>
  );
}
