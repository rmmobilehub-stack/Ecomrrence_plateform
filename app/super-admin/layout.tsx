'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { href: '/super-admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/super-admin/admins', label: 'Admins', icon: '👤' },
  { href: '/super-admin/stores', label: 'Stores', icon: '🏪' },
  { href: '/super-admin/orders', label: 'All Orders', icon: '📋' },
  { href: '/super-admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/super-admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setUser(d.user));
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/super-admin/login');
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  if (pathname === '/super-admin/login') return <>{children}</>;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">⚡</div>
          <div>
            <div className="sidebar-logo-text">ShopSaaS</div>
            <div className="sidebar-logo-sub">Super Admin</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Navigation</div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item ${isActive(item.href, item.exact) ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="sidebar-item w-full" style={{ color: 'var(--error)' }}>
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <div className="dashboard-header-title">
              {navItems.find((n) => isActive(n.href, n.exact))?.label || 'Super Admin'}
            </div>
            <div className="dashboard-header-sub">Platform Management Console</div>
          </div>
          <div className="dashboard-header-right">
            <div style={{ fontSize: '0.75rem', background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: 100, padding: '3px 12px', color: '#ff4d6d', fontWeight: 600 }}>
              🔐 Super Admin
            </div>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
