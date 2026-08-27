import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { readDb, writeDb } from '@/lib/db';
import type { Notification } from '@/lib/types';

export async function PUT() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const notifications = await readDb<Notification>('notifications.json');
  await writeDb('notifications.json', notifications.map(notification => notification.adminId === session.id ? { ...notification, isRead: true } : notification));
  return NextResponse.json({ success: true });
}
