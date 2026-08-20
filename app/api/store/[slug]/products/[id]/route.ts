import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import type { Store, Product } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  const stores = await readDb<Store>('stores.json');
  const store = stores.find((s) => s.slug === params.slug && s.isActive);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const products = await readDb<Product>('products.json');
  const product = products.find((p) => p.id === params.id && p.storeId === store.id && p.status === 'active');
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  return NextResponse.json({ product });
}
