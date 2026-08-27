'use client';

import { useState } from 'react';
import { useCart } from './CartProvider';
import { WhatsAppMark } from './WhatsAppButton';
import { calculateProductPrice } from '@/lib/pricing';

type Product = { id: string; name: string; thumbnail: string; images: string[]; price: number; discount: number; stock: number; variants: { name: string; options: string[]; priceModifier?: number }[] };

export default function AddToCart({ product, storeSlug, storeName, whatsappNumber }: { product: Product; storeSlug: string; storeName: string; whatsappNumber?: string }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1); const [choices, setChoices] = useState<Record<string, string>>({}); const [added, setAdded] = useState(false); const [openingWhatsApp, setOpeningWhatsApp] = useState(false); const [whatsappError, setWhatsappError] = useState('');
  const variantModifier = (product.variants ?? []).reduce((sum, variant) => sum + (choices[variant.name] ? Number(variant.priceModifier ?? 0) : 0), 0);
  const originalPrice = product.price + variantModifier;
  const price = calculateProductPrice(product.price, product.discount, variantModifier);
  const invalid = (product.variants ?? []).some(variant => !choices[variant.name]);
  const whatsappDigits = (whatsappNumber ?? '').replace(/\D/g, '');
  const whatsappPhone = whatsappDigits.startsWith('0') && whatsappDigits.length === 11 ? `92${whatsappDigits.slice(1)}` : whatsappDigits;
  const unavailable = product.stock < 1 || invalid;

  const addItem = () => { add({ productId: product.id, productName: product.name, thumbnail: product.thumbnail || product.images?.[0] || '', price, originalPrice, qty, selectedVariants: choices }); setAdded(true); window.setTimeout(() => setAdded(false), 1800); };
  const openWhatsAppOrder = async () => {
    if (unavailable || !whatsappPhone || openingWhatsApp) return;
    const popup = window.open('', '_blank');
    if (popup) popup.opener = null;
    setOpeningWhatsApp(true); setWhatsappError('');
    try {
      const response = await fetch(`/api/store/${storeSlug}/whatsapp-order`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: product.id, qty, selectedVariants: choices }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Could not start WhatsApp order');
      const itemChoices = Object.entries(choices).map(([name, value]) => `${name}: ${value}`).join(', ');
      const message = [`*WhatsApp order request: ${data.order.orderNumber}*`, `*Store:* ${storeName}`, '', `Product: ${product.name}`, `Quantity: ${qty}`, `Price: $${data.order.total.toFixed(2)}`, itemChoices ? `Options: ${itemChoices}` : '', '', 'Please share your name, phone number and delivery address to confirm this order.'].filter(Boolean).join('\n');
      const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
      if (popup) popup.location.href = url;
      else window.location.href = url;
    } catch (error) {
      popup?.close(); setWhatsappError(error instanceof Error ? error.message : 'Could not start WhatsApp order');
    } finally { setOpeningWhatsApp(false); }
  };

  return <div className="add-to-cart"><div className="variant-list">{(product.variants ?? []).map(variant => <label className="form-group" key={variant.name}><span className="form-label">{variant.name}</span><select className="form-select" value={choices[variant.name] ?? ''} onChange={event => setChoices({ ...choices, [variant.name]: event.target.value })}><option value="">Choose {variant.name}</option>{variant.options.map(option => <option key={option}>{option}</option>)}</select></label>)}</div><div className="qty-controls"><button type="button" className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span className="qty-value">{qty}</span><button type="button" className="qty-btn" onClick={() => setQty(Math.min(product.stock || 1, qty + 1))}>+</button></div><button type="button" className="btn btn-primary btn-lg" disabled={unavailable} onClick={addItem}>{product.stock < 1 ? 'Out of stock' : added ? 'Added to cart' : 'Add to cart'}</button>{whatsappPhone.length >= 8 && <><button type="button" className="whatsapp-btn whatsapp-order-btn" disabled={unavailable || openingWhatsApp} onClick={openWhatsAppOrder}><WhatsAppMark/>{openingWhatsApp ? 'Preparing WhatsApp order…' : 'Order via WhatsApp'}</button><p className="whatsapp-order-note">A trackable order request is created before WhatsApp opens.</p></>}{invalid && <p className="form-hint">Choose all options to continue.</p>}{whatsappError && <p className="form-error">{whatsappError}</p>}</div>;
}
