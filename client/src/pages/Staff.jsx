import { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, UserPlus, Shield, User, Lock, Edit3, Trash2, 
  MoreVertical, CheckCircle, XCircle, Search, Mail, Key
} from 'lucide-react';

const ROLE_BADGES = {
  admin: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  manager: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  cashier: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
};

const INITIAL_FORM = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'cashier',
  isActive: true
};

export default function Staff() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [resetData, setResetData] = useState({ password: '', confirmPassword: '', userId: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await usersAPI.getAll();
      setUsers(data.users);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        password: '',
        confirmPassword: ''
      });
    } else {
      setEditingUser(null);
      setFormData(INITIAL_FORM);
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      if (editingUser) {
        await usersAPI.update(editingUser._id, formData);
      } else {
        await usersAPI.create(formData);
      }
      fetchUsers();
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await usersAPI.delete(id);
      fetchUsers();
    } catch (err) {
      alert('Failed to deactivate user');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetData.password !== resetData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      await usersAPI.resetPassword(resetData.userId, resetData.password);
      setIsResetModalOpen(false);
      setResetData({ password: '', confirmPassword: '', userId: '' });
      alert('Password reset successful');
    } catch (err) {
      alert('Failed to reset password');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    cashiers: users.filter(u => u.role === 'cashier').length,
    managers: users.filter(u => u.role === 'manager').length
  };

  const getTimeAgo = (date) => {
    if (!date) return 'Never';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="page staff-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Staff Management</h2>
          <p className="page-subtitle">Manage system users and their permissions</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <UserPlus size={18} /> Add Staff
        </button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card" style={{ '--accent': '#6366f1' }}>
          <div className="kpi-icon"><Users /></div>
          <div>
            <p className="kpi-label">Total Staff</p>
            <p className="kpi-value">{stats.total}</p>
          </div>
        </div>
        <div className="kpi-card" style={{ '--accent': '#10b981' }}>
          <div className="kpi-icon"><CheckCircle /></div>
          <div>
            <p className="kpi-label">Active</p>
            <p className="kpi-value">{stats.active}</p>
          </div>
        </div>
        <div className="kpi-card" style={{ '--accent': '#0ea5e9' }}>
          <div className="kpi-icon"><User /></div>
          <div>
            <p className="kpi-label">Cashiers</p>
            <p className="kpi-value">{stats.cashiers}</p>
          </div>
        </div>
        <div className="kpi-card" style={{ '--accent': '#a855f7' }}>
          <div className="kpi-icon"><Shield /></div>
          <div>
            <p className="kpi-label">Managers</p>
            <p className="kpi-value">{stats.managers}</p>
          </div>
        </div>
      </div>

      <div className="toolbar mt-4">
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search staff..." 
            style={{ paddingLeft: '40px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrap mt-4">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}></th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th style={{ width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u._id}>
                <td>
                  <div style={{ 
                    width: '36px', height: '36px', borderRadius: '50%', 
                    background: 'var(--surface-2)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', color: 'var(--brand)'
                  }}>
                    {u.name[0].toUpperCase()}
                  </div>
                </td>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td>
                  <span className={`status-pill ${ROLE_BADGES[u.role]}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ 
                      width: '8px', height: '8px', borderRadius: '50%', 
                      background: u.isActive ? '#10b981' : '#f43f5e' 
                    }} />
                    {u.isActive ? 'Active' : 'Inactive'}
                  </div>
                </td>
                <td className="text-muted">{getTimeAgo(u.lastLogin)}</td>
                <td className="actions-cell">
                  <button className="btn-icon" onClick={() => handleOpenModal(u)} title="Edit"><Edit3 size={16} /></button>
                  {currentUser.role === 'admin' && (
                    <>
                      <button className="btn-icon" onClick={() => {
                        setResetData({ ...resetData, userId: u._id });
                        setIsResetModalOpen(true);
                      }} title="Reset Password"><Key size={16} /></button>
                      <button className="btn-icon btn-danger" onClick={() => handleDeactivate(u._id)} title="Deactivate"><Trash2 size={16} /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingUser ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    required 
                    className="search-input" 
                    style={{ width: '100%' }}
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    required 
                    className="search-input" 
                    style={{ width: '100%' }}
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select 
                    className="search-input" 
                    style={{ width: '100%' }}
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="cashier">Cashier</option>
                    <option value="manager">Manager</option>
                    {currentUser.role === 'admin' && <option value="admin">Admin</option>}
                  </select>
                </div>
                
                {(!editingUser || formData.password) && (
                  <div className="grid-2 mt-3">
                    <div className="form-group">
                      <label>{editingUser ? 'New Password (Optional)' : 'Password'}</label>
                      <input 
                        type="password" 
                        required={!editingUser}
                        className="search-input" 
                        style={{ width: '100%' }}
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirm Password</label>
                      <input 
                        type="password" 
                        required={!editingUser || formData.password}
                        className="search-input" 
                        style={{ width: '100%' }}
                        value={formData.confirmPassword}
                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="form-group mt-3" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    id="isActive"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <label htmlFor="isActive" style={{ margin: 0 }}>Account Active</label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetModalOpen && (
        <div className="modal-overlay">
          <div className="modal modal-sm">
            <div className="modal-header">
              <h3>Reset Password</h3>
              <button className="modal-close" onClick={() => setIsResetModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleResetPassword}>
              <div className="modal-body">
                <div className="form-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    required 
                    className="search-input" 
                    style={{ width: '100%' }}
                    value={resetData.password}
                    onChange={e => setResetData({ ...resetData, password: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    required 
                    className="search-input" 
                    style={{ width: '100%' }}
                    value={resetData.confirmPassword}
                    onChange={e => setResetData({ ...resetData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsResetModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Reset Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
