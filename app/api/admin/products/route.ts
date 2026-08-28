import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSessionFromRequest } from '@/lib/auth';
import { readDb, insertOne } from '@/lib/db';
import type { Product } from '@/lib/types';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const status = searchParams.get('status') || '';
  const categoryId = searchParams.get('categoryId') || '';

  const products = await readDb<Product>('products');
  let filtered = products.filter((p) => p.storeId === session.storeId);

  if (search) {
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search)
    );
  }
  if (status) {
    filtered = filtered.filter((p) => p.status === status);
  }
  if (categoryId) {
    filtered = filtered.filter((p) => p.categoryId === categoryId);
  }

  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ products: filtered });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const {
    name, description = '', price = 0, comparePrice = 0, discount = 0,
    images = [], thumbnail = '', categoryId = '', tags = [],
    stock = 0, sku = '', status = 'draft', customProperties = [], variants = [],
  } = body;

  if (!name) {
    return NextResponse.json({ error: 'Product name required' }, { status: 400 });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const now = new Date().toISOString();

  const newProduct: Product = {
    id: uuidv4(),
    storeId: session.storeId!,
    name,
    slug,
    description,
    price: Number(price),
    comparePrice: Number(discount) > 0 ? Number(price) : Number(comparePrice),
    discount: Math.min(100, Math.max(0, Number(discount))),
    images,
    thumbnail: thumbnail || images[0] || '',
    categoryId,
    tags,
    stock: Number(stock),
    sku,
    status,
    customProperties,
    variants,
    createdAt: now,
    updatedAt: now,
  };

  await insertOne<Product>('products', newProduct);
  return NextResponse.json({ product: newProduct }, { status: 201 });
}
