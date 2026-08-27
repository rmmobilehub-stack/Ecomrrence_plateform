import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { readDb, updateOne } from '@/lib/db';
import type { Order, Product } from '@/lib/types';

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

  if (existing.channel === 'whatsapp' && existing.status === 'pending' && status === 'confirmed') {
    const products = await readDb<Product>('products.json');
    for (const item of existing.items) {
      const product = products.find(entry => entry.id === item.productId && entry.storeId === session.storeId);
      if (!product || product.stock < item.qty) {
        return NextResponse.json({ error: `${item.productName} no longer has enough stock to confirm this order` }, { status: 400 });
      }
    }
    await Promise.all(existing.items.map(item => {
      const product = products.find(entry => entry.id === item.productId)!;
      return updateOne<Product>('products.json', product.id, { stock: product.stock - item.qty, updatedAt: new Date().toISOString() });
    }));
  }

  const updated = await updateOne<Order>('orders.json', params.id, { status });
  return NextResponse.json({ order: updated });
}
