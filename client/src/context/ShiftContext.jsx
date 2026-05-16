import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const ShiftContext = createContext();

export function ShiftProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [activeShift, setActiveShift] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveShift = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.get('/shifts/current');
      setActiveShift(data.shift);
    } catch (error) {
      console.error('Error fetching shift:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchActiveShift();
  }, [fetchActiveShift]);

  const startShift = async (openingCash, terminal = 'POS-01') => {
    try {
      const { data } = await api.post('/shifts/start', { openingCash, terminal });
      setActiveShift(data.shift);
      showToast('Shift started successfully', 'success');
      return data.shift;
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to start shift', 'error');
      throw error;
    }
  };

  const endShift = async (closingCash, notes) => {
    try {
      const { data } = await api.post('/shifts/end', { closingCash, notes });
      setActiveShift(null);
      showToast('Shift closed successfully', 'success');
      return data.shift;
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to close shift', 'error');
      throw error;
    }
  };

  return (
    <ShiftContext.Provider value={{ activeShift, loading, startShift, endShift, refreshShift: fetchActiveShift }}>
      {children}
    </ShiftContext.Provider>
  );
}

export const useShift = () => useContext(ShiftContext);
