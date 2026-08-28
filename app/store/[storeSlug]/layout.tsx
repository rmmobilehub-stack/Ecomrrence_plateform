import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { readDb } from '@/lib/db';
import type { Store } from '@/lib/types';
import { CartProvider } from '@/components/store/CartProvider';
import StoreNav from '@/components/store/StoreNav';

export async function generateMetadata({ params }: { params: { storeSlug: string } }): Promise<Metadata> {
  const stores = await readDb<Store>('stores');
  const store = stores.find(entry => entry.slug === params.storeSlug && entry.isActive);
  if (!store) return { title: 'Store not found' };
  const description = store.description || `Shop the latest products from ${store.name}.`;
  const storeUrl = store.slug === (process.env.DEFAULT_STORE_SLUG || 'demo') ? '/' : `/store/${store.slug}`;
  return { title: { absolute: `${store.name} | Shop online` }, description, alternates: { canonical: storeUrl }, openGraph: { title: store.name, description, url: storeUrl, type: 'website', images: store.banner ? [{ url: store.banner, alt: store.name }] : [] } };
}

export default async function StoreLayout({ children, params }: { children: React.ReactNode; params: { storeSlug: string } }) {
  const stores = await readDb<Store>('stores');
  const store = stores.find(entry => entry.slug === params.storeSlug && entry.isActive);
  if (!store) notFound();
  const homeHref = store.slug === (process.env.DEFAULT_STORE_SLUG || 'demo') ? '/' : `/store/${store.slug}`;
  return <CartProvider slug={store.slug}><div style={{ '--store-accent': store.primaryColor } as React.CSSProperties}><StoreNav slug={store.slug} homeHref={homeHref} name={store.name} logo={store.logo} announcement={store.announcement}/>{children}<footer className="store-footer">© {new Date().getFullYear()} {store.name}</footer></div></CartProvider>;
}
