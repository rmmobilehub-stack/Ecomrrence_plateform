'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatMoney } from '@/lib/currency';
import { storefrontPath } from '@/lib/storefront-paths';

type Order = {
  id: string; orderNumber: string; customer: { name: string; email: string }; total: number; status: string; createdAt: string;
  store: { id: string; name: string; slug: string; currency: string } | null;
};

export default function GlobalOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [storeId, setStoreId] = useState('');
  const [status, setStatus] = useState('');
  useEffect(() => { fetch('/api/super-admin/orders').then((response) => response.json()).then((data) => setOrders(data.orders ?? [])); }, []);
  const stores = useMemo(() => Array.from(new Map(orders.filter((order) => order.store).map((order) => [order.store!.id, order.store!])).values()), [orders]);
  const visible = orders.filter((order) => (!storeId || order.store?.id === storeId) && (!status || order.status === status));

  return <><div className="page-header"><div><p className="eyebrow">CROSS-STORE ACTIVITY</p><h1 className="page-title">All orders</h1><p className="page-subtitle">Review orders across every store or isolate one storefront.</p></div><span className="badge badge-accent">{visible.length} orders</span></div><div className="filter-bar super-order-filters"><select className="form-select" value={storeId} onChange={(event) => setStoreId(event.target.value)}><option value="">All stores</option>{stores.map((store) => <option value={store.id} key={store.id}>{store.name}</option>)}</select><select className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((value) => <option value={value} key={value}>{value}</option>)}</select></div><div className="glass-card table-container"><table className="data-table"><thead><tr><th>Order</th><th>Store</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>{visible.length === 0 ? <tr><td colSpan={6}>No matching orders.</td></tr> : visible.map((order) => <tr key={order.id}><td className="font-semibold text-accent">{order.orderNumber}</td><td><strong>{order.store?.name ?? 'Unknown store'}</strong><small>{order.store ? storefrontPath(order.store.slug) : 'Store removed'}</small></td><td>{order.customer.name}<small>{order.customer.email}</small></td><td className="font-semibold">{formatMoney(order.total, order.store?.currency ?? 'PKR')}</td><td><span className={`badge badge-${order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'error' : 'warning'}`}>{order.status}</span></td><td>{new Date(order.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div></>;
}
