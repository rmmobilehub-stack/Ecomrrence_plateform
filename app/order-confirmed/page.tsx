import ConfirmationPage from '@/app/store/[storeSlug]/order-confirmed/page';
import { defaultStoreSlug } from '@/lib/storefront-paths';

export default function DefaultConfirmationPage() {
  return <ConfirmationPage params={{ storeSlug: defaultStoreSlug }}/>;
}
