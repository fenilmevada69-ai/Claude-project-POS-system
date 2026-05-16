import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { ShiftProvider } from './context/ShiftContext';
import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Payment from './pages/Payment';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Reports from './pages/Reports';
import Staff from './pages/Staff';
import Customers from './pages/Customers';
import Expenses from './pages/Expenses';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function RouteChangeListener() {
  const location = useLocation();
  
  useEffect(() => {
    const routeTitles = {
      '/dashboard': 'Dashboard | Lumina POS',
      '/payment': 'New Sale | Lumina POS',
      '/inventory': 'Inventory | Lumina POS',
      '/orders': 'Orders | Lumina POS',
      '/staff': 'Staff | Lumina POS',
      '/customers': 'Customers | Lumina POS',
      '/reports': 'Reports | Lumina POS',
      '/expenses': 'Expenses | Lumina POS',
      '/settings': 'Settings | Lumina POS',
      '/login': 'Login | Lumina POS',
    };
    document.title = routeTitles[location.pathname] || 'Lumina POS';
  }, [location]);

  return null;
}

function RoleRoute({ children, roles }) {
  const { user } = useAuth();
  if (!roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="app-loading"><div className="spinner lg" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <TopBar />
        <main className="content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/payment"   element={<Payment />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/orders"    element={<Orders />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/staff"     element={<RoleRoute roles={['admin', 'manager']}><Staff /></RoleRoute>} />
            <Route path="/reports"   element={<Reports />} />
            <Route path="/expenses"  element={<RoleRoute roles={['admin', 'manager']}><Expenses /></RoleRoute>} />
            <Route path="/settings"  element={<Settings />} />
            <Route path="*"          element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ShiftProvider>
            <CartProvider>
              <RouteChangeListener />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/*"     element={<ProtectedLayout />} />
              </Routes>
            </CartProvider>
          </ShiftProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
