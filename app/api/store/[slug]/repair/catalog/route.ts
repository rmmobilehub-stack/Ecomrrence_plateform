import { NextResponse } from 'next/server';
import { getRepairCatalog } from '@/lib/iphone-repair-catalog';
import { readDb } from '@/lib/db';
import type { Store } from '@/lib/types';

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const stores = await readDb<Store>('stores');
  const store = stores.find((entry) => entry.slug === params.slug && entry.isActive);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  return NextResponse.json(getRepairCatalog());
}
