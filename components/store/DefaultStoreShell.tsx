import StoreLayout from '@/app/store/[storeSlug]/layout';
import { defaultStoreSlug } from '@/lib/storefront-paths';

export default function DefaultStoreShell({ children }: { children: React.ReactNode }) {
  return <StoreLayout params={{ storeSlug: defaultStoreSlug }}>{children}</StoreLayout>;
}
