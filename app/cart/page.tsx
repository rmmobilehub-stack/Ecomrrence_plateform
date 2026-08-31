import CartPage from '@/app/store/[storeSlug]/cart/page';
import { defaultStoreSlug } from '@/lib/storefront-paths';

export default function DefaultCartPage() {
  return <CartPage params={{ storeSlug: defaultStoreSlug }}/>;
}
