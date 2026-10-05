'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from './CartProvider';
import { WhatsAppMark } from './WhatsAppButton';
import { calculateProductPrice, getReferencePrice } from '@/lib/pricing';
import { createWhatsAppUrl, normalizeWhatsAppNumber } from '@/lib/whatsapp';
import { formatMoney } from '@/lib/currency';
import { storefrontPath } from '@/lib/storefront-paths';

type Product = { id: string; name: string; thumbnail: string; images: string[]; price: number; comparePrice: number; discount: number; stock: number; variants: { name: string; options: string[]; priceModifier?: number }[] };

export default function AddToCart({ product, storeSlug, storeName, whatsappNumber }: { product: Product; storeSlug: string; storeName: string; whatsappNumber?: string }) {
  const { buyNow, currency } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1); const [choices, setChoices] = useState<Record<string, string>>({}); const [openingWhatsApp, setOpeningWhatsApp] = useState(false); const [whatsappError, setWhatsappError] = useState('');
  const variantModifier = (product.variants ?? []).reduce((sum, variant) => sum + (choices[variant.name] ? Number(variant.priceModifier ?? 0) : 0), 0);
  const originalPrice = product.price + variantModifier;
  const price = calculateProductPrice(product.price, product.discount, variantModifier);
  const invalid = (product.variants ?? []).some(variant => !choices[variant.name]);
  const whatsappPhone = normalizeWhatsAppNumber(whatsappNumber);
  const unavailable = product.stock < 1 || invalid;
  const missingOptions = (product.variants ?? []).filter(variant => !choices[variant.name]).map(variant => variant.name);
  const disabledMessage = product.stock < 1 ? 'This product is currently out of stock.' : missingOptions.length ? `Select ${missingOptions.join(' and ')} to continue.` : '';
  const readyForPurchase = !unavailable && (product.variants ?? []).length > 0;

  const chooseVariant = (name: string, value: string) => {
    const nextChoices = { ...choices, [name]: value };
    setChoices(nextChoices);
    const nextModifier = (product.variants ?? []).reduce((sum, variant) => sum + (nextChoices[variant.name] ? Number(variant.priceModifier ?? 0) : 0), 0);
    const nextPrice = calculateProductPrice(product.price, product.discount, nextModifier);
    const nextReferencePrice = product.discount > 0
      ? product.price + nextModifier
      : getReferencePrice(nextPrice, product.comparePrice, 0);
    const selectionComplete = (product.variants ?? []).every(variant => Boolean(nextChoices[variant.name]));
    window.dispatchEvent(new CustomEvent('store-product-price-change', { detail: { price: nextPrice, referencePrice: nextReferencePrice, ready: selectionComplete } }));
  };

  const startCheckout = () => {
    if (unavailable) return;
    buyNow({ productId: product.id, productName: product.name, thumbnail: product.thumbnail || product.images?.[0] || '', price, originalPrice, qty, selectedVariants: choices });
    router.push(storefrontPath(storeSlug, 'checkout'));
  };
  const openWhatsAppOrder = async () => {
    if (unavailable || !whatsappPhone || openingWhatsApp) return;
    setOpeningWhatsApp(true); setWhatsappError('');
    try {
      const response = await fetch(`/api/store/${storeSlug}/whatsapp-order`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: product.id, qty, selectedVariants: choices }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Could not start WhatsApp order');
      const itemChoices = Object.entries(choices).map(([name, value]) => `${name}: ${value}`).join(', ');
      const message = [`*WhatsApp order request: ${data.order.orderNumber}*`, `*Store:* ${storeName}`, '', `Product: ${product.name}`, `Quantity: ${qty}`, `Price: ${formatMoney(data.order.total, currency)}`, itemChoices ? `Options: ${itemChoices}` : '', '', 'Please share your name, phone number and delivery address to confirm this order.'].filter(Boolean).join('\n');
      const url = createWhatsAppUrl(whatsappPhone, message);
      if (!url) throw new Error('The store WhatsApp number is not configured correctly');
      window.location.href = url;
    } catch (error) {
      setWhatsappError(error instanceof Error ? error.message : 'Could not start WhatsApp order');
    } finally { setOpeningWhatsApp(false); }
  };

  return <div className="add-to-cart" id="product-order"><div className="variant-list">{(product.variants ?? []).map(variant => <label className="form-group" key={variant.name}><span className="form-label">{variant.name}</span><select className={`form-select${!choices[variant.name] ? ' is-required-pending' : ''}`} value={choices[variant.name] ?? ''} onChange={event => chooseVariant(variant.name, event.target.value)}><option value="">Choose {variant.name}</option>{variant.options.map(option => <option key={option}>{option}</option>)}</select></label>)}</div><div className="qty-controls"><button type="button" className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span className="qty-value">{qty}</span><button type="button" className="qty-btn" onClick={() => setQty(Math.min(product.stock || 1, qty + 1))}>+</button></div><div className="product-purchase-row"><span className={`purchase-button-wrap${unavailable ? ' is-disabled is-required-pending' : readyForPurchase ? ' is-ready-attention' : ''}`} data-tooltip={disabledMessage}><button type="button" className="btn btn-primary btn-lg" disabled={unavailable} onClick={startCheckout}>{product.stock < 1 ? 'Out of stock' : 'Buy now'}</button></span>{whatsappPhone.length >= 8 && <span className={`purchase-button-wrap${unavailable ? ' is-disabled is-required-pending' : readyForPurchase ? ' is-ready-attention' : ''}`} data-tooltip={disabledMessage}><button type="button" className="whatsapp-btn whatsapp-order-btn whatsapp-order-compact" disabled={unavailable || openingWhatsApp} onClick={openWhatsAppOrder} aria-label={openingWhatsApp ? 'Preparing WhatsApp order' : 'Order via WhatsApp'} title="Order via WhatsApp"><WhatsAppMark/><span>{openingWhatsApp ? 'Wait…' : 'WhatsApp'}</span></button></span>}</div>{invalid && <p className="purchase-validation" role="status">{disabledMessage}</p>}{whatsappPhone.length >= 8 && <p className="whatsapp-order-note">WhatsApp requests are saved as trackable pending orders before the chat opens.</p>}{whatsappError && <p className="form-error">{whatsappError}</p>}</div>;
}
