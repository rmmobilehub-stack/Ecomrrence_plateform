import PhoneCheckFlow from '@/components/store/PhoneCheckFlow';
import { getRepairCatalog } from '@/lib/iphone-repair-catalog';
import { requireStorefrontCustomer } from '@/lib/require-storefront-customer';
import { storefrontPath } from '@/lib/storefront-paths';

export default async function PhoneCheckPage({ params }: { params: { storeSlug: string } }) {
  const { store } = await requireStorefrontCustomer(
    params.storeSlug,
    storefrontPath(params.storeSlug, 'phone-check')
  );
  const catalog = getRepairCatalog();

  return (
    <main>
      <PhoneCheckFlow slug={store.slug} storeName={store.name} initialModels={catalog.models} />
    </main>
  );
}
