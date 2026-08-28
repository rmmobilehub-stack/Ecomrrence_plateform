import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSessionFromRequest } from '@/lib/auth';
import { deleteOne, insertOne, readDb, updateOne } from '@/lib/db';
import type { Discount } from '@/lib/types';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const discounts = await readDb<Discount>('discounts');
  return NextResponse.json({ discounts: discounts.filter(discount => discount.storeId === session.storeId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const code = String(body.code ?? '').trim().toUpperCase(); const type = body.type === 'fixed' ? 'fixed' : 'percentage'; const value = Number(body.value); const minOrderAmount = Number(body.minOrderAmount ?? 0);
  if (!/^[A-Z0-9_-]{3,32}$/.test(code) || !Number.isFinite(value) || value <= 0 || (type === 'percentage' && value > 100) || minOrderAmount < 0) return NextResponse.json({ error: 'Enter a valid code and discount amount' }, { status: 400 });
  const discounts = await readDb<Discount>('discounts');
  if (discounts.some(discount => discount.storeId === session.storeId && discount.code === code)) return NextResponse.json({ error: 'This coupon code already exists' }, { status: 409 });
  const discount: Discount = { id: uuidv4(), storeId: session.storeId!, code, type, value, minOrderAmount, isActive: true, expiresAt: body.expiresAt || undefined, createdAt: new Date().toISOString() };
  await insertOne('discounts', discount); return NextResponse.json({ discount }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, isActive } = await req.json(); const discounts = await readDb<Discount>('discounts');
  if (!discounts.some(discount => discount.id === id && discount.storeId === session.storeId)) return NextResponse.json({ error: 'Discount not found' }, { status: 404 });
  const discount = await updateOne<Discount>('discounts', id, { isActive: Boolean(isActive) }); return NextResponse.json({ discount });
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id'); const discounts = await readDb<Discount>('discounts');
  if (!id || !discounts.some(discount => discount.id === id && discount.storeId === session.storeId)) return NextResponse.json({ error: 'Discount not found' }, { status: 404 });
  await deleteOne<Discount>('discounts', id); return NextResponse.json({ success: true });
}
