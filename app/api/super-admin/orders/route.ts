import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { readDb } from '@/lib/db';
import type { Order, Store } from '@/lib/types';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orders = await readDb<Order>('orders');
  const stores = await readDb<Store>('stores');
  const sorted = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json({ orders: sorted.map((order) => {
    const store = stores.find((entry) => entry.id === order.storeId);
    return { ...order, store: store ? { id: store.id, name: store.name, slug: store.slug, currency: store.currency } : null };
  }) });
}
