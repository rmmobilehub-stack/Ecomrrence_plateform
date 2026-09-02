import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { readDb, insertOne } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import type { Store, Admin, Order, Product } from '@/lib/types';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stores = await readDb<Store>('stores');
  const admins = await readDb<Admin>('admins');
  const products = await readDb<Product>('products');
  const orders = await readDb<Order>('orders');

  const result = stores.map((store) => {
    const storeAdmins = admins.filter((admin) => admin.storeId === store.id);
    const storeProducts = products.filter((product) => product.storeId === store.id);
    const storeOrders = orders.filter((order) => order.storeId === store.id);
    return {
      ...store,
      admins: storeAdmins.map((admin) => ({ id: admin.id, name: admin.name, email: admin.email, status: admin.status })),
      admin: storeAdmins[0] ? { id: storeAdmins[0].id, name: storeAdmins[0].name, email: storeAdmins[0].email, status: storeAdmins[0].status } : null,
      productCount: storeProducts.length,
      activeProductCount: storeProducts.filter((product) => product.status === 'active').length,
      orderCount: storeOrders.length,
      revenue: storeOrders.filter((order) => order.status !== 'cancelled').reduce((sum, order) => sum + order.total, 0),
    };
  });

  return NextResponse.json({ stores: result });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'super-admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const name = String(body.name ?? '').trim();
  const slug = String(body.slug || name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (!name || !slug || !body.contactEmail) return NextResponse.json({ error: 'Store name, URL and contact email are required' }, { status: 400 });
  const stores = await readDb<Store>('stores');
  if (stores.some((store) => store.slug.toLowerCase() === slug)) return NextResponse.json({ error: 'This store URL is already in use' }, { status: 409 });
  const store: Store = {
    id: uuidv4(), adminId: null, name, slug,
    description: 'A carefully selected online collection with simple ordering and personal support.',
    logo: '', banner: '', heroSlides: [], heroTitle: 'Everyday favourites, selected for you.',
    heroCtaLabel: 'Shop the collection', announcement: 'Cash on delivery available',
    aboutTitle: 'Products chosen for real everyday use.',
    aboutDescription: 'Browse clear product details, order with confidence and get personal support when you need it.',
    primaryColor: '#2563eb', currency: ['PKR', 'USD', 'EUR', 'GBP'].includes(body.currency) ? body.currency : 'PKR',
    contactEmail: String(body.contactEmail).trim().toLowerCase(), contactWidgetMode: 'chatbot',
    deliveryFee: 0, freeDeliveryThreshold: 0, socialLinks: {}, isActive: true, createdAt: new Date().toISOString(),
  };
  try { await insertOne<Store>('stores', store); }
  catch (error) { console.error('Create store failed:', error); return NextResponse.json({ error: 'Could not create this store' }, { status: 500 }); }
  return NextResponse.json({ store: { ...store, admins: [], productCount: 0, activeProductCount: 0, orderCount: 0, revenue: 0 } }, { status: 201 });
}
