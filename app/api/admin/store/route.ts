import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { readDb, updateOne } from '@/lib/db';
import type { Store } from '@/lib/types';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stores = await readDb<Store>('stores.json');
  const store = stores.find((s) => s.id === session.storeId);

  if (!store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  return NextResponse.json({ store });
}

export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const allowedFields: (keyof Store)[] = [
    'name', 'slug', 'description', 'logo', 'banner',
    'primaryColor', 'currency', 'contactEmail', 'socialLinks', 'isActive',
  ];

  const updates: Partial<Store> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      (updates as Record<string, unknown>)[field] = body[field];
    }
  }

  // Check slug uniqueness
  if (updates.slug) {
    const stores = await readDb<Store>('stores.json');
    const existing = stores.find((s) => s.slug === updates.slug && s.id !== session.storeId);
    if (existing) {
      return NextResponse.json({ error: 'Store slug already taken' }, { status: 409 });
    }
  }

  const updated = await updateOne<Store>('stores.json', session.storeId!, updates);
  if (!updated) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  return NextResponse.json({ store: updated });
}
