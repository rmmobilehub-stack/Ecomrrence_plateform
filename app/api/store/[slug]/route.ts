import { NextRequest, NextResponse } from 'next/server';
import { getActiveStoreBySlug } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const store = await getActiveStoreBySlug(params.slug);

  if (!store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  return NextResponse.json({ store });
}
