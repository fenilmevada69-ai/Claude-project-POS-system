import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShift } from '../context/ShiftContext';
import { LogOut, User, Settings, Shield, BarChart3, Users, ShoppingCart, Package, CreditCard, Home, Play, StopCircle, Clock } from 'lucide-react';
import AccountSettingsModal from './AccountSettingsModal';
import StartShiftModal from './StartShiftModal';
import EndShiftModal from './EndShiftModal';

const NAV_ITEMS = [
  { to: '/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
  { to: '/payment',   icon: <CreditCard size={20} />, label: 'Point of Sale' },
  { to: '/inventory', icon: <Package size={20} />, label: 'Inventory' },
  { to: '/orders',    icon: <ShoppingCart size={20} />, label: 'Orders' },
  { to: '/customers', icon: <Users size={20} />, label: 'Customers' },
  { to: '/staff',     icon: <Shield size={20} />, label: 'Staff', roles: ['admin', 'manager'] },
  { to: '/reports',   icon: <BarChart3 size={20} />, label: 'Reports' },
  { to: '/expenses',  icon: <Receipt size={20} />, label: 'Expenses', roles: ['admin', 'manager'] },
  { to: '/settings',  icon: <Settings size={20} />, label: 'Settings' },
];

function Receipt(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17.5V6.5" />
    </svg>
  )
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { activeShift } = useShift();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [timer, setTimer] = useState('00:00:00');

  useEffect(() => {
    let interval;
    if (activeShift) {
      interval = setInterval(() => {
        const start = new Date(activeShift.startTime).getTime();
        const now = new Date().getTime();
        const diff = now - start;
        
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        
        setTimer(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }, 1000);
    } else {
      setTimer('00:00:00');
    }
    return () => clearInterval(interval);
  }, [activeShift]);

  return (
    <aside className="sidebar flex flex-col h-screen bg-[#0f1117] border-r border-[#1e2130]">
      {/* Logo */}
      <div className="sidebar-logo p-6 border-b border-[#1e2130] flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-900/20">
          <span className="text-xl font-bold italic">L</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-[#e2e8f0]">Lumina<span className="text-purple-500">POS</span></span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav flex-1 overflow-y-auto p-4 space-y-1">
        {NAV_ITEMS.filter(item => !item.roles || item.roles.includes(user?.role)).map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => isActive ? {
              backgroundColor: 'rgba(124, 58, 237, 0.2)',
              color: '#a78bfa',
              borderLeft: '3px solid #7c3aed',
              borderRadius: '0 12px 12px 0',
              marginLeft: '-1rem',
              paddingLeft: '1.75rem'
            } : {}}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'font-bold' : 'text-[#9ca3af] hover:bg-purple-600/10 hover:text-[#c4b5fd]'}`}
          >
            {icon}
            <span className="text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Shift Management Section */}
      <div className="p-4 border-t border-[#1e2130] bg-[#1e2130]/30">
        {!activeShift ? (
          <button
            onClick={() => setIsStartModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-100 transition-all"
          >
            <Play size={16} fill="currentColor" />
            Start Shift
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Active Shift</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 font-mono text-xs">
                <Clock size={12} />
                {timer}
              </div>
            </div>
            <button
              onClick={() => setIsEndModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl font-bold text-sm transition-all"
            >
              <StopCircle size={16} />
              End Shift
            </button>
          </div>
        )}
      </div>

      {/* User footer */}
      <div className="sidebar-footer p-4 border-t border-[#1e2130] flex items-center gap-3 bg-[#0f1117]">
        <div 
          className="flex-1 flex items-center gap-3 cursor-pointer hover:bg-[#1e2130] p-2 rounded-xl transition-all"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="w-10 h-10 bg-[#1e2130] rounded-full flex items-center justify-center text-purple-400 font-bold border border-[#374151]">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#e2e8f0] truncate">{user?.name}</p>
            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider">{user?.role}</p>
          </div>
        </div>
        <button 
          className="p-2 text-[#9ca3af] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
          onClick={logout} 
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>

      <AccountSettingsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <StartShiftModal isOpen={isStartModalOpen} onClose={() => setIsStartModalOpen(false)} />
      <EndShiftModal isOpen={isEndModalOpen} onClose={() => setIsEndModalOpen(false)} />
    </aside>
  );
}
