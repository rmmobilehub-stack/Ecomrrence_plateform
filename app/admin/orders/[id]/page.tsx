'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatMoney } from '@/lib/currency';
import { useAdminStore } from '@/components/admin/useAdminStore';
import { openWhatsAppApp } from '@/lib/whatsapp';

type Order = {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    country: string;
    notes?: string;
  };
  items: {
    productName: string;
    qty: number;
    price: number;
    selectedVariants: Record<string, string>;
  }[];
  total: number;
  status: string;
  channel?: 'website' | 'whatsapp';
  adminNote?: string;
};

export default function OrderPage({ params }: { params: { id: string } }) {
  const store = useAdminStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [draftStatus, setDraftStatus] = useState('');
  const [note, setNote] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/admin/orders/${params.id}`)
      .then((response) => response.json())
      .then((data) => {
        setOrder(data.order);
        if (data.order?.adminNote) setNote(data.order.adminNote);
      });
  }, [params.id]);

  if (!order) return <p>Loading order…</p>;

  const isWhatsApp = order.channel === 'whatsapp';

  const confirmStatusUpdate = async () => {
    setSaving(true);
    setFeedback('');
    const response = await fetch(`/api/admin/orders/${order.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: draftStatus, adminNote: note, notifyCustomer: true }),
    });
    const data = await response.json();
    setSaving(false);

    if (!response.ok || !data.order) {
      setFeedback(data.error || 'Could not update status');
      return;
    }

    setOrder(data.order);
    if (data.notify?.phone && data.notify.message) {
      openWhatsAppApp(data.notify.phone, data.notify.message);
    }

    const emailLine = data.notify?.emailSent
      ? 'Email sent.'
      : data.notify?.emailReason === 'email_not_configured'
        ? 'Email skipped (add SMTP settings in .env).'
        : data.notify?.emailReason === 'missing_or_invalid_email'
          ? 'Email skipped (customer has no email).'
          : 'Email not sent.';

    setFeedback(`Status updated. WhatsApp opened with message. ${emailLine}`);
    setOpen(false);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">{order.orderNumber}</h1>
          <p className="page-subtitle">
            {isWhatsApp ? 'WhatsApp order request · customer confirmation pending' : 'Cash on delivery'} ·{' '}
            {formatMoney(order.total, store?.currency ?? 'PKR')}
          </p>
        </div>
        <select
          className="form-select status-select"
          value={order.status}
          onChange={(event) => {
            const next = event.target.value;
            if (next === order.status) return;
            setDraftStatus(next);
            setNote(order.adminNote || '');
            setFeedback('');
            setOpen(true);
          }}
        >
          {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </div>

      {feedback ? <p className="payment-note">{feedback}</p> : null}

      {isWhatsApp && (
        <div className="payment-note">
          <strong>WhatsApp tracking</strong>
          <span>
            This request is already saved in the system. Confirm customer details in WhatsApp, then move its
            status from pending to confirmed, processing, shipped or delivered.
          </span>
        </div>
      )}

      <div className="detail-grid">
        <section className="glass-card form-panel">
          <h2>Items</h2>
          {order.items.map((item, index) => (
            <div className="list-row" key={index}>
              <span>
                <strong>{item.productName}</strong>
                <small>
                  {Object.entries(item.selectedVariants ?? {})
                    .map(([name, value]) => `${name}: ${value}`)
                    .join(', ')}
                </small>
              </span>
              <span>
                {item.qty} × {formatMoney(item.price, store?.currency ?? 'PKR')}
              </span>
            </div>
          ))}
        </section>
        <section className="glass-card form-panel">
          <h2>Delivery details</h2>
          <p>
            <strong>{order.customer.name}</strong>
            <br />
            {order.customer.phone}
            <br />
            {order.customer.email}
            <br />
            {order.customer.address}, {order.customer.city}, {order.customer.country}
          </p>
          {order.customer.notes && <p className="text-secondary mt-4">Customer note: {order.customer.notes}</p>}
          {order.adminNote && <p className="text-secondary mt-4">Team note: {order.adminNote}</p>}
        </section>
      </div>

      <button className="btn btn-secondary mt-4" onClick={() => router.push('/admin/orders')}>
        Back to orders
      </button>

      {open ? (
        <div className="modal-overlay" role="presentation" onClick={() => !saving && setOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Update & notify</h2>
                <p className="modal-subtitle">
                  {order.orderNumber} → <strong>{draftStatus}</strong>
                </p>
              </div>
            </div>
            <div className="modal-body">
              <label className="form-label" htmlFor="order-admin-note">
                Team note (shown in WhatsApp + email)
              </label>
              <textarea
                id="order-admin-note"
                className="form-input"
                rows={4}
                maxLength={500}
                placeholder="Example: Rider leaves in 20 minutes. Please keep COD ready."
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
              <p className="modal-subtitle" style={{ marginTop: 10 }}>
                On confirm: status saves, WhatsApp opens with this note, and email triggers if configured.
              </p>
              {feedback ? <p className="modal-form-error">{feedback}</p> : null}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" disabled={saving} onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" disabled={saving} onClick={() => void confirmStatusUpdate()}>
                {saving ? 'Saving…' : 'Update & open WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
