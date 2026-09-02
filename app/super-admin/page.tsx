'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowUpRight, Building2, ClipboardList, ExternalLink, Package, Settings2, ShoppingBag, Users } from 'lucide-react';
import { formatMoney } from '@/lib/currency';
import { storefrontPath } from '@/lib/storefront-paths';

const OrdersBarChart = dynamic(() => import('@/components/charts/OrdersBarChart'), { ssr: false, loading: () => <div className="chart-loading" /> });

type StoreSummary = {
  id: string; name: string; slug: string; logo: string; currency: string; isActive: boolean;
  products: number; activeProducts: number; orders: number; pendingOrders: number; revenue: number; lastOrderAt: string | null;
  admins: { id: string; name: string; email: string; status: string }[];
  admin: { id: string; name: string; email: string; status: string } | null;
};
type Stats = {
  totalAdmins: number; activeAdmins: number; totalStores: number; activeStores: number; totalProducts: number;
  totalOrders: number; ordersLast7Days: number; revenueByCurrency: { currency: string; total: number }[]; storeBreakdown: StoreSummary[];
};
type Order = {
  id: string; orderNumber: string; total: number; status: string; createdAt: string; customer: { name: string };
  store: { id: string; name: string; slug: string; currency: string } | null;
};
const statusColors: Record<string, string> = { pending: 'warning', confirmed: 'info', processing: 'info', shipped: 'accent', delivered: 'success', cancelled: 'error' };

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/super-admin/stats').then((response) => response.json()),
      fetch('/api/super-admin/orders').then((response) => response.json()),
    ]).then(([statsData, ordersData]) => {
      setStats(statsData);
      setOrders(ordersData.orders ?? []);
    });
  }, []);

  const chartData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() - (6 - index));
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      orders: orders.filter((order) => {
        const created = new Date(order.createdAt);
        return created.getDate() === date.getDate() && created.getMonth() === date.getMonth() && created.getFullYear() === date.getFullYear();
      }).length,
    };
  });

  const cards = [
    [Users, 'Store admins', stats?.totalAdmins ?? 0, `${stats?.activeAdmins ?? 0} active`, 'accent'],
    [Building2, 'Stores', stats?.totalStores ?? 0, `${stats?.activeStores ?? 0} live`, 'cyan'],
    [Package, 'Products', stats?.totalProducts ?? 0, 'Across all stores', 'success'],
    [ShoppingBag, 'Orders', stats?.totalOrders ?? 0, `${stats?.ordersLast7Days ?? 0} this week`, 'warning'],
  ] as const;

  return <div>
    <div className="page-header super-dashboard-heading">
      <div><p className="eyebrow">MULTI-STORE CONTROL</p><h1 className="page-title">Platform overview</h1><p className="page-subtitle">Every admin, storefront and catalogue stays separate—managed together from here.</p></div>
      <Link href="/super-admin/admins" className="btn btn-primary">Create admin & store</Link>
    </div>

    <div className="stat-grid">{cards.map(([Icon, label, value, detail, tone]) => <div className={`glass-card stat-card ${tone}`} key={label}><div className={`stat-icon ${tone}`}><Icon size={20}/></div><div className="stat-value">{value}</div><div className="stat-label">{label}</div><div className="stat-change up">{detail}</div></div>)}</div>

    <section className="store-portfolio-section">
      <div className="section-heading"><div><h2>Your stores</h2><p className="text-secondary">A separate business, owner and catalogue for every storefront.</p></div><Link href="/super-admin/stores" className="btn btn-ghost btn-sm">Manage all stores <ArrowUpRight size={15}/></Link></div>
      <div className="store-portfolio-grid">
        {(stats?.storeBreakdown ?? []).map((store) => <article className="glass-card portfolio-store-card" key={store.id}>
          <header><div className="portfolio-store-identity">{store.logo ? <img src={store.logo} alt=""/> : <span>{store.name[0]?.toUpperCase()}</span>}<div><strong>{store.name}</strong><small>{storefrontPath(store.slug)}</small></div></div><span className={`badge badge-${store.isActive ? 'success' : 'error'}`}>{store.isActive ? 'Live' : 'Offline'}</span></header>
          <div className="portfolio-owner"><span>Assigned admins</span><strong>{store.admins.length} login{store.admins.length === 1 ? '' : 's'}</strong><small>{store.admins.length ? store.admins.map((admin) => admin.name).join(', ') : 'No login attached yet'}</small></div>
          <div className="portfolio-store-metrics"><div><span>Products</span><strong>{store.activeProducts}<small> / {store.products}</small></strong></div><div><span>Orders</span><strong>{store.orders}</strong></div><div><span>Pending</span><strong>{store.pendingOrders}</strong></div><div><span>Revenue</span><strong>{formatMoney(store.revenue, store.currency)}</strong></div></div>
          <footer><span>{store.lastOrderAt ? `Last order ${new Date(store.lastOrderAt).toLocaleDateString()}` : 'No orders yet'}</span><div><Link href={`/super-admin/stores/${store.id}`} className="btn btn-secondary btn-sm"><Settings2 size={14}/> Edit</Link><Link href={storefrontPath(store.slug)} className="btn btn-ghost btn-sm" target="_blank"><ExternalLink size={14}/> View</Link></div></footer>
        </article>)}
        {stats && stats.storeBreakdown.length === 0 && <div className="empty-state portfolio-empty"><h3>No stores yet</h3><p>Create an admin and their dedicated store will be created at the same time.</p><Link href="/super-admin/admins" className="btn btn-primary mt-4">Create first store</Link></div>}
      </div>
    </section>

    <div className="dashboard-split"><div className="glass-card chart-card"><div className="chart-title">Orders across stores this week</div><OrdersBarChart data={chartData}/></div><div className="glass-card quick-actions"><div className="chart-title">Quick actions</div>{[[Users, '/super-admin/admins', 'Admins & store access', 'Create or manage dedicated store owners'], [Building2, '/super-admin/stores', 'Store settings', 'Edit any storefront from one place'], [ClipboardList, '/super-admin/orders', 'All store orders', 'Filter activity by storefront']].map(([Icon, href, label, description]) => { const ActionIcon = Icon as typeof Users; return <Link key={href as string} href={href as string} className="quick-action"><span className="quick-action-icon"><ActionIcon size={18}/></span><span><strong>{label as string}</strong><small>{description as string}</small></span></Link>; })}</div></div>

    <section className="glass-card recent-orders-card"><div className="section-heading"><div><h2>Recent orders</h2><p className="text-secondary">Latest activity from every store.</p></div><Link href="/super-admin/orders" className="btn btn-ghost btn-sm">View all</Link></div><div className="table-container"><table className="data-table"><thead><tr><th>Order</th><th>Store</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>{orders.length === 0 ? <tr><td colSpan={6} className="table-empty">No orders yet</td></tr> : orders.slice(0, 8).map((order) => <tr key={order.id}><td className="text-accent font-semibold">{order.orderNumber}</td><td><strong>{order.store?.name ?? 'Unknown store'}</strong><small>{order.store ? storefrontPath(order.store.slug) : 'Store removed'}</small></td><td>{order.customer?.name}</td><td className="font-semibold">{formatMoney(order.total, order.store?.currency ?? 'PKR')}</td><td><span className={`badge badge-${statusColors[order.status] ?? 'muted'}`}>{order.status}</span></td><td>{new Date(order.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div></section>
  </div>;
}
