import LoginPage from '@/app/store/[storeSlug]/account/login/page';
import { defaultStoreSlug } from '@/lib/storefront-paths';

export default function DefaultAccountLoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; returnTo?: string };
}) {
  return <LoginPage params={{ storeSlug: defaultStoreSlug }} searchParams={searchParams} />;
}
