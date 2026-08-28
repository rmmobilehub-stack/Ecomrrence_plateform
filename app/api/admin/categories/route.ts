import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSessionFromRequest } from '@/lib/auth';
import { readDb, insertOne, updateOne, deleteOne } from '@/lib/db';
import type { Category } from '@/lib/types';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const categories = await readDb<Category>('categories');
  const storeCategories = categories.filter((c) => c.storeId === session.storeId);
  return NextResponse.json({ categories: storeCategories });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, description = '' } = await req.json();
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newCategory: Category = {
    id: uuidv4(),
    storeId: session.storeId!,
    name,
    slug,
    description,
    createdAt: new Date().toISOString(),
  };

  await insertOne<Category>('categories', newCategory);
  return NextResponse.json({ category: newCategory }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, name, description } = await req.json();
  const categories = await readDb<Category>('categories');
  if (!categories.some((category) => category.id === id && category.storeId === session.storeId)) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }
  const updates: Partial<Category> = {};
  if (name) { updates.name = name; updates.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-'); }
  if (description !== undefined) updates.description = description;

  const updated = await updateOne<Category>('categories', id, updates);
  if (!updated) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

  return NextResponse.json({ category: updated });
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const categories = await readDb<Category>('categories');
  if (!categories.some((category) => category.id === id && category.storeId === session.storeId)) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }
  await deleteOne<Category>('categories', id);
  return NextResponse.json({ success: true });
}
