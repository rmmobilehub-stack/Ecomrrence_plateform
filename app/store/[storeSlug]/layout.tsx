import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { readDb } from '@/lib/db';
import type { Store } from '@/lib/types';
import { CartProvider } from '@/components/store/CartProvider';
import StoreNav from '@/components/store/StoreNav';

export async function generateMetadata({ params }: { params: { storeSlug: string } }): Promise<Metadata> {
  const stores = await readDb<Store>('stores.json');
  const store = stores.find(entry => entry.slug === params.storeSlug && entry.isActive);
  if (!store) return { title: 'Store not found' };
  return { title: `${store.name} | Shop online`, description: store.description || `Shop the latest products from ${store.name}.`, openGraph: { title: store.name, description: store.description || `Shop ${store.name} online.`, images: store.banner ? [store.banner] : [] } };
}

export default async function StoreLayout({ children, params }: { children: React.ReactNode; params: { storeSlug: string } }) {
  const stores = await readDb<Store>('stores.json');
  const store = stores.find(entry => entry.slug === params.storeSlug && entry.isActive);
  if (!store) notFound();
  return <CartProvider slug={store.slug}><div style={{ '--store-accent': store.primaryColor } as React.CSSProperties}><StoreNav slug={store.slug} name={store.name} logo={store.logo} announcement={store.announcement}/>{children}<footer className="store-footer">© {new Date().getFullYear()} {store.name}</footer></div></CartProvider>;
}
