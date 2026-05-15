import { useReports } from '../hooks/useReports';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const KPI_COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981'];
const PIE_COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e'];

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

export default function Dashboard() {
  const { summary, revenue, topProducts, paymentMethods, loading, period, setPeriod } = useReports();

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page dashboard-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Welcome back — here's what's happening today.</p>
        </div>
        <div className="period-tabs">
          {['7d', '30d', '90d'].map((p) => (
            <button key={p} className={`tab-btn ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {[
          { label: "Today's Revenue", value: formatCurrency(summary?.todayRevenue || 0), sub: `${summary?.revenueGrowth >= 0 ? '+' : ''}${summary?.revenueGrowth}% vs yesterday`, icon: '💰', color: KPI_COLORS[0] },
          { label: "Today's Orders", value: summary?.todayOrders || 0, sub: 'Completed transactions', icon: '🛒', color: KPI_COLORS[1] },
          { label: 'Avg Order Value', value: formatCurrency(summary?.avgOrderValue || 0), sub: 'Per transaction', icon: '📊', color: KPI_COLORS[2] },
          { label: 'Low Stock Items', value: summary?.lowStockCount || 0, sub: `of ${summary?.totalProducts} total products`, icon: '⚠️', color: KPI_COLORS[3] },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card" style={{ '--accent': kpi.color }}>
            <div className="kpi-icon">{kpi.icon}</div>
            <div className="kpi-body">
              <p className="kpi-label">{kpi.label}</p>
              <p className="kpi-value">{kpi.value}</p>
              <p className="kpi-sub">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Revenue Chart */}
        <div className="chart-card chart-wide">
          <h3 className="chart-title">Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(v) => [formatCurrency(v), 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods Pie */}
        <div className="chart-card chart-narrow">
          <h3 className="chart-title">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={paymentMethods} dataKey="revenue" nameKey="_id" cx="50%" cy="50%" outerRadius={90} label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}>
                {paymentMethods.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="chart-card">
        <h3 className="chart-title">Top Products</h3>
        <div className="top-products-list">
          {topProducts.map((p, i) => (
            <div key={p._id} className="top-product-row">
              <span className="rank">#{i + 1}</span>
              <span className="prod-name">{p.name}</span>
              <span className="prod-qty">{p.totalQuantity} sold</span>
              <span className="prod-revenue">{formatCurrency(p.totalRevenue)}</span>
              <div className="prod-bar-wrap">
                <div
                  className="prod-bar"
                  style={{ width: `${(p.totalRevenue / (topProducts[0]?.totalRevenue || 1)) * 100}%` }}
                />
              </div>
            </div>
          ))}
          {topProducts.length === 0 && <p className="empty-state">No sales data yet.</p>}
        </div>
      </div>
    </div>
  );
}
