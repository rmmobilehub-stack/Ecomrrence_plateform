import AccountPage from '@/app/store/[storeSlug]/account/page';
import { defaultStoreSlug } from '@/lib/storefront-paths';

export default function DefaultAccountPage() {
  return <AccountPage params={{ storeSlug: defaultStoreSlug }} />;
}
