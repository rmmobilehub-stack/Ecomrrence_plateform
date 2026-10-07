'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LogOut, Package, ShoppingBag, Wrench } from 'lucide-react';
import { storefrontPath } from '@/lib/storefront-paths';
import { clearCustomerSessionCache } from '@/components/store/ensureCustomerLogin';
import type { Order, RepairBooking } from '@/lib/types';

function formatMoney(amount: number, currency = 'PKR') {
  return `${currency} ${Number(amount || 0).toLocaleString('en-PK')}`;
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

function statusClass(status: string) {
  if (status === 'cancelled') return 'is-danger';
  if (status === 'delivered' || status === 'completed') return 'is-success';
  if (status === 'shipped' || status === 'scheduled' || status === 'confirmed') return 'is-accent';
  return 'is-pending';
}

export default function CustomerAccountPanel({
  slug,
  storeName,
  currency = 'PKR',
}: {
  slug: string;
  storeName: string;
  currency?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [repairs, setRepairs] = useState<RepairBooking[]>([]);
  const loginHref = storefrontPath(slug, 'account/login');
  const shopHref = storefrontPath(slug, 'products');
  const repairHref = storefrontPath(slug, 'repair');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/customer/history?storeSlug=${encodeURIComponent(slug)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login required');
        if (!alive) return;
        setName(data.customer?.name || '');
        setEmail(data.customer?.email || '');
        setOrders(data.orders || []);
        setRepairs(data.repairs || []);
        setError('');
      })
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Could not load account');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  const logout = async () => {
    await fetch('/api/customer/logout', { method: 'POST', credentials: 'same-origin' });
    clearCustomerSessionCache();
    window.location.href = loginHref;
  };

  if (loading) {
    return (
      <div className="customer-account-shell is-loading-state">
        <div className="customer-loading-pulse" />
        <p className="customer-account-muted">Loading your history…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-account-shell is-error-state">
        <p className="form-error">{error}</p>
        <Link className="btn btn-primary" href={loginHref}>
          Login to continue
        </Link>
      </div>
    );
  }

  const initials = (name || email || 'U')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div className="customer-account-shell">
      <header className="customer-account-head">
        <div className="customer-account-identity">
          <div className="customer-avatar" aria-hidden>
            {initials || 'U'}
          </div>
          <div>
            <p className="customer-login-kicker">My account</p>
            <h1>{name || 'Customer'}</h1>
            <p className="customer-account-muted">{email} · {storeName}</p>
          </div>
        </div>
        <button type="button" className="btn btn-secondary customer-logout-btn" onClick={() => void logout()}>
          <LogOut size={16} /> Logout
        </button>
      </header>

      <div className="customer-stat-row">
        <div className="customer-stat-card">
          <span className="customer-stat-icon"><Package size={18} /></span>
          <div>
            <strong>{orders.length}</strong>
            <small>Orders</small>
          </div>
        </div>
        <div className="customer-stat-card">
          <span className="customer-stat-icon is-repair"><Wrench size={18} /></span>
          <div>
            <strong>{repairs.length}</strong>
            <small>Repairs</small>
          </div>
        </div>
      </div>

      <section className="customer-history-block">
        <div className="customer-history-heading">
          <h2>
            <Package size={18} /> Order history
          </h2>
          <Link className="customer-history-link" href={shopHref}>
            <ShoppingBag size={14} /> Shop again
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="customer-empty-card">
            <Package size={22} />
            <strong>No product orders yet</strong>
            <p>When you buy something, it will show here with date and status.</p>
            <Link className="btn btn-primary btn-sm" href={shopHref}>Browse products</Link>
          </div>
        ) : (
          <div className="customer-history-list">
            {orders.map((order) => (
              <article key={order.id} className="customer-history-card">
                <div className="customer-history-card-top">
                  <strong>{order.orderNumber}</strong>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                <p className="customer-history-items">
                  {order.items.map((item) => `${item.qty}× ${item.productName}`).join(', ')}
                </p>
                <footer className="customer-history-card-foot">
                  <span className={`customer-status-pill ${statusClass(order.status)}`}>
                    {order.status}
                  </span>
                  <strong className="customer-history-amount">{formatMoney(order.total, currency)}</strong>
                </footer>
                {order.statusUpdates?.length ? (
                  <ul className="customer-status-updates">
                    {order.statusUpdates.slice(-3).map((entry) => (
                      <li key={`${entry.at}-${entry.status}`}>
                        <strong>{entry.status}</strong>
                        {entry.note ? ` — ${entry.note}` : ''}
                        <small>{formatDate(entry.at)}</small>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="customer-history-block">
        <div className="customer-history-heading">
          <h2>
            <Wrench size={18} /> Repair history
          </h2>
          <Link className="customer-history-link" href={repairHref}>
            Book repair
          </Link>
        </div>
        {repairs.length === 0 ? (
          <div className="customer-empty-card">
            <Wrench size={22} />
            <strong>No repair bookings yet</strong>
            <p>Doorstep repair requests and status updates will appear here.</p>
            <Link className="btn btn-primary btn-sm" href={repairHref}>Book a repair</Link>
          </div>
        ) : (
          <div className="customer-history-list">
            {repairs.map((booking) => (
              <article key={booking.id} className="customer-history-card is-repair">
                <div className="customer-history-card-top">
                  <strong>{booking.bookingNumber}</strong>
                  <span>{formatDate(booking.createdAt)}</span>
                </div>
                <p className="customer-history-items">
                  {booking.device.modelName} · {booking.issue.issueName}
                </p>
                <footer className="customer-history-card-foot">
                  <span className={`customer-status-pill ${statusClass(booking.status)}`}>
                    {booking.status}
                  </span>
                  {booking.deviceEstimate ? (
                    <strong className="customer-history-amount">
                      Score {booking.deviceEstimate.score}/100
                    </strong>
                  ) : null}
                </footer>
                {booking.statusUpdates?.length ? (
                  <ul className="customer-status-updates">
                    {booking.statusUpdates.slice(-3).map((entry) => (
                      <li key={`${entry.at}-${entry.status}`}>
                        <strong>{entry.status}</strong>
                        {entry.note ? ` — ${entry.note}` : ''}
                        <small>{formatDate(entry.at)}</small>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
