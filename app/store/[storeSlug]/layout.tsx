import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Figtree, Outfit } from 'next/font/google';
import { getActiveStoreBySlug } from '@/lib/db';
import { getCustomerSession } from '@/lib/customer-auth';
import { getCustomerById } from '@/lib/customers';
import { CartProvider } from '@/components/store/CartProvider';
import StoreNav from '@/components/store/StoreNav';
import { storefrontPath } from '@/lib/storefront-paths';

const storeDisplay = Outfit({
  subsets: ['latin'],
  variable: '--font-store-display',
  display: 'swap',
});

const storeSans = Figtree({
  subsets: ['latin'],
  variable: '--font-store-sans',
  display: 'swap',
});

export async function generateMetadata({ params }: { params: { storeSlug: string } }): Promise<Metadata> {
  const store = await getActiveStoreBySlug(params.storeSlug);
  if (!store) return { title: 'Store not found' };
  const description = store.description || `Shop the latest products from ${store.name}.`;
  const storeUrl = storefrontPath(store.slug);
  const socialProfiles = Object.values(store.socialLinks ?? {}).filter(Boolean);
  return {
    title: { absolute: `${store.name} | Shop online` },
    description,
    icons: {
      icon: [{ url: store.logo || '/storefront/rm-mobile-hub-logo-generated.png', type: 'image/png' }],
      shortcut: [store.logo || '/storefront/rm-mobile-hub-logo-generated.png'],
      apple: [{ url: store.logo || '/storefront/rm-mobile-hub-logo-generated.png', type: 'image/png' }],
    },
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
  const store = await getActiveStoreBySlug(params.storeSlug);
  if (!store) notFound();
  const androidDownloadUrl = store.slug === 'demo' ? '/downloads/RMMobile-latest.apk' : undefined;
  const homeHref = storefrontPath(store.slug);
  const productsHref = storefrontPath(store.slug, 'products');
  const repairHref = storefrontPath(store.slug, 'repair');
  const phoneCheckHref = storefrontPath(store.slug, 'phone-check');
  const storeAccent = /^#[0-9a-f]{6}$/i.test(store.primaryColor) ? store.primaryColor : '#2563eb';
  const storeTheme = storeAccent.toLowerCase() === '#2563eb' ? 'classic-blue' : 'custom';

  const session = await getCustomerSession();
  const sessionCustomer =
    session?.storeId === store.id ? await getCustomerById(session.id) : null;
  const initialCustomer =
    sessionCustomer && sessionCustomer.storeId === store.id
      ? {
          id: sessionCustomer.id,
          name: sessionCustomer.name,
          email: sessionCustomer.email,
          avatarUrl: sessionCustomer.avatarUrl || '',
          storeId: sessionCustomer.storeId,
        }
      : null;

  return <CartProvider slug={store.slug} currency={store.currency || 'PKR'}>
    <div
      className={`storefront-shell ${storeDisplay.variable} ${storeSans.variable}`}
      data-store-theme={storeTheme}
      style={{ '--store-accent': storeAccent } as React.CSSProperties}
    >
      <StoreNav
        slug={store.slug}
        storeId={store.id}
        homeHref={homeHref}
        name={store.name}
        logo={store.logo}
        announcement={store.announcement}
        initialCustomer={initialCustomer}
        androidDownloadUrl={androidDownloadUrl}
      />
      {children}
      <footer className="store-footer">
        <div><strong>{store.name}</strong><span>{store.description}</span></div>
        <nav><a href={homeHref}>Home</a><a href={productsHref}>Shop</a><a href={repairHref}>iPhone Repair</a><a href={phoneCheckHref}>Phone Check</a><a href={storefrontPath(store.slug, 'account')}>My account</a><a href={`${homeHref}#about`}>About</a>{androidDownloadUrl ? <a href={androidDownloadUrl} download="RMMobile-latest.apk">Download Android app</a> : null}</nav>
        <small>© {new Date().getFullYear()} {store.name}</small>
      </footer>
    </div>
  </CartProvider>;
}
