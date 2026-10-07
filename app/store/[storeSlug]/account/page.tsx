import { notFound } from 'next/navigation';
import { getActiveStoreBySlug } from '@/lib/db';
import CustomerAccountPanel from '@/components/store/CustomerAccountPanel';

export default async function CustomerAccountPage({ params }: { params: { storeSlug: string } }) {
  const store = await getActiveStoreBySlug(params.storeSlug);
  if (!store) notFound();

  return (
    <main className="store-section customer-auth-page">
      <CustomerAccountPanel slug={store.slug} storeName={store.name} currency={store.currency || 'PKR'} />
    </main>
  );
}
