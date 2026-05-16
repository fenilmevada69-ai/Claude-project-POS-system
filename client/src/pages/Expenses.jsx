import { useState, useEffect } from 'react';
import api, { expensesAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Receipt, Plus, Search, Filter, Trash2, Edit2, TrendingDown, DollarSign, Calendar, Tag } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = [
  { id: 'rent', label: 'Rent', color: 'bg-red-100 text-red-600' },
  { id: 'utilities', label: 'Utilities', color: 'bg-orange-100 text-orange-600' },
  { id: 'salaries', label: 'Salaries', color: 'bg-blue-100 text-blue-600' },
  { id: 'supplies', label: 'Supplies', color: 'bg-green-100 text-green-600' },
  { id: 'maintenance', label: 'Maintenance', color: 'bg-yellow-100 text-yellow-600' },
  { id: 'marketing', label: 'Marketing', color: 'bg-purple-100 text-purple-600' },
  { id: 'other', label: 'Other', color: 'bg-gray-100 text-gray-600' },
];

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

export default function Expenses() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
  });

  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'other',
    paymentMethod: 'cash',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const { data } = await expensesAPI.getAll(filters);
      setExpenses(data.expenses);
      
      const summaryRes = await expensesAPI.getSummary(filters);
      setSummary(summaryRes.data.summary);
    } catch (error) {
      showToast('Failed to fetch expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await expensesAPI.update(editingExpense._id, form);
        showToast('Expense updated successfully', 'success');
      } else {
        await expensesAPI.create(form);
        showToast('Expense added successfully', 'success');
      }
      setIsModalOpen(false);
      setEditingExpense(null);
      setForm({
        title: '', amount: '', category: 'other', paymentMethod: 'cash',
        date: new Date().toISOString().split('T')[0], description: '',
      });
      fetchExpenses();
    } catch (error) {
      showToast('Failed to save expense', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expensesAPI.delete(id);
      showToast('Expense deleted', 'success');
      fetchExpenses();
    } catch (error) {
      showToast('Failed to delete expense', 'error');
    }
  };

  const openEdit = (expense) => {
    setEditingExpense(expense);
    setForm({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      paymentMethod: expense.paymentMethod,
      date: new Date(expense.date).toISOString().split('T')[0],
      description: expense.description || '',
    });
    setIsModalOpen(true);
  };

  const totalPeriod = summary.reduce((acc, curr) => acc + curr.total, 0);
  const highestCategory = summary.length > 0 ? summary.reduce((prev, current) => (prev.total > current.total) ? prev : current) : null;

  return (
    <div className="page expenses-page">
      <div className="page-header flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Expenses</h2>
          <p className="text-slate-400">Track and manage store expenditures</p>
        </div>
        <button 
          onClick={() => { setEditingExpense(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg shadow-purple-200 transition-all"
        >
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          className="p-6 rounded-2xl flex items-center gap-4 backdrop-blur-md"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(13,148,136,0.1))',
            border: '1px solid rgba(124, 58, 237, 0.3)'
          }}
        >
          <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center border border-rose-500/20">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Total Expenses (Period)</p>
            <h4 className="text-2xl font-bold text-white">{formatCurrency(totalPeriod)}</h4>
          </div>
        </div>
        <div 
          className="p-6 rounded-2xl flex items-center gap-4 backdrop-blur-md"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(13,148,136,0.1))',
            border: '1px solid rgba(124, 58, 237, 0.3)'
          }}
        >
          <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/20">
            <Tag size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Highest Category</p>
            <h4 className="text-2xl font-bold text-white capitalize">
              {highestCategory ? highestCategory._id : '—'}
            </h4>
          </div>
        </div>
        <div 
          className="p-6 rounded-2xl flex items-center gap-4 backdrop-blur-md"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(13,148,136,0.1))',
            border: '1px solid rgba(124, 58, 237, 0.3)'
          }}
        >
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Today's Expenses</p>
            <h4 className="text-2xl font-bold text-white">
              {formatCurrency(expenses.filter(e => new Date(e.date).toDateString() === new Date().toDateString()).reduce((a, b) => a + b.amount, 0))}
            </h4>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 shadow-xl mb-8 flex flex-wrap items-center gap-4 backdrop-blur-md">
        <div className="relative flex-1 min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select 
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 text-white rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 text-white rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
          />
          <span className="text-slate-500">to</span>
          <input 
            type="date" 
            className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 text-white rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white/5 rounded-2xl border border-white/10 shadow-xl overflow-hidden backdrop-blur-md">
        {loading ? (
          <div className="p-20 text-center"><LoadingSpinner /></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-purple-600/20 border-b border-purple-500/30">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-purple-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-purple-400 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-xs font-bold text-purple-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-purple-400 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-xs font-bold text-purple-400 uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-purple-400 uppercase tracking-wider">Added By</th>
                <th className="px-6 py-4 text-xs font-bold text-purple-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {expenses.map((expense) => {
                const cat = CATEGORIES.find(c => c.id === expense.category) || CATEGORIES[6];
                return (
                  <tr key={expense._id} className="hover:bg-purple-500/5 transition-colors odd:bg-transparent even:bg-white/[0.02]">
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {expense.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${cat.color.replace('bg-', 'bg-opacity-20 bg-')}`}>
                        {cat.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 capitalize">
                      {expense.paymentMethod}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-rose-400 text-right">
                      -{formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {expense.addedBy?.name || '—'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => openEdit(expense)}
                        className="p-1.5 text-slate-500 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      {user?.role === 'admin' && (
                        <button 
                          onClick={() => handleDelete(expense._id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-400 italic">No expenses found for the selected period.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay active">
          <div className="modal-container max-w-lg">
            <div className="modal-header">
              <h3 className="text-xl font-bold">{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body p-6 space-y-6">
                <div className="form-group">
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Expense Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electricity Bill, Shop Rent"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Amount (₹)</label>
                    <input
                      type="number"
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      value={form.amount}
                      onChange={(e) => setForm({...form, amount: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Date</label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      value={form.date}
                      onChange={(e) => setForm({...form, date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Category</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      value={form.category}
                      onChange={(e) => setForm({...form, category: e.target.value})}
                    >
                      {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Payment Method</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      value={form.paymentMethod}
                      onChange={(e) => setForm({...form, paymentMethod: e.target.value})}
                    >
                      <option value="cash">Cash</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description (Optional)</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                    placeholder="Add details about the expense..."
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer shrink-0 border-t bg-gray-50 flex justify-end gap-3 p-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-gray-500 hover:text-gray-700 font-semibold">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-8 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-lg shadow-purple-200 transition-all"
                >
                  {editingExpense ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function X({ size, ...props }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
