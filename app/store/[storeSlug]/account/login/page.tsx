import { notFound, redirect } from 'next/navigation';
import { getActiveStoreBySlug } from '@/lib/db';
import { getCustomerSession } from '@/lib/customer-auth';
import { storefrontPath } from '@/lib/storefront-paths';
import CustomerLoginPanel from '@/components/store/CustomerLoginPanel';

export default async function CustomerLoginPage({
  params,
  searchParams,
}: {
  params: { storeSlug: string };
  searchParams?: { error?: string; returnTo?: string };
}) {
  const store = await getActiveStoreBySlug(params.storeSlug);
  if (!store) notFound();

  const session = await getCustomerSession();
  if (session?.storeId === store.id) {
    redirect(storefrontPath(store.slug, 'account'));
  }

  return (
    <main className="store-section customer-auth-page">
      <CustomerLoginPanel
        storeSlug={store.slug}
        storeName={store.name}
        returnTo={searchParams?.returnTo}
        error={searchParams?.error}
      />
    </main>
  );
}
