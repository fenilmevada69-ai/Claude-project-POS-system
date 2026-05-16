import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Search, Loader2 } from 'lucide-react';

export default function BarcodeScannerModal({ isOpen, onClose, onScan }) {
  const [scannerInstance, setScannerInstance] = useState(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'success' | 'error' | null
  const manualInputRef = useRef(null);

  const beep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 1000;
      gain.gain.value = 0.1;
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 100);
    } catch (err) {
      console.warn("Audio feedback failed:", err);
    }
  };

  const handleBarcodeDetected = async (code) => {
    if (!code) return;
    
    setIsScanning(true);
    const success = await onScan(code);
    setIsScanning(false);

    if (success) {
      beep();
      setFeedback('success');
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 500);
    } else {
      setFeedback('error');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const startScanner = () => {
    const html5QrCode = new Html5Qrcode("barcode-reader");
    
    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 15,
        qrbox: { width: 300, height: 150 },
        aspectRatio: 1.6,
        // Using numeric IDs as requested for common retail formats
        // 0: QR_CODE, 5: CODE_128, 9: EAN_13, etc.
        formatsToSupport: [0, 1, 2, 3, 4, 5, 6, 8, 9, 13, 17, 18]
      },
      (decodedText) => {
        handleBarcodeDetected(decodedText);
      },
      (errorMessage) => {
        // Silently ignore scan errors
      }
    ).catch(err => {
      console.error("Scanner start error:", err);
    });
    
    setScannerInstance(html5QrCode);
  };

  const stopScanner = async () => {
    if (scannerInstance && scannerInstance.isScanning) {
      try {
        await scannerInstance.stop();
      } catch (err) {
        console.warn("Error stopping scanner:", err);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      startScanner();
      setTimeout(() => manualInputRef.current?.focus(), 500);
    } else {
      stopScanner();
    }
    return () => stopScanner();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active">
      <div className="modal-container barcode-scanner-modal max-w-md w-full">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Camera className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Scan Barcode</h3>
              <p className="text-xs text-gray-500">Align barcode within the frame</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="modal-body p-0 overflow-hidden relative bg-slate-950 flex flex-col items-center justify-center min-h-[320px]">
          {/* Scanner Viewport */}
          <div id="barcode-reader" className="w-full h-full min-h-[280px]"></div>
          
          {/* Overlay elements */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            {/* The Scanning Frame */}
            <div className={`relative w-[300px] h-[150px] border-2 transition-all duration-300 rounded-lg ${
              feedback === 'success' ? 'border-emerald-500 bg-emerald-500/10' : 
              feedback === 'error' ? 'border-rose-500 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 
              'border-purple-500/50'
            }`}>
              {/* Scan Line */}
              {!feedback && <div className="scan-line" />}
              
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-purple-500 -m-[2px]" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-purple-500 -m-[2px]" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-purple-500 -m-[2px]" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-purple-500 -m-[2px]" />
            </div>

            {/* Pulsing "Scanning..." Indicator */}
            <div className="mt-6 flex flex-col items-center gap-3">
              <div className="scanning-indicator flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-xs font-medium text-gray-300 uppercase tracking-widest">
                  {isScanning ? 'Processing...' : 'Scanning...'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 max-w-[200px] text-center">
                Hold steady. Works with EAN-13, QR Code, Code-128
              </p>
            </div>
          </div>
          
          {isScanning && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          )}
        </div>

        <div className="modal-footer flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                ref={manualInputRef}
                type="text"
                placeholder="Or enter barcode manually..."
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleBarcodeDetected(manualBarcode);
                }}
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white text-sm"
              />
            </div>
            <button 
              onClick={() => handleBarcodeDetected(manualBarcode)}
              disabled={!manualBarcode || isScanning}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all text-sm"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
