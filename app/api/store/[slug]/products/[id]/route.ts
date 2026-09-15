import { NextRequest, NextResponse } from 'next/server';
import { getActiveProductById, getActiveStoreBySlug } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  const store = await getActiveStoreBySlug(params.slug);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const product = await getActiveProductById(store.id, params.id);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  return NextResponse.json({ product });
}
