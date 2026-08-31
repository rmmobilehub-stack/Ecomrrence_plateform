import ProductsPage from '@/app/store/[storeSlug]/products/page';
import { defaultStoreSlug } from '@/lib/storefront-paths';

export default function DefaultProductsPage() {
  return <ProductsPage params={{ storeSlug: defaultStoreSlug }}/>;
}
