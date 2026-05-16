import { useReports } from '../hooks/useReports';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Label,
} from 'recharts';

const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
const PIE_COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e'];

export default function Reports() {
  const { summary, revenue, topProducts, paymentMethods, loading, error, period, setPeriod, refetch } = useReports();

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;

  return (
    <div className="page reports-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Reports & Analytics</h2>
          <p className="page-subtitle">Comprehensive sales & inventory insights</p>
        </div>
        <div className="header-actions">
          <div className="period-tabs">
            {['7d', '30d', '90d'].map((p) => (
              <button key={p} className={`tab-btn ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
                {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          <button className="btn btn-ghost" onClick={refetch}>↻ Refresh</button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="kpi-grid">
        {[
          { label: "Today's Revenue", value: fmt(summary?.todayRevenue || 0), icon: '💰' },
          { label: "Today's Orders", value: summary?.todayOrders || 0, icon: '🛒' },
          { label: 'Avg Order Value', value: fmt(summary?.avgOrderValue || 0), icon: '📊' },
          { label: 'Low Stock Alerts', value: summary?.lowStockCount || 0, icon: '⚠️' },
        ].map((k) => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-icon">{k.icon}</div>
            <div className="kpi-body">
              <p className="kpi-label">{k.label}</p>
              <p className="kpi-value">{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Bar Chart */}
      <div className="chart-card">
        <h3 className="chart-title">Daily Revenue</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={revenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }} formatter={(v) => [fmt(v), 'Revenue']} />
            <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={80} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row */}
      <div className="charts-row">
        {/* Top Products */}
        <div className="chart-card chart-wide">
          <h3 className="chart-title">Top Products by Revenue</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }} formatter={(v) => [fmt(v), 'Revenue']} />
              <Bar dataKey="totalRevenue" fill="#22d3ee" radius={[0, 4, 4, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Breakdown */}
        <div className="chart-card chart-narrow">
          <h3 className="chart-title">Payment Breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie 
                data={paymentMethods} 
                dataKey="revenue" 
                nameKey="_id" 
                cx="50%" 
                cy="50%" 
                innerRadius={60}
                outerRadius={90}
                paddingAngle={paymentMethods.length === 1 ? 0 : 5}
                stroke="#0f172a"
                strokeWidth={2}
              >
                {paymentMethods.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                {paymentMethods.length > 0 && (
                  <Label 
                    value={`${(Math.max(...paymentMethods.map(m => m.revenue)) / (paymentMethods.reduce((a, b) => a + b.revenue, 0) || 1) * 100).toFixed(0)}%`}
                    position="center" 
                    fill="#e2e8f0" 
                    style={{ fontSize: '20px', fontWeight: 'bold' }} 
                  />
                )}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
