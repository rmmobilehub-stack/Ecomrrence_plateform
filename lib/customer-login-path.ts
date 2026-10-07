import { storefrontPath } from '@/lib/storefront-paths';

export function customerLoginHref(storeSlug: string, returnPath: string) {
  return `${storefrontPath(storeSlug, 'account/login')}?returnTo=${encodeURIComponent(returnPath)}`;
}
