import { NextRequest, NextResponse } from 'next/server';
import { getActiveProductsForStore, getActiveStoreBySlug, getCategoriesForStore } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const store = await getActiveStoreBySlug(params.slug);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const categoryId = searchParams.get('categoryId') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';

  const [products, categories] = await Promise.all([
    getActiveProductsForStore(store.id),
    getCategoriesForStore(store.id),
  ]);

  let storeProducts = products;

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

  return NextResponse.json({ products: storeProducts, categories });
}
