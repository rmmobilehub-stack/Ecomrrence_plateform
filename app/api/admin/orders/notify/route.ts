import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSessionFromRequest } from '@/lib/auth';
import { insertOne, readDb } from '@/lib/db';
import type { Notification, Order } from '@/lib/types';

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { orderId } = await request.json(); const orders = await readDb<Order>('orders.json'); const order = orders.find(entry => entry.id === orderId && entry.storeId === session.storeId);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  const notification: Notification = { id: uuidv4(), adminId: session.id, type: 'new_order', title: 'Order reminder', message: `${order.orderNumber} is currently ${order.status}.`, orderId: order.id, isRead: false, createdAt: new Date().toISOString() };
  await insertOne('notifications.json', notification); return NextResponse.json({ notification }, { status: 201 });
}
