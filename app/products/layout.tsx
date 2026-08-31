import type { Metadata } from 'next';
import DefaultStoreShell from '@/components/store/DefaultStoreShell';
import { generateMetadata as generateProductsMetadata } from '@/app/store/[storeSlug]/products/layout';
import { defaultStoreSlug } from '@/lib/storefront-paths';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return generateProductsMetadata({ params: { storeSlug: defaultStoreSlug } });
}

export default function DefaultProductsLayout({ children }: { children: React.ReactNode }) {
  return <DefaultStoreShell>{children}</DefaultStoreShell>;
}
