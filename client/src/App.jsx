import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Payment from './pages/Payment';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';

function RouteChangeListener() {
  const location = useLocation();
  
  useEffect(() => {
    const routeTitles = {
      '/dashboard': 'Dashboard | Lumina POS',
      '/payment': 'New Sale | Lumina POS',
      '/inventory': 'Inventory | Lumina POS',
      '/orders': 'Orders | Lumina POS',
      '/reports': 'Reports | Lumina POS',
      '/login': 'Login | Lumina POS',
    };
    document.title = routeTitles[location.pathname] || 'Lumina POS';
  }, [location]);

  return null;
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
            <Route path="/reports"   element={<Reports />} />
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
          <CartProvider>
            <RouteChangeListener />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/*"     element={<ProtectedLayout />} />
            </Routes>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
