'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LogOut, Package, Wrench } from 'lucide-react';
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
    return <div className="customer-account-shell"><p className="customer-account-muted">Loading your history…</p></div>;
  }

  if (error) {
    return (
      <div className="customer-account-shell">
        <p className="form-error">{error}</p>
        <Link className="btn btn-primary" href={loginHref}>
          Login to continue
        </Link>
      </div>
    );
  }

  return (
    <div className="customer-account-shell">
      <header className="customer-account-head">
        <div>
          <p className="customer-login-kicker">My account</p>
          <h1>{name || 'Customer'}</h1>
          <p className="customer-account-muted">{email} · {storeName}</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => void logout()}>
          <LogOut size={16} /> Logout
        </button>
      </header>

      <section className="customer-history-block">
        <h2>
          <Package size={18} /> Orders
        </h2>
        {orders.length === 0 ? (
          <p className="customer-account-muted">No product orders yet.</p>
        ) : (
          <div className="customer-history-list">
            {orders.map((order) => (
              <article key={order.id} className="customer-history-card">
                <div>
                  <strong>{order.orderNumber}</strong>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                <p>
                  {order.items.map((item) => `${item.qty}× ${item.productName}`).join(', ')}
                </p>
                <footer>
                  <span className={`badge badge-${order.status === 'cancelled' ? 'danger' : 'info'}`}>
                    {order.status}
                  </span>
                  <strong>{formatMoney(order.total, currency)}</strong>
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
        <h2>
          <Wrench size={18} /> Repair bookings
        </h2>
        {repairs.length === 0 ? (
          <p className="customer-account-muted">No repair bookings yet.</p>
        ) : (
          <div className="customer-history-list">
            {repairs.map((booking) => (
              <article key={booking.id} className="customer-history-card">
                <div>
                  <strong>{booking.bookingNumber}</strong>
                  <span>{formatDate(booking.createdAt)}</span>
                </div>
                <p>
                  {booking.device.modelName} · {booking.issue.issueName}
                </p>
                <footer>
                  <span className={`badge badge-${booking.status === 'cancelled' ? 'danger' : 'info'}`}>
                    {booking.status}
                  </span>
                  {booking.deviceEstimate ? (
                    <strong>
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
