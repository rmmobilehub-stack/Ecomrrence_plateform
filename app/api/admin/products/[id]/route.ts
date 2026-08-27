import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { readDb, updateOne, deleteOne } from '@/lib/db';
import type { Product } from '@/lib/types';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const products = await readDb<Product>('products.json');
  const product = products.find((p) => p.id === params.id && p.storeId === session.storeId);

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership
  const products = await readDb<Product>('products.json');
  const existing = products.find((p) => p.id === params.id && p.storeId === session.storeId);
  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const body = await req.json();
  const allowed = ['name', 'description', 'price', 'comparePrice', 'discount', 'images', 'thumbnail', 'categoryId', 'tags', 'stock', 'sku', 'status', 'customProperties', 'variants'] as const;
  const updates: Partial<Product> = { updatedAt: new Date().toISOString() };
  for (const field of allowed) {
    if (body[field] !== undefined) (updates as Record<string, unknown>)[field] = body[field];
  }

  const nextPrice = updates.price !== undefined ? Number(updates.price) : existing.price;
  const nextDiscount = updates.discount !== undefined ? Math.min(100, Math.max(0, Number(updates.discount))) : existing.discount;
  updates.price = nextPrice;
  updates.discount = nextDiscount;
  if (nextDiscount > 0) updates.comparePrice = nextPrice;
  
  // Regenerate slug if name changed
  if (updates.name) {
    updates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  if (updates.images && !updates.thumbnail) updates.thumbnail = updates.images[0] || '';

  const updated = await updateOne<Product>('products.json', params.id, updates);
  return NextResponse.json({ product: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership
  const products = await readDb<Product>('products.json');
  const existing = products.find((p) => p.id === params.id && p.storeId === session.storeId);
  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  await deleteOne<Product>('products.json', params.id);
  return NextResponse.json({ success: true });
}
