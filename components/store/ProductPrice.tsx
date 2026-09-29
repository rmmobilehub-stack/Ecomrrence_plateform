'use client';

import { useEffect, useState } from 'react';
import { formatMoney } from '@/lib/currency';

type PriceDetail = { price: number; referencePrice: number; ready?: boolean };

export default function ProductPrice({ price, referencePrice, currency, needsSelection = false }: PriceDetail & { currency: string; needsSelection?: boolean }) {
  const [current, setCurrent] = useState<PriceDetail>({ price, referencePrice });
  const [animated, setAnimated] = useState(false);
  const [needsAttention, setNeedsAttention] = useState(needsSelection);

  useEffect(() => {
    const updatePrice = (event: Event) => {
      const detail = (event as CustomEvent<PriceDetail>).detail;
      if (!detail) return;
      setCurrent(detail);
      // Keep the price visible both before and after an option is selected.
      // The purchase controls themselves indicate when the next step is ready.
      setNeedsAttention(needsSelection);
      setAnimated(false);
      requestAnimationFrame(() => setAnimated(true));
    };
    window.addEventListener('store-product-price-change', updatePrice);
    return () => window.removeEventListener('store-product-price-change', updatePrice);
  }, [needsSelection]);

  return <div className={`product-detail-price${animated ? ' is-price-updated' : ''}${needsAttention ? ' is-required-attention' : ''}`}>{formatMoney(current.price, currency)} {current.referencePrice > current.price && <del>{formatMoney(current.referencePrice, currency)}</del>}</div>;
}
