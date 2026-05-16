import { useReports } from '../hooks/useReports';
import LoadingSpinner from '../components/LoadingSpinner';
import { Download, FileText, Table } from 'lucide-react';
import api from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CustomTooltip from '../components/CustomTooltip';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Label,
} from 'recharts';

const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
const PIE_COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e'];

export default function Reports() {
  const { summary, revenue, topProducts, paymentMethods, loading, error, period, setPeriod, refetch } = useReports();

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/reports/export/sales', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-report-${period}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('CSV Export failed', err);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Lumina POS - Sales Report', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Period: ${period === '7d' ? 'Last 7 Days' : period === '30d' ? 'Last 30 Days' : 'Last 90 Days'}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36);

    // Summary Table
    const summaryData = [
      ['Total Revenue', fmt(summary?.todayRevenue || 0)],
      ['Total Orders', summary?.todayOrders || 0],
      ['Average Order Value', fmt(summary?.avgOrderValue || 0)],
    ];
    doc.autoTable({
      startY: 45,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillStyle: '#7c3aed' }
    });

    // Top Products Table
    const productData = topProducts.map(p => [p.name, p.sku, p.totalQuantity, fmt(p.totalRevenue)]);
    doc.text('Top Products', 14, doc.lastAutoTable.finalY + 15);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Product', 'SKU', 'Qty Sold', 'Revenue']],
      body: productData,
      theme: 'striped',
    });

    doc.save(`lumina-report-${period}.pdf`);
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;

  return (
    <div className="page reports-page">
      <div className="page-header flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
          <p className="text-slate-400">Comprehensive sales & inventory insights</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
            {['7d', '30d', '90d'].map((p) => (
              <button 
                key={p} 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${period === p ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`} 
                onClick={() => setPeriod(p)}
              >
                {p === '7d' ? '7D' : p === '30d' ? '30D' : '90D'}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl font-bold text-sm transition-all"
            >
              <Table size={16} />
              CSV
            </button>
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl font-bold text-sm transition-all"
            >
              <FileText size={16} />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Today's Revenue", value: fmt(summary?.todayRevenue || 0), color: 'text-purple-400' },
          { label: "Today's Orders", value: summary?.todayOrders || 0, color: 'text-blue-400' },
          { label: 'Avg Order Value', value: fmt(summary?.avgOrderValue || 0), color: 'text-emerald-400' },
          { label: 'Low Stock Alerts', value: summary?.lowStockCount || 0, color: 'text-rose-400' },
        ].map((k) => (
          <div 
            key={k.label} 
            className="p-6 rounded-2xl flex flex-col backdrop-blur-md"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(13,148,136,0.1))',
              border: '1px solid rgba(124, 58, 237, 0.3)'
            }}
          >
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{k.label}</p>
            <h4 className={`text-2xl font-black ${k.color}`}>{k.value}</h4>
          </div>
        ))}
      </div>

      {/* Revenue Bar Chart */}
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl mb-8 backdrop-blur-md">
        <h3 className="text-lg font-bold text-white mb-6">Daily Revenue Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenue}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" fill="#7c3aed" radius={[6, 6, 0, 0]} maxBarSize={60} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md">
          <h3 className="text-lg font-bold text-white mb-6">Top Selling Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="totalRevenue" fill="#06b6d4" radius={[0, 6, 6, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md">
          <h3 className="text-lg font-bold text-white mb-6">Payment Method Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={paymentMethods} 
                dataKey="revenue" 
                nameKey="_id" 
                cx="50%" 
                cy="50%" 
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                stroke="none"
              >
                {paymentMethods.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
