import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { readDb, updateOne, writeDb } from '@/lib/db';
import type { Notification } from '@/lib/types';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const notifications = await readDb<Notification>('notifications');
  const adminNotifs = notifications
    .filter((n) => n.adminId === session.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 30);

  const unreadCount = adminNotifs.filter((n) => !n.isRead).length;
  return NextResponse.json({ notifications: adminNotifs, unreadCount });
}

export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action, id } = await req.json();

  if (action === 'read-all') {
    const notifications = await readDb<Notification>('notifications');
    const updated = notifications.map((n) =>
      n.adminId === session.id ? { ...n, isRead: true } : n
    );
    await writeDb<Notification>('notifications', updated);
    return NextResponse.json({ success: true });
  }

  if (action === 'read' && id) {
    const notifications = await readDb<Notification>('notifications');
    if (!notifications.some((notification) => notification.id === id && notification.adminId === session.id)) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }
    await updateOne<Notification>('notifications', id, { isRead: true });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
