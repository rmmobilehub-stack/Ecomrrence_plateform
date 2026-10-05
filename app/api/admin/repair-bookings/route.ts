import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { appendStatusUpdate, buildStatusNotifyMessage } from '@/lib/customer-notify';
import { findById, readDb, updateOne } from '@/lib/db';
import { sendCustomerEmail } from '@/lib/email';
import type { RepairBooking, Store } from '@/lib/types';

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get('status') || '';
  const bookings = (await readDb<RepairBooking>('repair-bookings'))
    .filter((booking) => booking.storeId === session.storeId)
    .filter((booking) => !status || booking.status === status)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ bookings });
}

export async function PATCH(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const statuses: RepairBooking['status'][] = ['pending', 'confirmed', 'scheduled', 'completed', 'cancelled'];
  if (!body.id || !statuses.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid repair status' }, { status: 400 });
  }

  const bookings = await readDb<RepairBooking>('repair-bookings');
  const booking = bookings.find((entry) => entry.id === body.id && entry.storeId === session.storeId);
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  const note = typeof body.adminNote === 'string' ? body.adminNote.trim().slice(0, 500) : '';
  const store = session.storeId ? await findById<Store>('stores', session.storeId) : null;
  const storeName = store?.name || 'Our store';

  const message = buildStatusNotifyMessage({
    storeName,
    referenceLabel: 'Repair booking',
    referenceNumber: booking.bookingNumber,
    customerName: booking.customer.name || 'there',
    status: body.status,
    note,
    extraLines: [
      `Device: ${booking.device.modelName} · ${booking.device.colorName}`,
      `Issue: ${booking.issue.issueName}`,
    ],
  });

  const emailResult = await sendCustomerEmail({
    to: booking.customer.email || '',
    subject: `${storeName}: repair ${booking.bookingNumber} → ${body.status}`,
    text: message,
    brandName: storeName,
  });

  const statusEntry = {
    status: body.status as string,
    note,
    at: new Date().toISOString(),
    emailSent: emailResult.sent,
  };

  const updated = await updateOne<RepairBooking>('repair-bookings', booking.id, {
    status: body.status,
    adminNote: note || booking.adminNote,
    statusUpdates: appendStatusUpdate(booking.statusUpdates, statusEntry),
  });

  return NextResponse.json({
    booking: updated,
    notify: {
      phone: booking.customer.phone,
      message,
      emailSent: emailResult.sent,
      emailReason: emailResult.reason,
    },
  });
}
