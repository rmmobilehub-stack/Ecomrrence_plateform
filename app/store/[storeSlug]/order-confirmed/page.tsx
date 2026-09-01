'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import WhatsAppButton from '@/components/store/WhatsAppButton';
import { storefrontPath } from '@/lib/storefront-paths';
import { formatMoney } from '@/lib/currency';

type SavedOrder = {
  orderNumber: string; total: number; subtotal?: number; productDiscount?: number; discount?: number; couponCode?: string; deliveryFee?: number;
  customer: { name: string; phone: string; email: string; address: string; city: string; country: string; notes?: string };
  items: { productName: string; qty: number; price: number; selectedVariants: Record<string, string> }[];
  whatsappNumber?: string; storeName?: string; currency?: string;
};

export default function ConfirmationPage({ params }: { params: { storeSlug: string } }) {
  const [order, setOrder] = useState<SavedOrder | null>(null);
  useEffect(() => { try { setOrder(JSON.parse(sessionStorage.getItem(`shopsaas-order-${params.storeSlug}`) ?? 'null')); } catch {} }, [params.storeSlug]);
  const message = useMemo(() => {
    if (!order) return '';
    const lines = [`*New order: ${order.orderNumber}*`, `*Store:* ${order.storeName ?? params.storeSlug}`, '', '*Customer details*', `Name: ${order.customer.name}`, `Phone: ${order.customer.phone}`, `Email: ${order.customer.email}`, `Address: ${order.customer.address}, ${order.customer.city}, ${order.customer.country}`, '', '*Items*'];
    const money = (amount: number) => formatMoney(amount, order.currency || 'PKR');
    order.items.forEach((item, index) => { lines.push(`${index + 1}. ${item.productName} × ${item.qty} — ${money(item.price * item.qty)}`); const choices = Object.entries(item.selectedVariants ?? {}).map(([name, value]) => `${name}: ${value}`).join(', '); if (choices) lines.push(`   ${choices}`); });
    if (order.productDiscount) lines.push('', `Product discount: -${money(order.productDiscount)}`);
    if (order.couponCode) lines.push('', `Coupon: ${order.couponCode}`);
    if (order.discount) lines.push(`Discount: -${money(order.discount)}`);
    lines.push(`Delivery: ${order.deliveryFee ? money(order.deliveryFee) : 'Free'}`);
    if (order.customer.notes) lines.push(`Notes: ${order.customer.notes}`);
    lines.push('', `*Order total: ${money(order.total)}*`, 'Payment: Cash on delivery');
    return lines.join('\n');
  }, [order, params.storeSlug]);

  return <main className="store-section"><div className="order-success"><div className="success-icon"><CheckCircle2 size={42}/></div><h1>Your order is confirmed!</h1><p className="text-secondary mt-2">We will contact you soon to confirm delivery.</p>{order && <div className="order-summary mt-4"><div className="order-summary-row"><span>Order number</span><strong>{order.orderNumber}</strong></div>{order.productDiscount ? <div className="order-summary-row text-success"><span>Product discount</span><span>−{formatMoney(order.productDiscount, order.currency || 'PKR')}</span></div> : null}{order.discount ? <div className="order-summary-row text-success"><span>Coupon discount</span><span>−{formatMoney(order.discount, order.currency || 'PKR')}</span></div> : null}<div className="order-summary-row"><span>Delivery</span><span className={order.deliveryFee ? '' : 'text-success'}>{order.deliveryFee ? formatMoney(order.deliveryFee, order.currency || 'PKR') : 'Free 🎁'}</span></div><div className="order-summary-row total"><span>Total</span><span className="amount">{formatMoney(order.total, order.currency || 'PKR')}</span></div></div>}{order && <WhatsAppButton number={order.whatsappNumber} message={message} label="Send order to WhatsApp" className="confirmation-whatsapp"/>}<Link href={storefrontPath(params.storeSlug, 'products')} className="btn btn-primary mt-4">Continue shopping</Link></div></main>;
}
