'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Order = { id: string; orderNumber: string; customer: { name: string; email: string }; total: number; status: string; channel?: 'website' | 'whatsapp'; createdAt: string };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]); const [status, setStatus] = useState('');
  useEffect(() => { fetch(`/api/admin/orders${status ? `?status=${status}` : ''}`).then(response => response.json()).then(data => setOrders(data.orders ?? [])); }, [status]);
  return <><div className="page-header"><div><h1 className="page-title">Orders</h1><p className="page-subtitle">Review, confirm and fulfill website and WhatsApp orders.</p></div></div><div className="filter-bar"><select className="form-select" value={status} onChange={event => setStatus(event.target.value)}><option value="">All statuses</option>{['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(value => <option key={value}>{value}</option>)}</select></div><div className="glass-card table-container"><table className="data-table"><thead><tr><th>Order</th><th>Source</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th/></tr></thead><tbody>{orders.length === 0 ? <tr><td colSpan={7}>No orders found.</td></tr> : orders.map(order => <tr key={order.id}><td className="font-semibold">{order.orderNumber}</td><td><span className={`badge badge-${order.channel === 'whatsapp' ? 'success' : 'info'}`}>{order.channel === 'whatsapp' ? 'WhatsApp' : 'Website'}</span></td><td><div>{order.customer.name}<small>{order.customer.email || (order.channel === 'whatsapp' ? 'Details pending in WhatsApp' : '')}</small></div></td><td>${order.total.toFixed(2)}</td><td><span className="badge badge-warning">{order.status}</span></td><td>{new Date(order.createdAt).toLocaleDateString()}</td><td><Link className="btn btn-ghost btn-sm" href={`/admin/orders/${order.id}`}>Open</Link></td></tr>)}</tbody></table></div></>;
}
