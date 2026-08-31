import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { readDb, updateOne } from '@/lib/db';
import type { Store } from '@/lib/types';
import { isValidWhatsAppNumber, normalizeWhatsAppNumber } from '@/lib/whatsapp';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stores = await readDb<Store>('stores');
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
    'name', 'slug', 'description', 'logo', 'banner', 'heroSlides', 'heroTitle', 'heroCtaLabel', 'announcement',
    'aboutTitle', 'aboutDescription', 'aboutImage',
    'primaryColor', 'currency', 'contactEmail', 'whatsappNumber', 'contactWidgetMode', 'deliveryFee', 'freeDeliveryThreshold', 'socialLinks', 'isActive',
  ];

  const updates: Partial<Store> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      (updates as Record<string, unknown>)[field] = body[field];
    }
  }

  if (updates.whatsappNumber !== undefined) {
    const suppliedNumber = String(updates.whatsappNumber).trim();
    if (suppliedNumber && !isValidWhatsAppNumber(suppliedNumber)) {
      return NextResponse.json({ error: 'Enter a valid WhatsApp number in international format, for example 923001234567' }, { status: 400 });
    }
    updates.whatsappNumber = suppliedNumber ? normalizeWhatsAppNumber(suppliedNumber) : '';
  }

  if (updates.contactWidgetMode && !['chatbot', 'whatsapp', 'both', 'none'].includes(updates.contactWidgetMode)) {
    return NextResponse.json({ error: 'Choose a valid storefront contact option' }, { status: 400 });
  }

  // Check slug uniqueness
  if (updates.slug) {
    const stores = await readDb<Store>('stores');
    const existing = stores.find((s) => s.slug === updates.slug && s.id !== session.storeId);
    if (existing) {
      return NextResponse.json({ error: 'Store slug already taken' }, { status: 409 });
    }
  }

  const updated = await updateOne<Store>('stores', session.storeId!, updates);
  if (!updated) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  return NextResponse.json({ store: updated });
}
