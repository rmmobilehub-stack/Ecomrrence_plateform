'use client';

import { useState } from 'react';
import { useCart } from './CartProvider';
import { WhatsAppMark } from './WhatsAppButton';
import { calculateProductPrice } from '@/lib/pricing';
import { createWhatsAppUrl, normalizeWhatsAppNumber } from '@/lib/whatsapp';
import { formatMoney } from '@/lib/currency';

type Product = { id: string; name: string; thumbnail: string; images: string[]; price: number; discount: number; stock: number; variants: { name: string; options: string[]; priceModifier?: number }[] };

export default function AddToCart({ product, storeSlug, storeName, whatsappNumber }: { product: Product; storeSlug: string; storeName: string; whatsappNumber?: string }) {
  const { add, currency } = useCart();
  const [qty, setQty] = useState(1); const [choices, setChoices] = useState<Record<string, string>>({}); const [added, setAdded] = useState(false); const [openingWhatsApp, setOpeningWhatsApp] = useState(false); const [whatsappError, setWhatsappError] = useState('');
  const variantModifier = (product.variants ?? []).reduce((sum, variant) => sum + (choices[variant.name] ? Number(variant.priceModifier ?? 0) : 0), 0);
  const originalPrice = product.price + variantModifier;
  const price = calculateProductPrice(product.price, product.discount, variantModifier);
  const invalid = (product.variants ?? []).some(variant => !choices[variant.name]);
  const whatsappPhone = normalizeWhatsAppNumber(whatsappNumber);
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
      const message = [`*WhatsApp order request: ${data.order.orderNumber}*`, `*Store:* ${storeName}`, '', `Product: ${product.name}`, `Quantity: ${qty}`, `Price: ${formatMoney(data.order.total, currency)}`, itemChoices ? `Options: ${itemChoices}` : '', '', 'Please share your name, phone number and delivery address to confirm this order.'].filter(Boolean).join('\n');
      const url = createWhatsAppUrl(whatsappPhone, message);
      if (!url) throw new Error('The store WhatsApp number is not configured correctly');
      if (popup) popup.location.href = url;
      else window.location.href = url;
    } catch (error) {
      popup?.close(); setWhatsappError(error instanceof Error ? error.message : 'Could not start WhatsApp order');
    } finally { setOpeningWhatsApp(false); }
  };

  return <div className="add-to-cart" id="product-order"><div className="variant-list">{(product.variants ?? []).map(variant => <label className="form-group" key={variant.name}><span className="form-label">{variant.name}</span><select className="form-select" value={choices[variant.name] ?? ''} onChange={event => setChoices({ ...choices, [variant.name]: event.target.value })}><option value="">Choose {variant.name}</option>{variant.options.map(option => <option key={option}>{option}</option>)}</select></label>)}</div><div className="qty-controls"><button type="button" className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span className="qty-value">{qty}</span><button type="button" className="qty-btn" onClick={() => setQty(Math.min(product.stock || 1, qty + 1))}>+</button></div><div className="product-purchase-row"><button type="button" className="btn btn-primary btn-lg" disabled={unavailable} onClick={addItem}>{product.stock < 1 ? 'Out of stock' : added ? 'Added to cart' : 'Add to cart'}</button>{whatsappPhone.length >= 8 && <button type="button" className="whatsapp-btn whatsapp-order-btn whatsapp-order-compact" disabled={unavailable || openingWhatsApp} onClick={openWhatsAppOrder} aria-label={openingWhatsApp ? 'Preparing WhatsApp order' : 'Order via WhatsApp'} title="Order via WhatsApp"><WhatsAppMark/><span>{openingWhatsApp ? 'Wait…' : 'WhatsApp'}</span></button>}</div>{whatsappPhone.length >= 8 && <p className="whatsapp-order-note">WhatsApp requests are saved as trackable pending orders before the chat opens.</p>}{invalid && <p className="form-hint">Choose all options to continue.</p>}{whatsappError && <p className="form-error">{whatsappError}</p>}</div>;
}
