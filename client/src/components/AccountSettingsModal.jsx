import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Eye, EyeOff, X } from 'lucide-react';

export default function AccountSettingsModal({ isOpen, onClose }) {
  const { user, setUser, logout } = useAuth();
  
  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName(user?.name || '');
      setProfileMessage(null);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Validation
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isLengthValid = newPassword.length >= 8;
  const isNewPasswordValid = hasUpperCase && hasNumber && isLengthValid;
  const isConfirmValid = newPassword === confirmPassword;
  const isNotSameAsCurrent = currentPassword !== newPassword;
  
  const canUpdatePassword = currentPassword && isNewPasswordValid && isConfirmValid && isNotSameAsCurrent && newPassword;

  // Handlers
  const handleProfileSave = async () => {
    try {
      setIsSavingProfile(true);
      setProfileMessage(null);
      const { data } = await authAPI.updateProfile({ name });
      setUser({ ...user, name: data.user.name });
      setProfileMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      setIsSavingPassword(true);
      setPasswordMessage(null);
      await authAPI.changePassword({ currentPassword, newPassword });
      setPasswordMessage({ type: 'success', text: 'Password updated successfully' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Role Badge Color
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'manager': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cashier': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal glass-panel" 
        style={{ width: '420px', background: 'var(--surface)', borderColor: 'var(--border)', animation: 'slideUp 0.3s ease-out' }} 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* HEADER */}
        <div style={{ padding: '2rem 1.5rem', textAlign: 'center', position: 'relative', borderBottom: '1px solid var(--border)' }}>
          <button 
            onClick={onClose} 
            style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
          
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1rem',
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 'bold', color: 'white',
            boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)'
          }}>
            {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
          </div>
          
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem' }}>{user?.name}</h2>
          <div style={{ display: 'inline-block', padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'capitalize', border: '1px solid transparent', marginBottom: '0.5rem' }} className={getRoleColor(user?.role)}>
            {user?.role}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>{user?.email}</p>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: '60vh' }}>
          
          {/* SECTION 1: Profile Info */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Profile Information</h3>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                className="search-input" 
                style={{ width: '100%' }} 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="text" 
                className="search-input" 
                style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }} 
                value={user?.email || ''} 
                disabled 
              />
            </div>
            
            {profileMessage && (
              <div style={{ padding: '0.5rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem', background: profileMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)', color: profileMessage.type === 'success' ? '#10b981' : '#f43f5e' }}>
                {profileMessage.text}
              </div>
            )}
            
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '0.5rem' }} 
              onClick={handleProfileSave}
              disabled={isSavingProfile || !name || name === user?.name}
            >
              {isSavingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          
          <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '0 0 2rem 0' }} />

          {/* SECTION 2: Change Password */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Change Password</h3>
            
            <div className="form-group" style={{ position: 'relative' }}>
              <label>Current Password</label>
              <input 
                type={showCurrent ? "text" : "password"} 
                className="search-input" 
                style={{ width: '100%', paddingRight: '40px' }} 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
              />
              <button 
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                style={{ position: 'absolute', right: '10px', top: '28px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            
            <div className="form-group" style={{ position: 'relative' }}>
              <label>New Password</label>
              <input 
                type={showNew ? "text" : "password"} 
                className="search-input" 
                style={{ width: '100%', paddingRight: '40px' }} 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
              />
              <button 
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{ position: 'absolute', right: '10px', top: '28px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {newPassword && !isNewPasswordValid && (
                <div style={{ color: '#f43f5e', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                  Must be at least 8 characters with 1 uppercase and 1 number.
                </div>
              )}
              {newPassword && !isNotSameAsCurrent && (
                <div style={{ color: '#f43f5e', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                  New password cannot be the same as current password.
                </div>
              )}
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label>Confirm New Password</label>
              <input 
                type={showConfirm ? "text" : "password"} 
                className="search-input" 
                style={{ width: '100%', paddingRight: '40px' }} 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
              />
              <button 
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{ position: 'absolute', right: '10px', top: '28px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {confirmPassword && !isConfirmValid && (
                <div style={{ color: '#f43f5e', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                  Passwords do not match.
                </div>
              )}
            </div>

            {passwordMessage && (
              <div style={{ padding: '0.5rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem', background: passwordMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)', color: passwordMessage.type === 'success' ? '#10b981' : '#f43f5e' }}>
                {passwordMessage.text}
              </div>
            )}

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '0.5rem' }} 
              onClick={handlePasswordUpdate}
              disabled={isSavingPassword || !canUpdatePassword}
            >
              {isSavingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '0 0 2rem 0' }} />

          {/* SECTION 3: Session Info */}
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Current Session</h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'grid', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Logged in as:</span>
                <span style={{ color: 'var(--text)', textTransform: 'capitalize' }}>{user?.role}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Session started:</span>
                <span style={{ color: 'var(--text)' }}>Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Terminal:</span>
                <span style={{ color: 'var(--text)' }}>POS-01</span>
              </div>
            </div>

            <button 
              className="btn btn-danger btn-full" 
              onClick={() => { onClose(); logout(); }}
            >
              Logout
            </button>
          </div>

        </div>
      </div>
      
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
