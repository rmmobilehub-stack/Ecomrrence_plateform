import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { readDb, insertOne, updateOne } from '@/lib/db';
import type { Store, Admin, Order, Notification, OrderItem, Product, Discount } from '@/lib/types';
import { calculateDeliveryFee, calculateProductPrice } from '@/lib/pricing';

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const stores = await readDb<Store>('stores');
    const store = stores.find((s) => s.slug === params.slug && s.isActive);
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const body = await req.json();
    const { customer, items, couponCode } = body;

    // Validate required customer fields
    if (!customer?.name || !customer?.phone || !customer?.email || !customer?.address || !customer?.city || !customer?.country) {
      return NextResponse.json({ error: 'All customer details required' }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const products = await readDb<Product>('products');
    const orderItems: OrderItem[] = [];
    for (const rawItem of items) {
      const product = products.find((item) => item.id === rawItem.productId && item.storeId === store.id && item.status === 'active');
      const quantity = Number(rawItem.qty);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) {
        return NextResponse.json({ error: 'One or more cart items are unavailable or out of stock' }, { status: 400 });
      }
      const selectedVariants = rawItem.selectedVariants && typeof rawItem.selectedVariants === 'object' ? rawItem.selectedVariants : {};
      for (const variant of product.variants ?? []) {
        if (!variant.options.includes(selectedVariants[variant.name])) {
          return NextResponse.json({ error: `Choose a valid ${variant.name} for ${product.name}` }, { status: 400 });
        }
      }
      const modifier = (product.variants ?? []).reduce((sum, variant) => sum + (selectedVariants[variant.name] ? Number(variant.priceModifier || 0) : 0), 0);
      const price = calculateProductPrice(product.price, product.discount, modifier);
      const originalPrice = product.price + modifier;
      orderItems.push({ productId: product.id, productName: product.name, thumbnail: product.thumbnail, qty: quantity, price, originalPrice, selectedVariants });
    }
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const productDiscount = orderItems.reduce((sum, item) => sum + ((item.originalPrice ?? item.price) - item.price) * item.qty, 0);
    let discountAmount = 0;
    let appliedCoupon: string | undefined;
    if (couponCode) {
      const discounts = await readDb<Discount>('discounts');
      const coupon = discounts.find((discount) =>
        discount.storeId === store.id &&
        discount.code === String(couponCode).trim().toUpperCase() &&
        discount.isActive &&
        (!discount.expiresAt || new Date(discount.expiresAt) > new Date())
      );
      if (!coupon || subtotal < coupon.minOrderAmount) {
        return NextResponse.json({ error: 'Coupon is invalid or minimum order is not met' }, { status: 400 });
      }
      discountAmount = coupon.type === 'percentage' ? subtotal * (coupon.value / 100) : coupon.value;
      discountAmount = Math.min(discountAmount, subtotal);
      appliedCoupon = coupon.code;
    }
    const deliveryFee = calculateDeliveryFee(store.deliveryFee, store.freeDeliveryThreshold, subtotal - discountAmount);
    const total = subtotal - discountAmount + deliveryFee;

    // Generate order number
    const existingOrders = await readDb<Order>('orders');
    const orderNumber = `ORD-${String(existingOrders.length + 1).padStart(4, '0')}`;

    const newOrder: Order = {
      id: uuidv4(),
      storeId: store.id,
      orderNumber,
      customer,
      items: orderItems,
      subtotal,
      productDiscount,
      discount: discountAmount,
      couponCode: appliedCoupon,
      deliveryFee,
      total,
      paymentMethod: 'COD',
      channel: 'website',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await insertOne<Order>('orders', newOrder);
    await Promise.all(orderItems.map((item) => {
      const product = products.find((entry) => entry.id === item.productId)!;
      return updateOne<Product>('products', product.id, { stock: product.stock - item.qty, updatedAt: new Date().toISOString() });
    }));

    // Find the store's admin and create notification
    const admins = await readDb<Admin>('admins');
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
      await insertOne<Notification>('notifications', notification);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: newOrder.id,
        orderNumber: newOrder.orderNumber,
        customer: newOrder.customer,
        items: newOrder.items,
        subtotal: newOrder.subtotal,
        productDiscount: newOrder.productDiscount,
        discount: newOrder.discount,
        couponCode: newOrder.couponCode,
        deliveryFee: newOrder.deliveryFee,
        total: newOrder.total,
        status: newOrder.status,
      },
      whatsappNumber: store.whatsappNumber ?? '',
      storeName: store.name,
    }, { status: 201 });
  } catch (error) {
    console.error('Order error:', error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}
