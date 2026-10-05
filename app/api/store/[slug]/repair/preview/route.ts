import { NextRequest, NextResponse } from 'next/server';
import { getDevicePreview } from '@/lib/iphone-repair-catalog';
import { readDb } from '@/lib/db';
import type { Store } from '@/lib/types';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const stores = await readDb<Store>('stores');
  const store = stores.find((entry) => entry.slug === params.slug && entry.isActive);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const modelId = String(request.nextUrl.searchParams.get('modelId') || '').trim();
  const colorId = String(request.nextUrl.searchParams.get('colorId') || '').trim();
  const preview = getDevicePreview(modelId, colorId);
  if (!preview) {
    return NextResponse.json({ error: 'Unknown model or colour' }, { status: 404 });
  }
  return NextResponse.json({ preview });
}
