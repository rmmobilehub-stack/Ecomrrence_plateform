import type { Metadata } from 'next';
import { readDb } from '@/lib/db';
import type { Store } from '@/lib/types';
import { storefrontPath } from '@/lib/storefront-paths';

export async function generateMetadata({ params }: { params: { storeSlug: string } }): Promise<Metadata> {
  const stores = await readDb<Store>('stores');
  const store = stores.find(entry => entry.slug === params.storeSlug && entry.isActive);
  if (!store) return { title: 'Products' };
  const description = `Browse the latest products, prices and offers from ${store.name}.`;
  const productsUrl = storefrontPath(store.slug, 'products');
  return { title: { absolute: `Shop ${store.name} products` }, description, alternates: { canonical: productsUrl }, openGraph: { title: `Shop ${store.name}`, description, url: productsUrl, type: 'website', images: store.banner ? [{ url: store.banner, alt: store.name }] : [] } };
}

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
