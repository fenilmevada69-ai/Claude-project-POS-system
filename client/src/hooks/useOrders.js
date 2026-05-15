import { useState, useEffect, useCallback } from 'react';
import { ordersAPI } from '../services/api';
import { useCart } from '../context/CartContext';

export const useOrders = (initialParams = {}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [params, setParams] = useState({ page: 1, limit: 20, ...initialParams });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await ordersAPI.getAll(params);
      setOrders(data.orders);
      setMeta({ total: data.total, pages: data.pages });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const refundOrder = async (id, reason) => {
    const { data } = await ordersAPI.refund(id, { reason });
    setOrders((prev) => prev.map((o) => (o._id === id ? data.order : o)));
    return data.order;
  };

  return { orders, loading, error, meta, params, setParams, refetch: fetchOrders, refundOrder };
};

// Standalone hook for checkout flow
export const useCheckout = () => {
  const cart = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);

  const checkout = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        items: cart.items.map((i) => ({ product: i._id, quantity: i.quantity, discount: 0 })),
        paymentMethod: cart.paymentMethod,
        customer: cart.customer,
        note: cart.note,
        discountAmount: cart.discount,
      };
      const { data } = await ordersAPI.create(payload);
      setLastOrder(data.order);
      cart.clearCart();
      return data.order;
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { checkout, loading, error, lastOrder };
};
