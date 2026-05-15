import { useState, useEffect, useCallback } from 'react';
import { reportsAPI } from '../services/api';

export const useReports = () => {
  const [summary, setSummary] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('7d');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, revenueRes, topRes, paymentRes] = await Promise.all([
        reportsAPI.getSummary(),
        reportsAPI.getRevenue({ period }),
        reportsAPI.getTopProducts({ period, limit: 10 }),
        reportsAPI.getPaymentMethods({ period }),
      ]);
      setSummary(summaryRes.data.summary);
      setRevenue(revenueRes.data.data);
      setTopProducts(topRes.data.data);
      setPaymentMethods(paymentRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { summary, revenue, topProducts, paymentMethods, loading, error, period, setPeriod, refetch: fetchAll };
};
