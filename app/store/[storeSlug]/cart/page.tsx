'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useCart } from '@/components/store/CartProvider';
import { calculateDeliveryFee } from '@/lib/pricing';

type DeliverySettings = { deliveryFee?: number; freeDeliveryThreshold?: number };

export default function CartPage({ params }: { params: { storeSlug: string } }) {
  const { items, update, remove, subtotal } = useCart();
  const [settings, setSettings] = useState<DeliverySettings>({});

  useEffect(() => {
    fetch(`/api/store/${params.storeSlug}`)
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (data?.store) setSettings(data.store); })
      .catch(() => undefined);
  }, [params.storeSlug]);

  const productDiscount = useMemo(() => items.reduce((total, item) => {
    const originalPrice = Math.max(item.price, item.originalPrice ?? item.price);
    return total + (originalPrice - item.price) * item.qty;
  }, 0), [items]);
  const originalSubtotal = subtotal + productDiscount;
  const deliveryFee = calculateDeliveryFee(settings.deliveryFee, settings.freeDeliveryThreshold, subtotal);
  const freeDeliveryThreshold = Math.max(0, Number(settings.freeDeliveryThreshold) || 0);
  const amountToFreeDelivery = freeDeliveryThreshold > 0 ? Math.max(0, freeDeliveryThreshold - subtotal) : 0;
  const total = subtotal + deliveryFee;

  if (!items.length) return <main className="store-section"><div className="page-header"><div><h1 className="page-title">Your cart</h1><p className="page-subtitle">Review your items before checkout.</p></div></div><div className="empty-state"><h3>Your cart is empty</h3><Link className="btn btn-primary mt-4" href={`/store/${params.storeSlug}/products`}>Continue shopping</Link></div></main>;

  return <main className="store-section"><div className="page-header"><div><h1 className="page-title">Your cart</h1><p className="page-subtitle">Review your items before checkout.</p></div></div><div className="checkout-grid"><section className="cart-page-items">{items.map((item, index) => {
    const originalPrice = Math.max(item.price, item.originalPrice ?? item.price);
    return <article className="cart-item" key={`${item.productId}-${index}`}>
      {item.thumbnail ? <img src={item.thumbnail} className="cart-item-img" alt="" /> : <span className="cart-item-img" />}
      <div className="cart-item-info"><div className="cart-item-name">{item.productName}</div><small>{Object.entries(item.selectedVariants).map(([key, value]) => `${key}: ${value}`).join(' · ')}</small><div className="cart-item-price">{originalPrice > item.price && <><del>${originalPrice.toFixed(2)}</del>{' '}</>}${item.price.toFixed(2)}</div><div className="qty-controls"><button className="qty-btn" onClick={() => update(index, item.qty - 1)}>−</button><span className="qty-value">{item.qty}</span><button className="qty-btn" onClick={() => update(index, item.qty + 1)}>+</button><button className="btn btn-ghost btn-sm" onClick={() => remove(index)}>Remove</button></div></div>
      <strong>${(item.price * item.qty).toFixed(2)}</strong>
    </article>;
  })}</section><aside className="order-summary"><h2>Order summary</h2>{productDiscount > 0 && <><div className="order-summary-row"><span>Original product value</span><span>${originalSubtotal.toFixed(2)}</span></div><div className="order-summary-row text-success"><span>Product discount</span><span>−${productDiscount.toFixed(2)}</span></div></>}<div className="order-summary-row"><span>Products after discount</span><span>${subtotal.toFixed(2)}</span></div><div className="order-summary-row"><span>Delivery</span><span className={deliveryFee === 0 ? 'text-success' : ''}>{deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}</span></div>{deliveryFee === 0 ? <p className="payment-note"><strong>🎁 Free delivery gift</strong><span>Your delivery is on us.</span></p> : amountToFreeDelivery > 0 ? <p className="payment-note"><strong>Free delivery offer</strong><span>Add ${amountToFreeDelivery.toFixed(2)} more to unlock free delivery.</span></p> : null}<div className="order-summary-row total"><span>Total</span><span className="amount">${total.toFixed(2)}</span></div><Link className="btn btn-primary w-full mt-4" href={`/store/${params.storeSlug}/checkout`}>Proceed to checkout</Link></aside></div></main>;
}
