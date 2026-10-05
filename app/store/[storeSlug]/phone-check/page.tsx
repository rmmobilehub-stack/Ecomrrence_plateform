import { getActiveStoreBySlug } from '@/lib/db';
import PhoneCheckFlow from '@/components/store/PhoneCheckFlow';
import { getRepairCatalog } from '@/lib/iphone-repair-catalog';
import { notFound } from 'next/navigation';

export default async function PhoneCheckPage({ params }: { params: { storeSlug: string } }) {
  const store = await getActiveStoreBySlug(params.storeSlug);
  if (!store) notFound();
  const catalog = getRepairCatalog();

  return (
    <main>
      <PhoneCheckFlow slug={store.slug} storeName={store.name} initialModels={catalog.models} />
    </main>
  );
}
