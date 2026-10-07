import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { STORE_SLUG } from '../config';
import type { CartItem } from '../types';

type CartContextValue = {
  items: CartItem[];
  add: (item: CartItem) => void;
  buyNow: (item: CartItem) => void;
  update: (index: number, qty: number) => void;
  remove: (index: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const key = `shopsaas-cart-${STORE_SLUG}`;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(key)
      .then(raw => {
        try {
          setItems(raw ? JSON.parse(raw) : []);
        } catch {
          setItems([]);
        }
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) {
      AsyncStorage.setItem(key, JSON.stringify(items)).catch(() => undefined);
    }
  }, [hydrated, items]);

  const value = useMemo(
    () => ({
      items,
      add: (item: CartItem) =>
        setItems(current => {
          const index = current.findIndex(
            x =>
              x.productId === item.productId &&
              JSON.stringify(x.selectedVariants) === JSON.stringify(item.selectedVariants),
          );
          return index < 0
            ? [...current, item]
            : current.map((x, n) => (n === index ? { ...x, qty: x.qty + item.qty } : x));
        }),
      buyNow: (item: CartItem) => setItems([item]),
      update: (index: number, qty: number) =>
        setItems(current =>
          qty < 1 ? current.filter((_, n) => n !== index) : current.map((x, n) => (n === index ? { ...x, qty } : x)),
        ),
      remove: (index: number) => setItems(current => current.filter((_, n) => n !== index)),
      clear: () => setItems([]),
      count: items.reduce((sum, item) => sum + item.qty, 0),
      subtotal: items.reduce((sum, item) => sum + item.qty * item.price, 0),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
