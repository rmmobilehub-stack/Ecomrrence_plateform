import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { readDb, insertOne } from '@/lib/db';
import type { Store, Admin, Order, Notification, OrderItem } from '@/lib/types';

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const stores = await readDb<Store>('stores.json');
    const store = stores.find((s) => s.slug === params.slug && s.isActive);
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const body = await req.json();
    const { customer, items } = body;

    // Validate required customer fields
    if (!customer?.name || !customer?.phone || !customer?.email || !customer?.address || !customer?.city) {
      return NextResponse.json({ error: 'All customer details required' }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: OrderItem) => sum + item.price * item.qty,
      0
    );
    const total = subtotal;

    // Generate order number
    const existingOrders = await readDb<Order>('orders.json');
    const orderNumber = `ORD-${String(existingOrders.length + 1).padStart(4, '0')}`;

    const newOrder: Order = {
      id: uuidv4(),
      storeId: store.id,
      orderNumber,
      customer,
      items,
      subtotal,
      total,
      paymentMethod: 'COD',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await insertOne<Order>('orders.json', newOrder);

    // Find the store's admin and create notification
    const admins = await readDb<Admin>('admins.json');
    const admin = admins.find((a) => a.storeId === store.id);

    if (admin) {
      const notification: Notification = {
        id: uuidv4(),
        adminId: admin.id,
        type: 'new_order',
        title: '🛍️ New Order Received!',
        message: `Order ${orderNumber} for $${total.toFixed(2)} from ${customer.name}`,
        orderId: newOrder.id,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      await insertOne<Notification>('notifications.json', notification);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: newOrder.id,
        orderNumber: newOrder.orderNumber,
        total: newOrder.total,
        status: newOrder.status,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Order error:', error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}
