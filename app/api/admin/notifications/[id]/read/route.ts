import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { readDb, updateOne } from '@/lib/db';
import type { Notification } from '@/lib/types';

export async function PUT(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const notifications = await readDb<Notification>('notifications');
  if (!notifications.some(notification => notification.id === params.id && notification.adminId === session.id)) return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
  await updateOne<Notification>('notifications', params.id, { isRead: true }); return NextResponse.json({ success: true });
}
