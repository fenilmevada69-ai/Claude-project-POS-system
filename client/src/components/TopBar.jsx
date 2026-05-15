import { useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard',     subtitle: 'Sales overview & KPIs' },
  '/payment':   { title: 'Point of Sale', subtitle: 'New transaction' },
  '/inventory': { title: 'Inventory',     subtitle: 'Product management' },
  '/orders':    { title: 'Orders',        subtitle: 'Order history & refunds' },
  '/reports':   { title: 'Reports',       subtitle: 'Analytics & insights' },
};

export default function TopBar() {
  const { pathname } = useLocation();
  const { itemCount } = useCart();
  const meta = PAGE_TITLES[pathname] || { title: 'Lumina POS', subtitle: '' };

  const now = new Date().toLocaleString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{meta.title}</h1>
        <span className="topbar-subtitle">{meta.subtitle}</span>
      </div>
      <div className="topbar-right">
        <span className="topbar-clock">{now}</span>
        {itemCount > 0 && (
          <span className="cart-badge" title={`${itemCount} item(s) in cart`}>
            🛒 <strong>{itemCount}</strong>
          </span>
        )}
      </div>
    </header>
  );
}
