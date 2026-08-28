import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import type { Store } from '@/lib/types';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const stores = await readDb<Store>('stores');
  const store = stores.find((s) => s.slug === params.slug && s.isActive);

  if (!store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  return NextResponse.json({ store });
}
