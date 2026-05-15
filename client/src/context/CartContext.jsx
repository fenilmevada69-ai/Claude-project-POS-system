import { createContext, useContext, useReducer, useCallback } from 'react';

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i._id === action.payload._id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i._id === action.payload._id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
    }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i._id !== action.payload) };

    case 'UPDATE_QTY': {
      const { id, quantity } = action.payload;
      if (quantity <= 0) return { ...state, items: state.items.filter((i) => i._id !== id) };
      return { ...state, items: state.items.map((i) => (i._id === id ? { ...i, quantity } : i)) };
    }

    case 'SET_DISCOUNT':
      return { ...state, discount: action.payload };

    case 'SET_CUSTOMER':
      return { ...state, customer: action.payload };

    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload };

    case 'SET_NOTE':
      return { ...state, note: action.payload };

    case 'CLEAR':
      return initialState;

    default:
      return state;
  }
};

const initialState = {
  items: [],
  discount: 0,
  customer: { name: 'Walk-in Customer', phone: '', email: '' },
  paymentMethod: 'cash',
  note: '',
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = useCallback((product) => dispatch({ type: 'ADD_ITEM', payload: product }), []);
  const removeItem = useCallback((id) => dispatch({ type: 'REMOVE_ITEM', payload: id }), []);
  const updateQty = useCallback((id, quantity) => dispatch({ type: 'UPDATE_QTY', payload: { id, quantity } }), []);
  const setDiscount = useCallback((v) => dispatch({ type: 'SET_DISCOUNT', payload: v }), []);
  const setCustomer = useCallback((v) => dispatch({ type: 'SET_CUSTOMER', payload: v }), []);
  const setPaymentMethod = useCallback((v) => dispatch({ type: 'SET_PAYMENT_METHOD', payload: v }), []);
  const setNote = useCallback((v) => dispatch({ type: 'SET_NOTE', payload: v }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  // Derived totals
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const taxAmount = state.items.reduce((sum, i) => sum + (i.price * i.quantity * (i.taxRate || 0)) / 100, 0);
  const total = subtotal + taxAmount - state.discount;
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        ...state,
        subtotal,
        taxAmount,
        total,
        itemCount,
        addItem,
        removeItem,
        updateQty,
        setDiscount,
        setCustomer,
        setPaymentMethod,
        setNote,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export default CartContext;
