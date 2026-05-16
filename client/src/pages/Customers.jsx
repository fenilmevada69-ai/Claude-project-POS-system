import { useState, useEffect } from 'react';
import { customersAPI } from '../services/api';
import { 
  Users, UserPlus, Search, Phone, Mail, MapPin, 
  History, Star, Edit3, Trash2, ExternalLink
} from 'lucide-react';

const INITIAL_FORM = {
  name: '',
  phone: '',
  email: '',
  address: ''
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (searchTerm = '') => {
    try {
      const { data } = await customersAPI.getAll({ search: searchTerm });
      setCustomers(data.customers);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    fetchCustomers(val);
  };

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address || ''
      });
    } else {
      setEditingCustomer(null);
      setFormData(INITIAL_FORM);
    }
    setIsModalOpen(true);
  };

  const handleViewHistory = async (customer) => {
    try {
      const { data } = await customersAPI.getOne(customer._id);
      setSelectedCustomer(data.customer);
      setOrderHistory(data.orderHistory);
      setIsHistoryModalOpen(true);
    } catch (err) {
      alert('Failed to fetch history');
    }
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await customersAPI.update(editingCustomer._id, formData);
      } else {
        await customersAPI.create(formData);
      }
      fetchCustomers(search);
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const stats = {
    total: customers.length,
    newThisMonth: customers.filter(c => new Date(c.createdAt) > new Date(new Date().setDate(1))).length,
    avgPoints: customers.length ? Math.round(customers.reduce((acc, c) => acc + c.loyaltyPoints, 0) / customers.length) : 0,
    topCustomer: customers.length ? [...customers].sort((a, b) => b.totalSpent - a.totalSpent)[0] : null
  };

  return (
    <div className="page customers-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Customer Management</h2>
          <p className="page-subtitle">Track customer loyalty and order history</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <UserPlus size={18} /> Add Customer
        </button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card" style={{ '--accent': '#6366f1' }}>
          <div className="kpi-icon"><Users /></div>
          <div>
            <p className="kpi-label">Total Customers</p>
            <p className="kpi-value">{stats.total}</p>
          </div>
        </div>
        <div className="kpi-card" style={{ '--accent': '#10b981' }}>
          <div className="kpi-icon"><Star /></div>
          <div>
            <p className="kpi-label">Avg. Loyalty Points</p>
            <p className="kpi-value">{stats.avgPoints}</p>
          </div>
        </div>
        <div className="kpi-card" style={{ '--accent': '#f59e0b' }}>
          <div className="kpi-icon"><History /></div>
          <div>
            <p className="kpi-label">New This Month</p>
            <p className="kpi-value">{stats.newThisMonth}</p>
          </div>
        </div>
        <div className="kpi-card" style={{ '--accent': '#ec4899' }}>
          <div className="kpi-icon"><Star /></div>
          <div>
            <p className="kpi-label">Top Spender</p>
            <p className="kpi-value" style={{ fontSize: '1rem' }}>{stats.topCustomer?.name || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="toolbar mt-4">
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search by name or phone..." 
            style={{ paddingLeft: '40px', width: '100%' }}
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="table-wrap mt-4">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Loyalty Points</th>
              <th>Total Spent</th>
              <th>Orders</th>
              <th>Last Visit</th>
              <th style={{ width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--brand)' }}>
                      {c.name[0].toUpperCase()}
                    </div>
                    <strong>{c.name}</strong>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Phone size={12} className="text-muted" /> {c.phone}</div>
                    {c.email && <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Mail size={12} className="text-muted" /> {c.email}</div>}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--brand)', fontWeight: 'bold' }}>
                    <Star size={14} fill="currentColor" /> {c.loyaltyPoints}
                  </div>
                </td>
                <td>₹{c.totalSpent?.toLocaleString()}</td>
                <td>{c.ordersCount}</td>
                <td className="text-muted">{c.lastVisit ? new Date(c.lastVisit).toLocaleDateString() : 'Never'}</td>
                <td className="actions-cell">
                  <button className="btn-icon" onClick={() => handleViewHistory(c)} title="History"><History size={16} /></button>
                  <button className="btn-icon" onClick={() => handleOpenModal(c)} title="Edit"><Edit3 size={16} /></button>
                  <button className="btn-icon btn-danger" title="Delete"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {!loading && customers.length === 0 && (
              <tr><td colSpan={7} className="empty-state">No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveCustomer}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" required className="search-input" style={{ width: '100%' }}
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="text" required className="search-input" style={{ width: '100%' }}
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group mt-3">
                  <label>Email Address (Optional)</label>
                  <input 
                    type="email" className="search-input" style={{ width: '100%' }}
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group mt-3">
                  <label>Address (Optional)</label>
                  <textarea 
                    className="search-input" style={{ width: '100%', minHeight: '80px' }}
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryModalOpen && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3>Order History — {selectedCustomer?.name}</h3>
              <button className="modal-close" onClick={() => setIsHistoryModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="grid-3 mb-4">
                <div className="kpi-card" style={{ padding: '15px' }}>
                  <p className="kpi-label">Total Spent</p>
                  <p className="kpi-value" style={{ fontSize: '1.2rem' }}>₹{selectedCustomer?.totalSpent?.toLocaleString()}</p>
                </div>
                <div className="kpi-card" style={{ padding: '15px' }}>
                  <p className="kpi-label">Points Balance</p>
                  <p className="kpi-value" style={{ fontSize: '1.2rem' }}>{selectedCustomer?.loyaltyPoints}</p>
                </div>
                <div className="kpi-card" style={{ padding: '15px' }}>
                  <p className="kpi-label">Total Orders</p>
                  <p className="kpi-value" style={{ fontSize: '1.2rem' }}>{selectedCustomer?.ordersCount}</p>
                </div>
              </div>
              
              <h4 className="mb-2">Recent Orders</h4>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderHistory.map(order => (
                      <tr key={order._id}>
                        <td><code>{order.orderNumber}</code></td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>{order.items.length}</td>
                        <td>₹{order.totalAmount}</td>
                        <td><span className={`status-pill ${order.status}`}>{order.status}</span></td>
                      </tr>
                    ))}
                    {orderHistory.length === 0 && (
                      <tr><td colSpan={5} className="empty-state">No order history found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setIsHistoryModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
