import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

const EMPTY_FORM = { name: '', sku: '', price: '', costPrice: '', stock: '', lowStockThreshold: 10, taxRate: 0, category: '', description: '' };

export default function Inventory() {
  const { products, loading, error, createProduct, updateProduct, deleteProduct, adjustStock, refetch } = useProducts({ limit: 100 });
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'stock'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [stockAdj, setStockAdj] = useState({ adjustment: 0, reason: '' });
  const [saving, setSaving] = useState(false);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(EMPTY_FORM); setModal('add'); };
  const openEdit = (p) => { setSelected(p); setForm({ name: p.name, sku: p.sku, price: p.price, costPrice: p.costPrice, stock: p.stock, lowStockThreshold: p.lowStockThreshold, taxRate: p.taxRate, category: p.category?._id || '', description: p.description }); setModal('edit'); };
  const openStock = (p) => { setSelected(p); setStockAdj({ adjustment: 0, reason: '' }); setModal('stock'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'add') await createProduct(form);
      else await updateProduct(selected._id, form);
      closeModal();
    } catch (e) { alert(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleStockSave = async () => {
    setSaving(true);
    try {
      await adjustStock(selected._id, Number(stockAdj.adjustment), stockAdj.reason);
      closeModal();
    } catch (e) { alert(e.response?.data?.message || 'Adjustment failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this product?')) return;
    await deleteProduct(id);
  };

  return (
    <div className="page inventory-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Inventory</h2>
          <p className="page-subtitle">{products.length} products total</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      <div className="toolbar">
        <input className="search-input" placeholder="Search by name or SKU…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading && <div className="page-loading"><div className="spinner" /></div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Category</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p._id} className={p.isLowStock ? 'row-warning' : ''}>
                <td><strong>{p.name}</strong></td>
                <td><code className="sku-badge">{p.sku}</code></td>
                <td>{formatCurrency(p.price)}</td>
                <td>
                  <span className={`stock-badge ${p.isLowStock ? 'low' : 'ok'}`}>{p.stock}</span>
                </td>
                <td>{p.category?.name || '—'}</td>
                <td><span className={`status-pill ${p.isActive ? 'active' : 'inactive'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="actions-cell">
                  <button className="btn-icon" title="Edit" onClick={() => openEdit(p)}>✏️</button>
                  <button className="btn-icon" title="Adjust Stock" onClick={() => openStock(p)}>📦</button>
                  <button className="btn-icon btn-danger" title="Delete" onClick={() => handleDelete(p._id)}>🗑️</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr><td colSpan={7} className="empty-state">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal === 'add' ? 'Add Product' : 'Edit Product'}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body grid-2">
              {[
                ['name', 'Product Name', 'text'],
                ['sku', 'SKU', 'text'],
                ['price', 'Selling Price (₹)', 'number'],
                ['costPrice', 'Cost Price (₹)', 'number'],
                ['stock', 'Stock Qty', 'number'],
                ['lowStockThreshold', 'Low Stock Alert', 'number'],
                ['taxRate', 'Tax Rate (%)', 'number'],
              ].map(([key, label, type]) => (
                <div className="form-group" key={key}>
                  <label>{label}</label>
                  <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}
              <div className="form-group span-2">
                <label>Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {modal === 'stock' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Adjust Stock — {selected?.name}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <p className="current-stock">Current stock: <strong>{selected?.stock}</strong></p>
              <div className="form-group">
                <label>Adjustment (+ to add, - to deduct)</label>
                <input type="number" value={stockAdj.adjustment} onChange={(e) => setStockAdj({ ...stockAdj, adjustment: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Reason</label>
                <input type="text" placeholder="e.g. Restock, Damage…" value={stockAdj.reason} onChange={(e) => setStockAdj({ ...stockAdj, reason: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleStockSave} disabled={saving}>{saving ? 'Saving…' : 'Update'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
