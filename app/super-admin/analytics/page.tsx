'use client';
import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { formatMoney } from '@/lib/currency';
const RevenueBarChart = dynamic(() => import('@/components/charts/RevenueBarChart'), { ssr: false, loading: () => <div className="chart-loading" /> });
type Store = { id: string; name: string; slug: string; currency: string };
type Order = { createdAt: string; total: number; status: string; store?: Store | null };
export default function PlatformAnalytics() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [storeId, setStoreId] = useState('');
  useEffect(() => {
    Promise.all([
      fetch('/api/super-admin/orders').then(response => response.json()),
      fetch('/api/super-admin/stores').then(response => response.json()),
    ]).then(([orderData, storeData]) => {
      const nextStores = storeData.stores ?? [];
      setOrders(orderData.orders ?? []);
      setStores(nextStores);
      setStoreId(current => current || nextStores[0]?.id || '');
    });
  }, []);
  const store = stores.find(item => item.id === storeId);
  const storeOrders = useMemo(() => orders.filter(order => order.store?.id === storeId), [orders, storeId]);
  const data = useMemo(() => Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); return { day: date.toLocaleDateString(undefined, { weekday: 'short' }), revenue: storeOrders.filter(order => order.status !== 'cancelled' && new Date(order.createdAt).toDateString() === date.toDateString()).reduce((sum, order) => sum + order.total, 0) }; }), [storeOrders]);
  const total = storeOrders.filter(order => order.status !== 'cancelled').reduce((sum, order) => sum + order.total, 0);
  return <><div className="page-header"><div><h1 className="page-title">Store analytics</h1><p className="page-subtitle">Review one store at a time so currencies and revenue remain accurate.</p></div><div className="super-order-filters"><select className="form-select" value={storeId} onChange={event => setStoreId(event.target.value)}>{stores.length === 0 ? <option value="">No stores available</option> : stores.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div></div><div className="glass-card chart-card"><div className="chart-title">{store?.name ?? 'Store'} daily revenue · {formatMoney(total, store?.currency ?? 'PKR')} all time</div><RevenueBarChart data={data} height={320} color="#06b6d4" currency={store?.currency ?? 'PKR'}/></div></>;
}
