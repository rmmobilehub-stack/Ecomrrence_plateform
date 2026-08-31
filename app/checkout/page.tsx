import CheckoutPage from '@/app/store/[storeSlug]/checkout/page';
import { defaultStoreSlug } from '@/lib/storefront-paths';

export default function DefaultCheckoutPage() {
  return <CheckoutPage params={{ storeSlug: defaultStoreSlug }}/>;
}
