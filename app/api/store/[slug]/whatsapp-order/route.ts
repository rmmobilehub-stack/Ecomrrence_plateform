import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { insertOne, readDb } from '@/lib/db';
import type { Admin, Notification, Order, Product, Store } from '@/lib/types';
import { calculateDeliveryFee, calculateProductPrice } from '@/lib/pricing';
import { isValidWhatsAppNumber } from '@/lib/whatsapp';

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const stores = await readDb<Store>('stores');
    const store = stores.find(entry => entry.slug === params.slug && entry.isActive);
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    if (!isValidWhatsAppNumber(store.whatsappNumber)) return NextResponse.json({ error: 'WhatsApp ordering is not enabled for this store' }, { status: 400 });

    const { productId, qty, selectedVariants = {} } = await req.json();
    const quantity = Number(qty);
    const products = await readDb<Product>('products');
    const product = products.find(entry => entry.id === productId && entry.storeId === store.id && entry.status === 'active');
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) return NextResponse.json({ error: 'This product is unavailable or out of stock' }, { status: 400 });

    for (const variant of product.variants ?? []) {
      if (!variant.options.includes(selectedVariants[variant.name])) return NextResponse.json({ error: `Choose a valid ${variant.name}` }, { status: 400 });
    }

    const modifier = (product.variants ?? []).reduce((sum, variant) => sum + (selectedVariants[variant.name] ? Number(variant.priceModifier ?? 0) : 0), 0);
    const itemPrice = calculateProductPrice(product.price, product.discount, modifier);
    const originalPrice = product.price + modifier;
    const subtotal = itemPrice * quantity;
    const productDiscount = (originalPrice - itemPrice) * quantity;
    const deliveryFee = calculateDeliveryFee(store.deliveryFee, store.freeDeliveryThreshold, subtotal);
    const orders = await readDb<Order>('orders');
    const whatsappOrderCount = orders.filter(order => order.orderNumber.startsWith('WA-ORD-')).length + 1;
    const orderNumber = `WA-ORD-${String(whatsappOrderCount).padStart(4, '0')}`;
    const order: Order = {
      id: uuidv4(), storeId: store.id, orderNumber,
      customer: { name: 'WhatsApp customer', phone: '', email: '', address: '', city: '', country: '', notes: 'Order request created before the WhatsApp conversation. Confirm customer details and stock in WhatsApp.' },
      items: [{ productId: product.id, productName: product.name, thumbnail: product.thumbnail, qty: quantity, price: itemPrice, originalPrice, selectedVariants }],
      subtotal, productDiscount, deliveryFee, total: subtotal + deliveryFee, paymentMethod: 'COD', channel: 'whatsapp', status: 'pending', createdAt: new Date().toISOString(),
    };
    await insertOne<Order>('orders', order);

    const admins = await readDb<Admin>('admins');
    const admin = admins.find(entry => entry.storeId === store.id);
    if (admin) {
      const notification: Notification = { id: uuidv4(), adminId: admin.id, type: 'new_order', title: 'WhatsApp order request', message: `${orderNumber}: ${quantity} × ${product.name} awaiting customer confirmation`, orderId: order.id, isRead: false, createdAt: new Date().toISOString() };
      await insertOne<Notification>('notifications', notification);
    }

    return NextResponse.json({ success: true, order: { id: order.id, orderNumber: order.orderNumber, total: order.total, status: order.status, channel: order.channel } }, { status: 201 });
  } catch (error) {
    console.error('WhatsApp order error:', error);
    return NextResponse.json({ error: 'Could not create WhatsApp order request' }, { status: 500 });
  }
}
