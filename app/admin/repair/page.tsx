'use client';

import { Phone, RefreshCw, Wrench } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { RepairBooking } from '@/lib/types';

export default function AdminRepairPage() {
  const [bookings, setBookings] = useState<RepairBooking[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const query = status ? `?status=${status}` : '';
    const response = await fetch(`/api/admin/repair-bookings${query}`);
    const data = await response.json();
    setBookings(data.bookings ?? []);
    setLoading(false);
  }, [status]);

  useEffect(() => { void load(); }, [load]);

  const changeStatus = async (id: string, nextStatus: RepairBooking['status']) => {
    const response = await fetch('/api/admin/repair-bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: nextStatus }),
    });
    if (response.ok) {
      setBookings((current) => current.map((booking) => (booking.id === id ? { ...booking, status: nextStatus } : booking)));
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">DOORSTEP SERVICE</p>
          <h1 className="page-title">Repair</h1>
          <p className="page-subtitle">iPhone doorstep repair bookings — review address, device details and contact the client.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      <div className="filter-bar">
        <select className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          {['pending', 'confirmed', 'scheduled', 'completed', 'cancelled'].map((value) => (
            <option key={value} value={value}>{value}</option>
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
              <tr><td colSpan={7}>Loading repair bookings…</td></tr>
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
                      onChange={(event) => void changeStatus(booking.id, event.target.value as RepairBooking['status'])}
                    >
                      {['pending', 'confirmed', 'scheduled', 'completed', 'cancelled'].map((value) => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
