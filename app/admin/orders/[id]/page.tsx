'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatMoney } from '@/lib/currency';
import { useAdminStore } from '@/components/admin/useAdminStore';

type Order = { id: string; orderNumber: string; customer: { name: string; phone: string; email: string; address: string; city: string; country: string; notes?: string }; items: { productName: string; qty: number; price: number; selectedVariants: Record<string, string> }[]; total: number; status: string; channel?: 'website' | 'whatsapp' };

export default function OrderPage({ params }: { params: { id: string } }) {
  const store = useAdminStore();
  const [order, setOrder] = useState<Order | null>(null); const router = useRouter();
  useEffect(() => { fetch(`/api/admin/orders/${params.id}`).then(response => response.json()).then(data => setOrder(data.order)); }, [params.id]);
  if (!order) return <p>Loading order…</p>;
  const isWhatsApp = order.channel === 'whatsapp';
  return <><div className="page-header"><div><h1 className="page-title">{order.orderNumber}</h1><p className="page-subtitle">{isWhatsApp ? 'WhatsApp order request · customer confirmation pending' : 'Cash on delivery'} · {formatMoney(order.total,store?.currency??'PKR')}</p></div><select className="form-select status-select" value={order.status} onChange={async event => { const response = await fetch(`/api/admin/orders/${order.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: event.target.value }) }); const data = await response.json(); if (data.order) setOrder(data.order); }}>{['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => <option key={status}>{status}</option>)}</select></div>{isWhatsApp && <div className="payment-note"><strong>WhatsApp tracking</strong><span>This request is already saved in the system. Confirm customer details in WhatsApp, then move its status from pending to confirmed, processing, shipped or delivered.</span></div>}<div className="detail-grid"><section className="glass-card form-panel"><h2>Items</h2>{order.items.map((item, index) => <div className="list-row" key={index}><span><strong>{item.productName}</strong><small>{Object.entries(item.selectedVariants ?? {}).map(([name, value]) => `${name}: ${value}`).join(', ')}</small></span><span>{item.qty} × {formatMoney(item.price,store?.currency??'PKR')}</span></div>)}</section><section className="glass-card form-panel"><h2>Delivery details</h2><p><strong>{order.customer.name}</strong><br/>{order.customer.phone}<br/>{order.customer.email}<br/>{order.customer.address}, {order.customer.city}, {order.customer.country}</p>{order.customer.notes && <p className="text-secondary mt-4">Note: {order.customer.notes}</p>}</section></div><button className="btn btn-secondary mt-4" onClick={() => router.push('/admin/orders')}>Back to orders</button></>;
}
