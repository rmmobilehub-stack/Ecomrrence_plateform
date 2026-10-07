import { getRepairCatalog } from '@/lib/iphone-repair-catalog';
import RepairBookingFlow from '@/components/store/RepairBookingFlow';
import { requireStorefrontCustomer } from '@/lib/require-storefront-customer';
import { storefrontPath } from '@/lib/storefront-paths';

export default async function RepairPage({ params }: { params: { storeSlug: string } }) {
  const { store } = await requireStorefrontCustomer(
    params.storeSlug,
    storefrontPath(params.storeSlug, 'repair')
  );
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
