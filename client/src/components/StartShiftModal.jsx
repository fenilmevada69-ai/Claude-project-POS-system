import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShift } from '../context/ShiftContext';
import { X, Sun, LogIn } from 'lucide-react';

export default function StartShiftModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { startShift } = useShift();
  const [openingCash, setOpeningCash] = useState('');
  const [terminal, setTerminal] = useState('POS-01');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await startShift(Number(openingCash), terminal);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active">
      <div className="modal-container max-w-md">
        <div className="modal-header border-b-0 pb-0">
          <button onClick={onClose} className="ml-auto p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="modal-body pt-0 text-center">
          <div className="w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sun className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Good Morning, {user?.name}!</h2>
          <p className="text-slate-400 mb-8">Ready to start your work day?</p>
          
          <form onSubmit={handleSubmit} className="text-left space-y-6">
            <div className="form-group">
              <label className="text-sm font-semibold text-slate-300 mb-2 block">
                Opening Cash in Drawer (₹)
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium group-focus-within:text-purple-400">₹</span>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-slate-800 outline-none transition-all text-lg font-semibold text-white"
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="text-sm font-semibold text-slate-300 mb-2 block">
                Shift Notes (Optional)
              </label>
              <textarea
                placeholder="Any opening remarks or observations..."
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-slate-800 outline-none transition-all text-white min-h-[100px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="text-sm font-semibold text-slate-300 mb-2 block">
                Terminal ID
              </label>
              <select
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-slate-800 outline-none transition-all text-white"
                value={terminal}
                onChange={(e) => setTerminal(e.target.value)}
              >
                <option value="POS-01">POS Terminal 01</option>
                <option value="POS-02">POS Terminal 02</option>
                <option value="MOBILE-01">Mobile POS 01</option>
              </select>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-purple-200 transition-all disabled:opacity-50"
            >
              {loading ? <div className="spinner sm border-white" /> : <LogIn className="w-5 h-5" />}
              Start Shift
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
