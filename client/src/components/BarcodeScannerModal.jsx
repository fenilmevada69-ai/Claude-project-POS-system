import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { X, Camera, Zap, ZapOff } from 'lucide-react';

export default function BarcodeScannerModal({ isOpen, onClose, onScan }) {
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
      return;
    }

    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    const startScanning = async () => {
      try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        if (videoInputDevices.length === 0) {
          console.error('No video input devices found');
          return;
        }

        // Use the back camera if available
        const selectedDevice = videoInputDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        ) || videoInputDevices[0];

        await codeReader.decodeFromVideoDevice(
          selectedDevice.deviceId,
          videoRef.current,
          (result, err) => {
            if (result) {
              onScan(result.getText());
              onClose();
            }
          }
        );

        // Check for torch support
        const stream = videoRef.current.srcObject;
        if (stream) {
          const track = stream.getVideoTracks()[0];
          const capabilities = track.getCapabilities();
          if (capabilities.torch) {
            setHasTorch(true);
          }
        }
      } catch (error) {
        console.error('Error starting barcode scanner:', error);
      }
    };

    startScanning();

    return () => {
      codeReader.reset();
    };
  }, [isOpen, onClose, onScan]);

  const toggleTorch = async () => {
    try {
      const stream = videoRef.current.srcObject;
      const track = stream.getVideoTracks()[0];
      await track.applyConstraints({
        advanced: [{ torch: !isTorchOn }]
      });
      setIsTorchOn(!isTorchOn);
    } catch (error) {
      console.error('Error toggling torch:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active">
      <div className="modal-container barcode-scanner-modal">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Scan Barcode</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body p-0 overflow-hidden relative bg-black flex items-center justify-center" style={{ minHeight: '300px' }}>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{ maxWidth: '400px', maxHeight: '300px' }}
          />
          <div className="absolute inset-0 border-2 border-purple-500 opacity-50 pointer-events-none m-12 rounded-lg" />
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 animate-pulse" />
          
          {hasTorch && (
            <button
              onClick={toggleTorch}
              className="absolute bottom-4 right-4 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all"
            >
              {isTorchOn ? <ZapOff className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
            </button>
          )}
        </div>

        <div className="modal-footer flex flex-col gap-2">
          <p className="text-sm text-gray-500 text-center">
            Position the barcode within the frame to scan
          </p>
          <div className="relative mt-2">
            <input
              type="text"
              placeholder="Or enter barcode manually..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onScan(e.target.value);
                  onClose();
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
