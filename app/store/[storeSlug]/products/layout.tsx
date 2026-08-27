import type { Metadata } from 'next';
import { readDb } from '@/lib/db';
import type { Store } from '@/lib/types';

export async function generateMetadata({ params }: { params: { storeSlug: string } }): Promise<Metadata> {
  const stores = await readDb<Store>('stores.json');
  const store = stores.find(entry => entry.slug === params.storeSlug && entry.isActive);
  if (!store) return { title: 'Products' };
  const description = `Browse the latest products, prices and offers from ${store.name}.`;
  return { title: { absolute: `Shop ${store.name} products` }, description, alternates: { canonical: `/store/${store.slug}/products` }, openGraph: { title: `Shop ${store.name}`, description, url: `/store/${store.slug}/products`, type: 'website', images: store.banner ? [{ url: store.banner, alt: store.name }] : [] } };
}

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
