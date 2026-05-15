import { useState } from 'react';
import { useOrders } from '../hooks/useOrders';

const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

const STATUS_COLORS = { completed: 'success', pending: 'warning', cancelled: 'error', refunded: 'info', processing: 'warning' };
const PAYMENT_ICONS = { cash: '💵', card: '💳', upi: '📱', wallet: '👛', split: '🔀' };

export default function Orders() {
  const { orders, loading, error, meta, params, setParams, refetch, refundOrder } = useOrders();
  const [detail, setDetail] = useState(null);
  const [refundModal, setRefundModal] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleRefund = async () => {
    setProcessing(true);
    try {
      await refundOrder(refundModal._id, refundReason);
      setRefundModal(null);
      setRefundReason('');
    } catch (e) { alert(e.response?.data?.message || 'Refund failed'); }
    finally { setProcessing(false); }
  };

  return (
    <div className="page orders-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Orders</h2>
          <p className="page-subtitle">{meta.total} total orders</p>
        </div>
        <button className="btn btn-ghost" onClick={refetch}>↻ Refresh</button>
      </div>

      {/* Filters */}
      <div className="toolbar">
        {['', 'completed', 'pending', 'refunded', 'cancelled'].map((s) => (
          <button
            key={s}
            className={`tab-btn ${params.status === s ? 'active' : ''}`}
            onClick={() => setParams({ ...params, status: s || undefined, page: 1 })}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {loading && <div className="page-loading"><div className="spinner" /></div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Order #</th><th>Customer</th><th>Items</th><th>Payment</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td><code className="sku-badge">{o.orderNumber}</code></td>
                <td>{o.customer?.name || 'Walk-in'}</td>
                <td>{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</td>
                <td>{PAYMENT_ICONS[o.paymentMethod]} {o.paymentMethod}</td>
                <td><strong>{fmt(o.total)}</strong></td>
                <td><span className={`status-pill ${STATUS_COLORS[o.status]}`}>{o.status}</span></td>
                <td>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                <td className="actions-cell">
                  <button className="btn-icon" title="View" onClick={() => setDetail(o)}>👁️</button>
                  {o.status === 'completed' && (
                    <button className="btn-icon btn-danger" title="Refund" onClick={() => setRefundModal(o)}>↩️</button>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && !loading && (
              <tr><td colSpan={8} className="empty-state">No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.pages > 1 && (
        <div className="pagination">
          <button className="btn btn-ghost" disabled={params.page <= 1} onClick={() => setParams({ ...params, page: params.page - 1 })}>← Prev</button>
          <span>Page {params.page} of {meta.pages}</span>
          <button className="btn btn-ghost" disabled={params.page >= meta.pages} onClick={() => setParams({ ...params, page: params.page + 1 })}>Next →</button>
        </div>
      )}

      {/* Order Detail Modal */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order {detail.orderNumber}</h3>
              <button className="modal-close" onClick={() => setDetail(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="order-meta-grid">
                <div><span className="meta-label">Customer</span><span>{detail.customer?.name}</span></div>
                <div><span className="meta-label">Payment</span><span>{detail.paymentMethod}</span></div>
                <div><span className="meta-label">Status</span><span className={`status-pill ${STATUS_COLORS[detail.status]}`}>{detail.status}</span></div>
                <div><span className="meta-label">Date</span><span>{new Date(detail.createdAt).toLocaleString('en-IN')}</span></div>
              </div>
              <table className="data-table mt-4">
                <thead><tr><th>Product</th><th>SKU</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
                <tbody>
                  {detail.items.map((item, i) => (
                    <tr key={i}>
                      <td>{item.name}</td>
                      <td><code className="sku-badge">{item.sku}</code></td>
                      <td>{item.quantity}</td>
                      <td>{fmt(item.unitPrice)}</td>
                      <td>{fmt(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="order-totals">
                <div className="totals-row"><span>Subtotal</span><span>{fmt(detail.subtotal)}</span></div>
                <div className="totals-row"><span>Tax</span><span>{fmt(detail.taxAmount)}</span></div>
                <div className="totals-row"><span>Discount</span><span>-{fmt(detail.discountAmount)}</span></div>
                <div className="totals-row total"><span>Total</span><span>{fmt(detail.total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModal && (
        <div className="modal-overlay" onClick={() => setRefundModal(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Refund {refundModal.orderNumber}</h3>
              <button className="modal-close" onClick={() => setRefundModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="text-muted mb-3">This will restore stock and mark the order as refunded.</p>
              <div className="form-group">
                <label>Reason</label>
                <input type="text" placeholder="Customer return, wrong item…" value={refundReason} onChange={(e) => setRefundReason(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setRefundModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleRefund} disabled={processing}>{processing ? 'Processing…' : 'Confirm Refund'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
