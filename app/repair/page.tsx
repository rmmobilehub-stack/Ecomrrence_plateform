import RepairPage from '@/app/store/[storeSlug]/repair/page';
import { defaultStoreSlug } from '@/lib/storefront-paths';

export default function DefaultRepairPage() {
  return <RepairPage params={{ storeSlug: defaultStoreSlug }} />;
}
