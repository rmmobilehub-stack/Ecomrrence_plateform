import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { readDb } from '@/lib/db';
import type { Store } from '@/lib/types';
import { CartProvider } from '@/components/store/CartProvider';
import StoreNav from '@/components/store/StoreNav';
import { storefrontPath } from '@/lib/storefront-paths';

export async function generateMetadata({ params }: { params: { storeSlug: string } }): Promise<Metadata> {
  const stores = await readDb<Store>('stores');
  const store = stores.find((entry) => entry.slug === params.storeSlug && entry.isActive);
  if (!store) return { title: 'Store not found' };
  const description = store.description || `Shop the latest products from ${store.name}.`;
  const storeUrl = storefrontPath(store.slug);
  const socialProfiles = Object.values(store.socialLinks ?? {}).filter(Boolean);
  return {
    title: { absolute: `${store.name} | Shop online` },
    description,
    icons: store.logo ? { icon: store.logo, shortcut: store.logo, apple: store.logo } : undefined,
    alternates: { canonical: storeUrl },
    openGraph: {
      title: store.name,
      description,
      url: storeUrl,
      type: 'website',
      images: store.banner ? [{ url: store.banner, alt: store.name }] : [],
    },
    other: socialProfiles.length ? { 'business:social-profiles': socialProfiles.join(',') } : undefined,
  };
}

export default async function StoreLayout({ children, params }: { children: React.ReactNode; params: { storeSlug: string } }) {
  const stores = await readDb<Store>('stores');
  const store = stores.find((entry) => entry.slug === params.storeSlug && entry.isActive);
  if (!store) notFound();
  const homeHref = storefrontPath(store.slug);
  const productsHref = storefrontPath(store.slug, 'products');

  return <CartProvider slug={store.slug} currency={store.currency || 'PKR'}>
    <div className="storefront-shell" style={{ '--store-accent': store.primaryColor } as React.CSSProperties}>
      <StoreNav slug={store.slug} homeHref={homeHref} name={store.name} logo={store.logo} announcement={store.announcement}/>
      {children}
      <footer className="store-footer">
        <div><strong>{store.name}</strong><span>Chargers, cables and Apple-compatible accessories.</span></div>
        <nav><a href={homeHref}>Home</a><a href={productsHref}>Shop</a><a href={`${homeHref}#about`}>About</a></nav>
        <small>© {new Date().getFullYear()} {store.name}</small>
      </footer>
    </div>
  </CartProvider>;
}
