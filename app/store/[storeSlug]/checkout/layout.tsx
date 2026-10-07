import type { Metadata } from 'next';
import { requireStorefrontCustomer } from '@/lib/require-storefront-customer';
import { storefrontPath } from '@/lib/storefront-paths';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false, follow: false } };

export default async function CheckoutLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { storeSlug: string };
}) {
  await requireStorefrontCustomer(params.storeSlug, storefrontPath(params.storeSlug, 'checkout'));
  return children;
}
