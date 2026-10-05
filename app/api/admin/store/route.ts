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
    'aboutTitle', 'aboutDescription', 'aboutImage', 'ads',
    'primaryColor', 'currency', 'contactEmail', 'whatsappNumber', 'contactWidgetMode', 'deliveryFee', 'freeDeliveryThreshold', 'socialLinks', 'isActive',
  ];

  const updates: Partial<Store> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      (updates as Record<string, unknown>)[field] = body[field];
    }
  }

  if (updates.ads !== undefined) {
    if (!Array.isArray(updates.ads)) {
      return NextResponse.json({ error: 'Ads must be a list' }, { status: 400 });
    }
    updates.ads = updates.ads
      .map((ad) => ({
        id: String(ad?.id || ''),
        type: ad?.type === 'video' ? 'video' as const : 'image' as const,
        title: String(ad?.title || '').trim().slice(0, 120),
        mediaUrl: String(ad?.mediaUrl || '').trim(),
        linkUrl: String(ad?.linkUrl || '').trim(),
        isActive: Boolean(ad?.isActive),
        createdAt: String(ad?.createdAt || new Date().toISOString()),
      }))
      .filter((ad) => ad.id && ad.mediaUrl)
      .slice(0, 12);
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
    updates.slug = String(updates.slug).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!updates.slug) {
      return NextResponse.json({ error: 'Enter a valid store URL slug' }, { status: 400 });
    }
    const stores = await readDb<Store>('stores');
    const existing = stores.find((s) => s.slug.toLowerCase() === updates.slug && s.id !== session.storeId);
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
