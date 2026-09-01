'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/components/store/CartProvider';
import { calculateDeliveryFee } from '@/lib/pricing';
import { storefrontPath } from '@/lib/storefront-paths';
import { formatMoney } from '@/lib/currency';

type Coupon = { code: string; type: 'percentage' | 'fixed'; value: number; minOrderAmount: number };
type DeliverySettings = { deliveryFee?: number; freeDeliveryThreshold?: number; currency?: string };

export default function CheckoutPage({ params }: { params: { storeSlug: string } }) {
  const { items, subtotal, clear, currency } = useCart();
  const router = useRouter();
  const [settings, setSettings] = useState<DeliverySettings>({});
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', country: '', notes: '' });
  const [couponInput, setCouponInput] = useState(''); const [coupon, setCoupon] = useState<Coupon | null>(null); const [couponError, setCouponError] = useState(''); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);

  useEffect(() => { fetch(`/api/store/${params.storeSlug}`).then(response => response.ok ? response.json() : null).then(data => { if (data?.store) setSettings(data.store); }).catch(() => undefined); }, [params.storeSlug]);
  const productDiscount = useMemo(() => items.reduce((total, item) => total + (Math.max(item.price, item.originalPrice ?? item.price) - item.price) * item.qty, 0), [items]);
  const discount = coupon && subtotal >= coupon.minOrderAmount ? Math.min(coupon.type === 'percentage' ? subtotal * coupon.value / 100 : coupon.value, subtotal) : 0;
  const amountAfterCoupon = subtotal - discount;
  const deliveryFee = calculateDeliveryFee(settings.deliveryFee, settings.freeDeliveryThreshold, amountAfterCoupon);
  const freeDeliveryThreshold = Math.max(0, Number(settings.freeDeliveryThreshold) || 0);
  const amountToFreeDelivery = freeDeliveryThreshold > 0 ? Math.max(0, freeDeliveryThreshold - amountAfterCoupon) : 0;
  const total = amountAfterCoupon + deliveryFee;
  const money = (amount: number) => formatMoney(amount, settings.currency || currency);

  const change = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [event.target.name]: event.target.value });
  const applyCoupon = async () => { setCouponError(''); setCoupon(null); const response = await fetch(`/api/store/${params.storeSlug}/discounts/${encodeURIComponent(couponInput.trim())}`); const data = await response.json(); if (!response.ok) { setCouponError(data.error ?? 'Could not apply coupon'); return; } if (subtotal < data.discount.minOrderAmount) { setCouponError(`This code requires a ${money(data.discount.minOrderAmount)} minimum order.`); return; } setCoupon(data.discount); };
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (!items.length) return; setSaving(true); setError(''); const response = await fetch(`/api/store/${params.storeSlug}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer: form, items, couponCode: coupon?.code }) }); const data = await response.json(); if (!response.ok) { setError(data.error ?? 'Could not place order'); setSaving(false); return; } clear(); sessionStorage.setItem(`shopsaas-order-${params.storeSlug}`, JSON.stringify({ ...data.order, whatsappNumber: data.whatsappNumber, storeName: data.storeName, currency: data.currency || currency })); router.push(storefrontPath(params.storeSlug, 'order-confirmed')); };

  if (!items.length) return <main className="store-section empty-state"><h2>Your cart is empty</h2><Link className="btn btn-primary mt-4" href={storefrontPath(params.storeSlug, 'products')}>Browse products</Link></main>;
  return <main className="store-section"><div className="page-header"><div><h1 className="page-title">Checkout</h1><p className="page-subtitle">Complete your delivery details.</p></div></div><form className="checkout-grid" onSubmit={submit}><section className="glass-card form-panel"><h2>Delivery details</h2><div className="grid-2"><label className="form-group"><span className="form-label">Full name *</span><input className="form-input" name="name" required value={form.name} onChange={change}/></label><label className="form-group"><span className="form-label">Phone number *</span><input className="form-input" name="phone" required value={form.phone} onChange={change}/></label></div><label className="form-group"><span className="form-label">Email *</span><input className="form-input" type="email" name="email" required value={form.email} onChange={change}/></label><label className="form-group"><span className="form-label">Delivery address *</span><input className="form-input" name="address" required value={form.address} onChange={change}/></label><div className="grid-2"><label className="form-group"><span className="form-label">City *</span><input className="form-input" name="city" required value={form.city} onChange={change}/></label><label className="form-group"><span className="form-label">Country *</span><input className="form-input" name="country" required value={form.country} onChange={change}/></label></div><label className="form-group"><span className="form-label">Order notes</span><textarea className="form-input form-textarea" name="notes" value={form.notes} onChange={change}/></label><div className="payment-note"><strong>Cash on delivery</strong><span>Pay when your order arrives.</span></div>{error && <p className="form-error">{error}</p>}</section><aside className="order-summary"><h2>Your order</h2>{items.map((item, index) => <div className="order-summary-row" key={index}><span>{item.productName} × {item.qty}</span><span>{money(item.price * item.qty)}</span></div>)}<div className="coupon-row"><input className="form-input" placeholder="Coupon code" value={couponInput} onChange={event => setCouponInput(event.target.value.toUpperCase())}/><button className="btn btn-secondary btn-sm" type="button" onClick={applyCoupon}>Apply</button></div>{couponError && <p className="form-error">{couponError}</p>}{productDiscount > 0 && <div className="order-summary-row text-success"><span>Product discount</span><span>−{money(productDiscount)}</span></div>}{coupon && <div className="order-summary-row text-success"><span>Coupon {coupon.code}</span><span>−{money(discount)}</span></div>}<div className="order-summary-row"><span>Products after discounts</span><span>{money(amountAfterCoupon)}</span></div><div className="order-summary-row"><span>Delivery</span><span className={deliveryFee === 0 ? 'text-success' : ''}>{deliveryFee === 0 ? 'Free' : money(deliveryFee)}</span></div>{deliveryFee === 0 ? <p className="payment-note"><strong>🎁 Free delivery gift</strong><span>Your delivery is on us.</span></p> : amountToFreeDelivery > 0 ? <p className="payment-note"><strong>Free delivery offer</strong><span>Add {money(amountToFreeDelivery)} more to unlock free delivery.</span></p> : null}<div className="order-summary-row total"><span>Total</span><span className="amount">{money(total)}</span></div><button className="btn btn-primary w-full mt-4" disabled={saving}>{saving ? 'Confirming…' : 'Confirm order'}</button></aside></form></main>;
}
