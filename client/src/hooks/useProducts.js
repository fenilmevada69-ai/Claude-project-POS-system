import { useState, useEffect, useCallback } from 'react';
import { productsAPI } from '../services/api';

export const useProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [params, setParams] = useState({ page: 1, limit: 20, ...initialParams });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await productsAPI.getAll(params);
      setProducts(data.products);
      setMeta({ total: data.total, pages: data.pages });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const createProduct = async (productData) => {
    const { data } = await productsAPI.create(productData);
    setProducts((prev) => [data.product, ...prev]);
    return data.product;
  };

  const updateProduct = async (id, productData) => {
    const { data } = await productsAPI.update(id, productData);
    setProducts((prev) => prev.map((p) => (p._id === id ? data.product : p)));
    return data.product;
  };

  const deleteProduct = async (id) => {
    await productsAPI.delete(id);
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  const adjustStock = async (id, adjustment, reason) => {
    const { data } = await productsAPI.adjustStock(id, { adjustment, reason });
    setProducts((prev) => prev.map((p) => (p._id === id ? data.product : p)));
    return data.product;
  };

  return {
    products,
    loading,
    error,
    meta,
    params,
    setParams,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
  };
};
