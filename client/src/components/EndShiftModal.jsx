import { useState, useEffect } from 'react';
import { useShift } from '../context/ShiftContext';
import { X, DollarSign, ShoppingBag, CreditCard, Smartphone, Receipt, Printer, LogOut } from 'lucide-react';
import api from '../services/api';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

export default function EndShiftModal({ isOpen, onClose }) {
  const { activeShift, endShift } = useShift();
  const [closingCash, setClosingCash] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (isOpen && activeShift) {
      // Calculate real-time summary before closing
      const fetchSummary = async () => {
        try {
          const { data } = await api.get(`/shifts/${activeShift._id}`);
          setSummary(data.shift);
        } catch (error) {
          console.error('Error fetching shift summary:', error);
        }
      };
      fetchSummary();
    }
  }, [isOpen, activeShift]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await endShift(Number(closingCash), notes);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !activeShift) return null;

  const expectedCash = (activeShift.openingCash || 0) + (summary?.totalCash || 0);
  const difference = Number(closingCash) - expectedCash;

  return (
    <div className="modal-overlay active">
      <div className="modal-container max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="modal-header shrink-0 border-b border-white/5">
          <h3 className="text-xl font-bold text-white">End of Shift Report</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body overflow-y-auto p-6 space-y-8 print:p-0">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
              <p className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1">Total Sales</p>
              <h4 className="text-xl font-bold text-white">{formatCurrency(summary?.totalSales || 0)}</h4>
            </div>
            <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
              <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">Orders</p>
              <h4 className="text-xl font-bold text-white">{summary?.totalOrders || 0}</h4>
            </div>
            <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
              <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">Cash</p>
              <h4 className="text-xl font-bold text-white">{formatCurrency(summary?.totalCash || 0)}</h4>
            </div>
            <div className="bg-orange-500/10 p-4 rounded-xl border border-orange-500/20">
              <p className="text-xs text-orange-400 font-bold uppercase tracking-wider mb-1">UPI</p>
              <h4 className="text-xl font-bold text-white">{formatCurrency(summary?.totalUPI || 0)}</h4>
            </div>
            <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20">
              <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">Card</p>
              <h4 className="text-xl font-bold text-white">{formatCurrency(summary?.totalCard || 0)}</h4>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Cash Reconciliation */}
            <div className="space-y-4">
              <h4 className="font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Cash Reconciliation
              </h4>
              <div className="bg-white/5 rounded-xl p-4 space-y-3 border border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Opening Cash</span>
                  <span className="font-semibold text-white">{formatCurrency(activeShift.openingCash)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Cash Sales (+)</span>
                  <span className="font-semibold text-emerald-400">+{formatCurrency(summary?.totalCash || 0)}</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between">
                  <span className="font-bold text-slate-300">Expected Cash</span>
                  <span className="font-bold text-purple-400">{formatCurrency(expectedCash)}</span>
                </div>
                <div className="space-y-1.5 pt-2">
                  <label className="text-sm font-medium text-slate-300">Actual Closing Cash</label>
                  <input
                    type="number"
                    placeholder="Enter closing cash amount"
                    className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-white"
                    value={closingCash}
                    onChange={(e) => setClosingCash(e.target.value)}
                  />
                </div>
                {closingCash && (
                  <div className={`flex justify-between p-3 rounded-lg ${difference === 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    <span className="font-medium">Difference</span>
                    <span className="font-bold">{difference > 0 ? '+' : ''}{formatCurrency(difference)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-400" />
                Shift Notes
              </h4>
              <textarea
                className="w-full h-32 px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none text-white"
                placeholder="Any discrepancies or notes for this shift?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Orders Table */}
          <div className="space-y-4">
            <h4 className="font-bold text-white">Shift Orders</h4>
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-purple-500/10 text-purple-400 border-b border-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left">Order#</th>
                    <th className="px-4 py-3 text-left">Time</th>
                    <th className="px-4 py-3 text-left">Payment</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {summary?.orders?.map(order => (
                    <tr key={order._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-slate-400">{new Date(order.createdAt).toLocaleTimeString()}</td>
                      <td className="px-4 py-3 capitalize text-slate-300">{order.paymentMethod}</td>
                      <td className="px-4 py-3 text-right font-bold text-white">{formatCurrency(order.totalAmount)}</td>
                    </tr>
                  ))}
                  {(!summary?.orders || summary.orders.length === 0) && (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-gray-400 italic">No orders in this shift</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="modal-footer shrink-0 border-t border-white/5 bg-slate-900 flex justify-between items-center p-4">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg font-semibold transition-all border border-white/10"
          >
            <Printer className="w-5 h-5" />
            Print Report
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-slate-400 hover:text-white font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !closingCash}
              className="flex items-center gap-2 px-8 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-lg shadow-rose-900/20 transition-all disabled:opacity-50"
            >
              {loading ? <div className="spinner sm border-white" /> : <LogOut className="w-5 h-5" />}
              Close Shift
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
