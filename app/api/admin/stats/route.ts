import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { readDb } from '@/lib/db';
import type { Product, Order, Category, Store } from '@/lib/types';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const products = await readDb<Product>('products');
  const orders = await readDb<Order>('orders');
  const categories = await readDb<Category>('categories');
  const stores = await readDb<Store>('stores');
  const store = stores.find((entry) => entry.id === session.storeId);

  const storeProducts = products.filter((p) => p.storeId === session.storeId);
  const storeOrders = orders.filter((o) => o.storeId === session.storeId);
  const storeCategories = categories.filter((c) => c.storeId === session.storeId);

  const totalRevenue = storeOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = storeOrders.filter((o) => o.status === 'pending').length;
  const deliveredOrders = storeOrders.filter((o) => o.status === 'delivered').length;

  // Revenue chart data - last 7 days
  const revenueChart = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayRevenue = storeOrders
      .filter((o) => {
        const d = new Date(o.createdAt);
        return (
          d.getDate() === date.getDate() &&
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear() &&
          o.status !== 'cancelled'
        );
      })
      .reduce((sum, o) => sum + o.total, 0);
    revenueChart.push({ day: dayStr, revenue: dayRevenue });
  }

  return NextResponse.json({
    totalProducts: storeProducts.length,
    totalOrders: storeOrders.length,
    pendingOrders,
    deliveredOrders,
    totalCategories: storeCategories.length,
    totalRevenue,
    recentOrders: storeOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
    revenueChart,
    store: store ? { id: store.id, name: store.name, slug: store.slug, logo: store.logo, currency: store.currency, isActive: store.isActive } : null,
  });
}
