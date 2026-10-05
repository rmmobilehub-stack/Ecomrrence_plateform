import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { appendStatusUpdate, buildStatusNotifyMessage } from '@/lib/customer-notify';
import { findById, readDb, updateOne } from '@/lib/db';
import { sendCustomerEmail } from '@/lib/email';
import type { Order, Product, Store } from '@/lib/types';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orders = await readDb<Order>('orders');
  const order = orders.find((o) => o.id === params.id && o.storeId === session.storeId);

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orders = await readDb<Order>('orders');
  const existing = orders.find((o) => o.id === params.id && o.storeId === session.storeId);
  if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const body = await req.json();
  const status = body.status as Order['status'];
  const validStatuses: Order['status'][] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  if (existing.channel === 'whatsapp' && existing.status === 'pending' && status === 'confirmed') {
    const products = await readDb<Product>('products');
    for (const item of existing.items) {
      const product = products.find((entry) => entry.id === item.productId && entry.storeId === session.storeId);
      if (!product || product.stock < item.qty) {
        return NextResponse.json(
          { error: `${item.productName} no longer has enough stock to confirm this order` },
          { status: 400 }
        );
      }
    }
    await Promise.all(
      existing.items.map((item) => {
        const product = products.find((entry) => entry.id === item.productId)!;
        return updateOne<Product>('products', product.id, {
          stock: product.stock - item.qty,
          updatedAt: new Date().toISOString(),
        });
      })
    );
  }

  const note = typeof body.adminNote === 'string' ? body.adminNote.trim().slice(0, 500) : '';
  const store = session.storeId ? await findById<Store>('stores', session.storeId) : null;
  const storeName = store?.name || 'Our store';
  const notifyCustomer = body.notifyCustomer !== false;

  const message = buildStatusNotifyMessage({
    storeName,
    referenceLabel: 'Order',
    referenceNumber: existing.orderNumber,
    customerName: existing.customer.name || 'there',
    status,
    note,
    extraLines: [`Total: ${existing.total}`],
  });

  let emailSent = false;
  let emailReason: string | undefined;

  if (notifyCustomer) {
    const emailResult = await sendCustomerEmail({
      to: existing.customer.email || '',
      subject: `${storeName}: order ${existing.orderNumber} → ${status}`,
      text: message,
      brandName: storeName,
    });
    emailSent = emailResult.sent;
    emailReason = emailResult.reason;
  }

  const statusEntry = {
    status,
    note,
    at: new Date().toISOString(),
    emailSent,
  };

  const updated = await updateOne<Order>('orders', params.id, {
    status,
    adminNote: note || existing.adminNote,
    statusUpdates: appendStatusUpdate(existing.statusUpdates, statusEntry),
  });

  return NextResponse.json({
    order: updated,
    notify: notifyCustomer
      ? {
          phone: existing.customer.phone,
          message,
          emailSent,
          emailReason,
        }
      : null,
  });
}
