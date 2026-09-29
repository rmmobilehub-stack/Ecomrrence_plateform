'use client';
import { createContext,useContext,useEffect,useMemo,useState } from 'react';
import type { CartItem } from '@/lib/types';

type CartContextValue={items:CartItem[];add:(item:CartItem)=>void;buyNow:(item:CartItem)=>void;update:(index:number,qty:number)=>void;remove:(index:number)=>void;clear:()=>void;count:number;subtotal:number;currency:string};
const CartContext=createContext<CartContextValue|null>(null);
export function CartProvider({ slug, currency, children }: { slug: string; currency: string; children: React.ReactNode }) {
  const key = `shopsaas-cart-${slug}`;
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(key) ?? '[]')); } catch { setItems([]); }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(key, JSON.stringify(items));
  }, [hydrated, items, key]);

  const value = useMemo(() => ({
    items,
    add: (item: CartItem) => setItems(current => {
      const index = current.findIndex(x => x.productId === item.productId && JSON.stringify(x.selectedVariants) === JSON.stringify(item.selectedVariants));
      return index < 0 ? [...current, item] : current.map((x, n) => n === index ? { ...x, qty: x.qty + item.qty } : x);
    }),
    buyNow: (item: CartItem) => {
      // Save before route navigation so checkout never sees an empty cart.
      localStorage.setItem(key, JSON.stringify([item]));
      setItems([item]);
    },
    update: (index: number, qty: number) => setItems(current => qty < 1 ? current.filter((_, n) => n !== index) : current.map((x, n) => n === index ? { ...x, qty } : x)),
    remove: (index: number) => setItems(current => current.filter((_, n) => n !== index)),
    clear: () => setItems([]),
    count: items.reduce((sum, item) => sum + item.qty, 0),
    subtotal: items.reduce((sum, item) => sum + item.qty * item.price, 0),
    currency,
  }), [currency, items, key]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart(){const context=useContext(CartContext);if(!context)throw new Error('useCart must be used inside CartProvider');return context}
