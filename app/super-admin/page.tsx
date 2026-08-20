'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

interface Stats {
  totalAdmins: number;
  activeAdmins: number;
  totalStores: number;
  activeStores: number;
  totalProducts: number;
  totalOrders: number;
  ordersLast7Days: number;
  totalRevenue: number;
}

interface Order {
  id: string;
  orderNumber: string;
  storeId: string;
  total: number;
  status: string;
  createdAt: string;
  customer: { name: string };
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'accent',
  delivered: 'success',
  cancelled: 'error',
};

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/super-admin/stats').then((r) => r.json()),
      fetch('/api/super-admin/orders').then((r) => r.json()),
    ]).then(([statsData, ordersData]) => {
      setStats(statsData);
      setOrders((ordersData.orders || []).slice(0, 8));
      setLoading(false);
    });
  }, []);

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayOrders = orders.filter((o) => {
      const d = new Date(o.createdAt);
      return d.getDate() === date.getDate() && d.getMonth() === date.getMonth();
    }).length;
    return { day: dayStr, orders: dayOrders };
  });

  if (loading) {
    return (
      <div>
        <div className="stat-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card stat-card skeleton" style={{ height: 120 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Overview</h1>
          <p className="page-subtitle">Welcome back, Super Admin 👋</p>
        </div>
        <Link href="/super-admin/admins" className="btn btn-primary">
          + Add Admin
        </Link>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="glass-card stat-card accent">
          <div className="stat-icon accent">👤</div>
          <div className="stat-value">{stats?.totalAdmins ?? 0}</div>
          <div className="stat-label">Total Admins</div>
          <div className="stat-change up">↑ {stats?.activeAdmins} active</div>
        </div>
        <div className="glass-card stat-card cyan">
          <div className="stat-icon cyan">🏪</div>
          <div className="stat-value">{stats?.totalStores ?? 0}</div>
          <div className="stat-label">Total Stores</div>
          <div className="stat-change up">↑ {stats?.activeStores} active</div>
        </div>
        <div className="glass-card stat-card success">
          <div className="stat-icon success">📦</div>
          <div className="stat-value">{stats?.totalProducts ?? 0}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="glass-card stat-card warning">
          <div className="stat-icon warning">💰</div>
          <div className="stat-value">${(stats?.totalRevenue ?? 0).toFixed(0)}</div>
          <div className="stat-label">Platform Revenue</div>
          <div className="stat-change up">↑ {stats?.ordersLast7Days} orders this week</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Orders Chart */}
        <div className="glass-card chart-card">
          <div className="chart-title">Orders This Week</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: 'rgba(240,240,255,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(240,240,255,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#111122', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f0f0ff' }} />
              <Bar dataKey="orders" fill="#6c63ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Links */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div className="chart-title">Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            {[
              { href: '/super-admin/admins', icon: '👤', label: 'Manage Admins', desc: 'Create, suspend, or delete admin accounts' },
              { href: '/super-admin/stores', icon: '🏪', label: 'View All Stores', desc: 'Monitor all active and inactive stores' },
              { href: '/super-admin/orders', icon: '📋', label: 'All Orders', desc: 'View all orders across the platform' },
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', border: '1px solid var(--border)', transition: 'var(--transition)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}
              >
                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="glass-card" style={{ marginTop: 20 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="chart-title" style={{ marginBottom: 0 }}>Recent Orders</div>
          <Link href="/super-admin/orders" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No orders yet</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td><span style={{ fontWeight: 600, color: 'var(--accent-light)' }}>{order.orderNumber}</span></td>
                    <td>{order.customer?.name}</td>
                    <td><span style={{ fontWeight: 700 }}>${order.total.toFixed(2)}</span></td>
                    <td><span className={`badge badge-${STATUS_COLORS[order.status] || 'muted'}`}>{order.status}</span></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
