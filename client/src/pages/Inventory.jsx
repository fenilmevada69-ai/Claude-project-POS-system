import { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { categoriesAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Camera, Upload, X } from 'lucide-react';
import api from '../services/api';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

const EMPTY_FORM = {
  name: '', sku: '', price: '', costPrice: '', stock: '',
  lowStockThreshold: 10, taxRate: 0, category: '', description: '',
  image: '',
};

export default function Inventory() {
  const { products, loading, error, createProduct, updateProduct, deleteProduct, adjustStock } = useProducts({ limit: 100 });
  const [categories, setCategories] = useState([]);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(null); // null | 'add' | 'edit' | 'stock' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [stockAdj, setStockAdj] = useState({ adjustment: 0, reason: '' });
  const [saving, setSaving]     = useState(false);
  const { showToast }           = useToast();

  // ── Fetch categories once on mount ─────────────────────────────────────────
  useEffect(() => {
    categoriesAPI.getAll()
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => setCategories([])); // silently fall back to General option
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setForm(EMPTY_FORM); setModal('add'); };
  const openEdit = (p) => {
    setSelected(p);
    setForm({
      name: p.name || '', sku: p.sku || '', price: p.price || '', costPrice: p.costPrice || '',
      stock: p.stock || 0, lowStockThreshold: p.lowStockThreshold || 10, taxRate: p.taxRate || 0,
      category: p.category?._id || '', description: p.description || '', image: p.image || '',
    });
    setModal('edit');
  };
  const openStock  = (p) => { setSelected(p); setStockAdj({ adjustment: 0, reason: '' }); setModal('stock'); };
  const closeModal = () => { setModal(null); setSelected(null); setUploading(false); };

  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const { data } = await api.post('/products/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm({ ...form, image: data.imageUrl });
      showToast('Image uploaded successfully');
    } catch (e) {
      showToast('Image upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'add') {
        await createProduct(form);
        showToast('Product added successfully');
      } else {
        await updateProduct(selected._id, form);
        showToast('Product updated successfully');
      }
      closeModal();
    } catch (e) { 
      showToast(e.response?.data?.message || 'Save failed', 'error'); 
    }
    finally { setSaving(false); }
  };

  const handleStockSave = async () => {
    setSaving(true);
    try {
      await adjustStock(selected._id, Number(stockAdj.adjustment), stockAdj.reason);
      showToast('Stock adjusted successfully');
      closeModal();
    } catch (e) { 
      showToast(e.response?.data?.message || 'Adjustment failed', 'error'); 
    }
    finally { setSaving(false); }
  };

  const confirmDelete = (p) => {
    setSelected(p);
    setModal('delete');
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await deleteProduct(selected._id);
      showToast('Product deactivated successfully');
      closeModal();
    } catch (e) { 
      showToast(e.response?.data?.message || 'Delete failed', 'error'); 
    }
    finally { setSaving(false); }
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

      {loading && <LoadingSpinner fullPage />}
      {error   && <div className="alert alert-error">{error}</div>}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}></th>
              <th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Category</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p._id} className={p.isLowStock ? 'row-warning' : ''}>
                <td>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-2)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.image ? (
                      <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${p.image}`} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--brand)' }}>{p.name[0].toUpperCase()}</span>
                    )}
                  </div>
                </td>
                <td><strong>{p.name}</strong></td>
                <td><code className="sku-badge">{p.sku}</code></td>
                <td>{formatCurrency(p.price)}</td>
                <td>
                  <span className={`stock-badge ${p.isLowStock ? 'low' : 'ok'}`}>{p.stock}</span>
                </td>
                <td>{p.category?.name || '—'}</td>
                <td><span className={`status-pill ${p.isActive ? 'active' : 'inactive'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="actions-cell">
                  <button className="btn-icon" title="Edit"         onClick={() => openEdit(p)}>✏️</button>
                  <button className="btn-icon" title="Adjust Stock" onClick={() => openStock(p)}>📦</button>
                  <button className="btn-icon btn-danger" title="Delete" onClick={() => confirmDelete(p)}>🗑️</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr><td colSpan={7} className="empty-state">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────────── */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal === 'add' ? 'Add Product' : 'Edit Product'}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body grid-2">
              <div className="form-group span-2">
                <label>Product Image</label>
                <div 
                  className="image-upload-box"
                  onClick={() => document.getElementById('image-input').click()}
                  style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--radius)',
                    height: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    background: form.image ? 'none' : 'var(--surface-2)',
                    transition: 'border-color 0.2s'
                  }}
                >
                  {uploading ? (
                    <div className="spinner sm" />
                  ) : form.image ? (
                    <>
                      <img 
                        src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${form.image}`} 
                        alt="Preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                      />
                      <button 
                        className="btn-icon" 
                        style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.5)', color: 'white' }}
                        onClick={(e) => { e.stopPropagation(); setForm({ ...form, image: '' }); }}
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <Camera size={32} className="text-muted" />
                      <p style={{ fontSize: '0.8rem', marginTop: '8px' }} className="text-muted">Click to upload or drag & drop</p>
                      <p style={{ fontSize: '0.7rem' }} className="text-muted">JPG, PNG, WebP up to 2MB</p>
                    </>
                  )}
                  <input 
                    id="image-input" 
                    type="file" 
                    hidden 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                </div>
              </div>

              {[
                ['name',              'Product Name',      'text'],
                ['sku',               'SKU',               'text'],
                ['price',             'Selling Price (₹)', 'number'],
                ['costPrice',         'Cost Price (₹)',    'number'],
                ['stock',             'Stock Qty',         'number'],
                ['lowStockThreshold', 'Low Stock Alert',   'number'],
                ['taxRate',           'Tax Rate (%)',       'number'],
              ].map(([key, label, type]) => (
                <div className="form-group" key={key}>
                  <label>{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                </div>
              ))}

              {/* Category Dropdown */}
              <div className="form-group">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">— General / None —</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group span-2">
                <label>Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || uploading}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stock Adjustment Modal ───────────────────────────────────────────── */}
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
      {/* ── Delete Confirmation Modal ────────────────────────────────────────── */}
      {modal === 'delete' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to deactivate <strong>{selected?.name}</strong>?</p>
              <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>This action can be undone later by an admin.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>{saving ? 'Deleting…' : 'Yes, Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
