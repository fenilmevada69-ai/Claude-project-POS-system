import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Bell, Mail, Clock, Save, Send } from 'lucide-react';

export default function Settings() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailAlerts: true,
    alertEmail: 'manager@lumina.pos',
    defaultLowStockThreshold: 10,
    sendDailyReport: true,
    dailyReportTime: '09:00',
  });

  const handleSave = async () => {
    setLoading(true);
    // In a real app, this would save to /api/settings
    setTimeout(() => {
      showToast('Settings saved successfully', 'success');
      setLoading(false);
    }, 500);
  };

  const handleSendTestAlert = async () => {
    try {
      // In a real app, this would call /api/settings/test-email
      showToast('Test alert sent successfully to ' + settings.alertEmail, 'success');
    } catch (error) {
      showToast('Failed to send test alert', 'error');
    }
  };

  return (
    <div className="page settings-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">Configure your POS system preferences</p>
        </div>
        <button 
          className="btn btn-primary flex items-center gap-2" 
          onClick={handleSave}
          disabled={loading}
        >
          <Save size={18} />
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        {/* Alert Settings */}
        <div className="card backdrop-blur-md">
          <div className="card-header flex items-center gap-3 border-b border-white/5 p-4">
            <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-lg flex items-center justify-center border border-purple-500/20">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white">Alert Settings</h3>
              <p className="text-xs text-slate-400">Low stock and system notifications</p>
            </div>
          </div>
          <div className="card-body p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Email Alerts</p>
                <p className="text-sm text-slate-400">Send notifications when stock is low</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.emailAlerts}
                  onChange={(e) => setSettings({...settings, emailAlerts: e.target.checked})}
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="form-group">
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">
                Alert Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-white"
                  value={settings.alertEmail}
                  onChange={(e) => setSettings({...settings, alertEmail: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">
                Default Low Stock Threshold
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-white"
                value={settings.defaultLowStockThreshold}
                onChange={(e) => setSettings({...settings, defaultLowStockThreshold: e.target.value})}
              />
              <p className="text-[11px] text-slate-500 mt-1">Applied when no threshold is set on product</p>
            </div>

            <button 
              className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all border border-white/10"
              onClick={handleSendTestAlert}
            >
              <Send size={16} />
              Send Test Alert
            </button>
          </div>
        </div>

        {/* Daily Reports */}
        <div className="card backdrop-blur-md">
          <div className="card-header flex items-center gap-3 border-b border-white/5 p-4">
            <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center border border-blue-500/20">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white">Daily Reports</h3>
              <p className="text-xs text-slate-400">Automated summary emails</p>
            </div>
          </div>
          <div className="card-body p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Send Daily Summary</p>
                <p className="text-sm text-slate-400">Recieve a sales summary every morning</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.sendDailyReport}
                  onChange={(e) => setSettings({...settings, sendDailyReport: e.target.checked})}
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="form-group">
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Report Send Time
              </label>
              <input
                type="time"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={settings.dailyReportTime}
                onChange={(e) => setSettings({...settings, dailyReportTime: e.target.value})}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
