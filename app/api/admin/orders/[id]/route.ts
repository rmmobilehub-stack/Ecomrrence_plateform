import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { readDb, updateOne } from '@/lib/db';
import type { Order } from '@/lib/types';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orders = await readDb<Order>('orders.json');
  const order = orders.find((o) => o.id === params.id && o.storeId === session.storeId);

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orders = await readDb<Order>('orders.json');
  const existing = orders.find((o) => o.id === params.id && o.storeId === session.storeId);
  if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const { status } = await req.json();
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const updated = await updateOne<Order>('orders.json', params.id, { status });
  return NextResponse.json({ order: updated });
}
