import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { readDb } from '@/lib/db';
import type { Admin, Store, Product, Order } from '@/lib/types';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admins = await readDb<Admin>('admins');
  const stores = await readDb<Store>('stores');
  const products = await readDb<Product>('products');
  const orders = await readDb<Order>('orders');

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const activeAdmins = admins.filter((a) => a.status === 'active').length;
  const activeStores = stores.filter((s) => s.isActive).length;

  // Orders over last 7 days
  const now = Date.now();
  const ordersLast7Days = orders.filter(
    (o) => now - new Date(o.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
  ).length;

  return NextResponse.json({
    totalAdmins: admins.length,
    activeAdmins,
    totalStores: stores.length,
    activeStores,
    totalProducts: products.length,
    totalOrders: orders.length,
    ordersLast7Days,
    totalRevenue,
  });
}
