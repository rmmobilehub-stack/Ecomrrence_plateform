import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { readDb, updateOne } from '@/lib/db';
import type { RepairBooking } from '@/lib/types';

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

  const updated = await updateOne<RepairBooking>('repair-bookings', booking.id, { status: body.status });
  return NextResponse.json({ booking: updated });
}
