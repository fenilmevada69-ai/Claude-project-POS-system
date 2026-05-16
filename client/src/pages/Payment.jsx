import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Camera, Search, AlertCircle, Play } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useShift } from '../context/ShiftContext';
import CartPanel from '../components/CartPanel';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import BarcodeScannerModal from '../components/BarcodeScannerModal';

export default function Payment() {
  const { products, loading, params, setParams, setProducts, fetchProducts } = useProducts({ limit: 50 });
  const { addItem, items } = useCart();
  const { showToast } = useToast();
  const { activeShift } = useShift();
  const [search, setSearch] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  // For physical scanner detection
  const lastKeyTime = useRef(Date.now());
  const barcodeBuffer = useRef('');
  const searchInputRef = useRef(null);

  const handleAddToCart = (product) => {
    const existing = items.find((i) => i._id === product._id);
    if (existing && existing.quantity >= product.stock) {
      showToast(`Maximum stock reached for ${product.name}`, 'error');
      return;
    }
    addItem(product);
    showToast(`✓ ${product.name} added to cart`, 'success');
  };

  const handleBarcodeScan = async (code) => {
    try {
      const response = await api.get(`/products/barcode/${code}`);
      if (response.data.success) {
        handleAddToCart(response.data.product);
        setSearch(''); // Clear search after successful scan
        showToast(`✓ Barcode scanned: ${code}`, 'success');
        return true;
      }
      return false;
    } catch (error) {
      showToast(`Product not found for barcode: ${code}`, 'error');
      return false;
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    const now = Date.now();
    const diff = now - lastKeyTime.current;
    lastKeyTime.current = now;

    // Detection logic for physical scanners
    if (diff < 50) {
      // Fast typing, probably a scanner
      barcodeBuffer.current += value.slice(-1);
    } else {
      // Normal typing, reset buffer
      barcodeBuffer.current = value.slice(-1);
    }

    setSearch(value);

    // If we have a decent buffer and it was fast, check if it's a barcode
    if (barcodeBuffer.current.length >= 8 && diff < 100) {
      // Wait a bit to see if more comes in or if it's done
      const timeoutId = setTimeout(() => {
        if (Date.now() - lastKeyTime.current >= 300) {
          handleBarcodeScan(barcodeBuffer.current);
          barcodeBuffer.current = '';
        }
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && search) {
      if (barcodeBuffer.current.length >= 8) {
        handleBarcodeScan(search);
        setSearch('');
      }
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search))
  );

  if (!activeShift) {
    return (
      <div className="payment-layout relative">
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
          <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-6 border border-amber-500/20">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Shift Not Started</h2>
          <p className="text-slate-400 max-w-md mb-8 text-lg">
            You must start a daily shift before you can process any transactions. Please use the sidebar to start your shift.
          </p>
        </div>
        
        {/* Blurred background content */}
        <div className="product-panel opacity-30 pointer-events-none">
          <div className="product-panel-header flex items-center justify-between gap-4">
            <h2 className="page-title mb-0">Point of Sale</h2>
            <div className="flex-1 max-w-xl flex items-center gap-2">
              <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
                <div style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search products…"
                  style={{
                    width: '100%',
                    paddingLeft: '42px',
                    paddingRight: '16px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    color: '#e2e8f0',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                  disabled
                />
              </div>
            </div>
          </div>
          <div className="product-grid">
            <div className="h-64" />
          </div>
        </div>
        <div className="cart-panel opacity-30 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="payment-layout">
      {/* Left: Product Grid */}
      <div className="product-panel">
        <div className="product-panel-header flex items-center justify-between gap-4">
          <h2 className="page-title mb-0">Point of Sale</h2>
          
          <div className="flex-1 max-w-xl flex items-center gap-2">
            <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
              <div style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Search size={18} />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products or scan barcode…"
                value={search}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                autoFocus
                style={{
                  width: '100%',
                  paddingLeft: '42px',
                  paddingRight: '16px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '10px',
                  color: '#e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                }}
                onFocus={e => {
                  e.target.style.border = '1px solid rgba(124,58,237,0.6)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)';
                }}
                onBlur={e => {
                  e.target.style.border = '1px solid rgba(255,255,255,0.12)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <button
              onClick={() => setIsScannerOpen(true)}
              className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-colors border border-purple-500/20"
              title="Scan Barcode"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner fullPage />
        ) : (
          <div className="product-grid">
            {filtered.map((product) => (
              <ProductCard key={product._id} product={product} onAdd={() => handleAddToCart(product)} />
            ))}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Search className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-lg">No products found for "{search}"</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Cart */}
      <CartPanel setProducts={setProducts} fetchProducts={fetchProducts} />

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScan}
      />
    </div>
  );
}
