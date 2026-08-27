import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import type { Discount, Store } from '@/lib/types';

export async function GET(_: Request, { params }: { params: { slug: string; code: string } }) {
  const stores = await readDb<Store>('stores.json'); const store = stores.find(entry => entry.slug === params.slug && entry.isActive);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  const discounts = await readDb<Discount>('discounts.json'); const discount = discounts.find(entry => entry.storeId === store.id && entry.code === params.code.toUpperCase() && entry.isActive && (!entry.expiresAt || new Date(entry.expiresAt) > new Date()));
  if (!discount) return NextResponse.json({ error: 'Invalid or expired coupon' }, { status: 404 });
  return NextResponse.json({ discount: { code: discount.code, type: discount.type, value: discount.value, minOrderAmount: discount.minOrderAmount } });
}
