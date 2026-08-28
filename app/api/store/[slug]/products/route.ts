import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import type { Store, Product, Category } from '@/lib/types';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const stores = await readDb<Store>('stores');
  const store = stores.find((s) => s.slug === params.slug && s.isActive);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const categoryId = searchParams.get('categoryId') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';

  const products = await readDb<Product>('products');
  const categories = await readDb<Category>('categories');

  let storeProducts = products.filter((p) => p.storeId === store.id && p.status === 'active');

  if (search) {
    storeProducts = storeProducts.filter(
      (p) => p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search)
    );
  }

  if (categoryId) {
    storeProducts = storeProducts.filter((p) => p.categoryId === categoryId);
  }

  if (sortBy === 'price-asc') storeProducts.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-desc') storeProducts.sort((a, b) => b.price - a.price);
  else storeProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const storeCategories = categories.filter((c) => c.storeId === store.id);

  return NextResponse.json({ products: storeProducts, categories: storeCategories });
}
