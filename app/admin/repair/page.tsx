'use client';

import { Phone, RefreshCw, Wrench } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { openWhatsAppApp } from '@/lib/whatsapp';
import type { RepairBooking } from '@/lib/types';

type StatusDraft = {
  booking: RepairBooking;
  nextStatus: RepairBooking['status'];
  note: string;
};

export default function AdminRepairPage() {
  const [bookings, setBookings] = useState<RepairBooking[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<StatusDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const query = status ? `?status=${status}` : '';
    const response = await fetch(`/api/admin/repair-bookings${query}`);
    const data = await response.json();
    setBookings(data.bookings ?? []);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const openStatusModal = (booking: RepairBooking, nextStatus: RepairBooking['status']) => {
    if (nextStatus === booking.status) return;
    setFeedback('');
    setDraft({
      booking,
      nextStatus,
      note: booking.adminNote || '',
    });
  };

  const confirmStatusUpdate = async () => {
    if (!draft) return;
    setSaving(true);
    setFeedback('');

    const response = await fetch('/api/admin/repair-bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: draft.booking.id,
        status: draft.nextStatus,
        adminNote: draft.note,
      }),
    });
    const data = await response.json();
    setSaving(false);

    if (!response.ok || !data.booking) {
      setFeedback(data.error || 'Could not update status');
      return;
    }

    setBookings((current) =>
      current.map((booking) => (booking.id === data.booking.id ? data.booking : booking))
    );

    const notify = data.notify as
      | { phone?: string; message?: string; emailSent?: boolean; emailReason?: string }
      | undefined;

    if (notify?.phone && notify.message) {
      openWhatsAppApp(notify.phone, notify.message);
    }

    const emailLine = notify?.emailSent
      ? 'Email sent.'
      : notify?.emailReason === 'email_not_configured'
        ? 'Email skipped (add SMTP settings in .env).'
        : notify?.emailReason === 'missing_or_invalid_email'
          ? 'Email skipped (customer has no email).'
          : 'Email not sent.';

    setFeedback(`Status updated. WhatsApp opened with message. ${emailLine}`);
    setDraft(null);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">DOORSTEP SERVICE</p>
          <h1 className="page-title">Repair</h1>
          <p className="page-subtitle">
            Update status, add a team note, then WhatsApp + email go out to the customer.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {feedback ? <p className="payment-note">{feedback}</p> : null}

      <div className="filter-bar">
        <select className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          {['pending', 'confirmed', 'scheduled', 'completed', 'cancelled'].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="glass-card table-container">
        <table className="data-table repair-admin-table">
          <thead>
            <tr>
              <th>Booking</th>
              <th>Client</th>
              <th>Device</th>
              <th>Issue</th>
              <th>Address</th>
              <th>Schedule</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7}>Loading repair bookings…</td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="leads-empty">
                    <Wrench size={24} />
                    <strong>No repair bookings yet</strong>
                    <span>New doorstep repair requests will appear here.</span>
                  </div>
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <strong>{booking.bookingNumber}</strong>
                    <small>{new Date(booking.createdAt).toLocaleString()}</small>
                    {booking.adminNote ? <small>Note: {booking.adminNote}</small> : null}
                    {booking.deviceEstimate ? (
                      <small>
                        Score {booking.deviceEstimate.score}/100 · Worth PKR{' '}
                        {booking.deviceEstimate.marketValueMinPkr.toLocaleString('en-PK')}–
                        {booking.deviceEstimate.marketValueMaxPkr.toLocaleString('en-PK')}
                      </small>
                    ) : null}
                  </td>
                  <td>
                    <strong>{booking.customer.name}</strong>
                    <a className="lead-contact" href={`tel:${booking.customer.phone.replace(/[^+\d]/g, '')}`}>
                      <Phone size={13} /> {booking.customer.phone}
                    </a>
                    {booking.customer.email && <small>{booking.customer.email}</small>}
                  </td>
                  <td>
                    <div className="repair-admin-device">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={booking.device.imageUrl} alt={booking.device.modelName} />
                      <div>
                        <strong>{booking.device.modelName}</strong>
                        <small>
                          <span className="repair-admin-swatch" style={{ background: booking.device.colorHex }} />
                          {booking.device.colorName}
                        </small>
                        {booking.device.simTypeName && <small>SIM: {booking.device.simTypeName}</small>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>{booking.issue.issueName}</strong>
                    {booking.issue.detail && <small>{booking.issue.detail}</small>}
                    {booking.customer.notes && <small>{booking.customer.notes}</small>}
                    {booking.deviceEstimate?.suggestions?.[0] ? (
                      <small>Tip: {booking.deviceEstimate.suggestions[0]}</small>
                    ) : null}
                  </td>
                  <td>
                    <strong>{booking.customer.city}</strong>
                    <small>{booking.customer.address}</small>
                    {typeof booking.customer.lat === 'number' && typeof booking.customer.lng === 'number' && (
                      <small>
                        <a
                          href={`https://maps.google.com/?q=${booking.customer.lat},${booking.customer.lng}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open map pin
                        </a>
                      </small>
                    )}
                  </td>
                  <td>
                    <small>
                      {booking.preferredDate || 'Flexible'}
                      {booking.preferredTime ? ` · ${booking.preferredTime}` : ''}
                    </small>
                  </td>
                  <td>
                    <select
                      className="form-select status-select"
                      value={booking.status}
                      onChange={(event) =>
                        openStatusModal(booking, event.target.value as RepairBooking['status'])
                      }
                    >
                      {['pending', 'confirmed', 'scheduled', 'completed', 'cancelled'].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {draft ? (
        <div className="modal-overlay" role="presentation" onClick={() => !saving && setDraft(null)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Update & notify</h2>
                <p className="modal-subtitle">
                  {draft.booking.bookingNumber} → <strong>{draft.nextStatus}</strong>
                </p>
              </div>
            </div>
            <div className="modal-body">
              <label className="form-label" htmlFor="repair-admin-note">
                Team note (shown in WhatsApp + email)
              </label>
              <textarea
                id="repair-admin-note"
                className="form-input"
                rows={4}
                maxLength={500}
                placeholder="Example: Inspection team will call you today between 4–6 PM. Estimated discussion after check."
                value={draft.note}
                onChange={(event) => setDraft({ ...draft, note: event.target.value })}
              />
              <p className="modal-subtitle" style={{ marginTop: 10 }}>
                On confirm: status saves, WhatsApp opens with the customer message, and email triggers if
                configured.
              </p>
              {feedback ? <p className="modal-form-error">{feedback}</p> : null}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" disabled={saving} onClick={() => setDraft(null)}>
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
