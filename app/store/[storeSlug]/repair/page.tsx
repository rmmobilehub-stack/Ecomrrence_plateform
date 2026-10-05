import { getActiveStoreBySlug } from '@/lib/db';
import RepairBookingFlow from '@/components/store/RepairBookingFlow';
import { getRepairCatalog } from '@/lib/iphone-repair-catalog';
import { notFound } from 'next/navigation';

export default async function RepairPage({ params }: { params: { storeSlug: string } }) {
  const store = await getActiveStoreBySlug(params.storeSlug);
  if (!store) notFound();
  const catalog = getRepairCatalog();

  return (
    <main>
      <RepairBookingFlow
        slug={store.slug}
        storeName={store.name}
        whatsappNumber={store.whatsappNumber}
        initialModels={catalog.models}
        initialIssues={catalog.issues}
        initialSimOptions={[...catalog.simOptions]}
      />
    </main>
  );
}
