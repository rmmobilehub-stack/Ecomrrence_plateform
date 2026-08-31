import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { readDb, updateOne } from '@/lib/db';
import type { Store } from '@/lib/types';

const allowedFields: (keyof Store)[] = [
  'name', 'slug', 'description', 'logo', 'banner', 'heroSlides', 'heroTitle',
  'heroCtaLabel', 'announcement', 'aboutTitle', 'aboutDescription', 'aboutImage',
  'primaryColor', 'currency', 'contactEmail', 'whatsappNumber', 'contactWidgetMode', 'deliveryFee',
  'freeDeliveryThreshold', 'socialLinks', 'isActive',
];

async function authorize(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  return session?.role === 'super-admin';
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!await authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const stores = await readDb<Store>('stores');
  const store = stores.find((entry) => entry.id === params.id);
  return store
    ? NextResponse.json({ store })
    : NextResponse.json({ error: 'Store not found' }, { status: 404 });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!await authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const updates: Partial<Store> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      (updates as Record<string, unknown>)[field] = body[field];
    }
  }

  if (updates.slug) {
    const stores = await readDb<Store>('stores');
    const duplicate = stores.find((entry) => entry.slug === updates.slug && entry.id !== params.id);
    if (duplicate) {
      return NextResponse.json({ error: 'Store slug already taken' }, { status: 409 });
    }
  }

  const store = await updateOne<Store>('stores', params.id, updates);
  return store
    ? NextResponse.json({ store })
    : NextResponse.json({ error: 'Store not found' }, { status: 404 });
}
