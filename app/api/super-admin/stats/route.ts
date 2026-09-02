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

  const activeAdmins = admins.filter((a) => a.status === 'active').length;
  const activeStores = stores.filter((s) => s.isActive).length;
  const storeBreakdown = stores.map((store) => {
    const storeProducts = products.filter((product) => product.storeId === store.id);
    const storeOrders = orders.filter((order) => order.storeId === store.id);
    const revenue = storeOrders.filter((order) => order.status !== 'cancelled').reduce((sum, order) => sum + order.total, 0);
    const assignedAdmins = admins.filter((admin) => admin.storeId === store.id);
    const lastOrder = [...storeOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    return {
      id: store.id,
      name: store.name,
      slug: store.slug,
      logo: store.logo,
      currency: store.currency,
      isActive: store.isActive,
      admins: assignedAdmins.map((admin) => ({ id: admin.id, name: admin.name, email: admin.email, status: admin.status })),
      admin: assignedAdmins[0] ? { id: assignedAdmins[0].id, name: assignedAdmins[0].name, email: assignedAdmins[0].email, status: assignedAdmins[0].status } : null,
      products: storeProducts.length,
      activeProducts: storeProducts.filter((product) => product.status === 'active').length,
      orders: storeOrders.length,
      pendingOrders: storeOrders.filter((order) => order.status === 'pending').length,
      revenue,
      lastOrderAt: lastOrder?.createdAt ?? null,
    };
  });

  const revenueByCurrency = Object.entries(storeBreakdown.reduce<Record<string, number>>((totals, store) => {
    totals[store.currency] = (totals[store.currency] ?? 0) + store.revenue;
    return totals;
  }, {})).map(([currency, total]) => ({ currency, total }));

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
    revenueByCurrency,
    storeBreakdown,
  });
}
