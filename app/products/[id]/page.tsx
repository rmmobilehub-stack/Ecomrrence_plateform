import type { Metadata } from 'next';
import ProductPage, { generateMetadata as generateProductMetadata } from '@/app/store/[storeSlug]/products/[id]/page';
import { defaultStoreSlug } from '@/lib/storefront-paths';

export function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return generateProductMetadata({ params: { storeSlug: defaultStoreSlug, id: params.id } });
}

export default function DefaultProductPage({ params }: { params: { id: string } }) {
  return <ProductPage params={{ storeSlug: defaultStoreSlug, id: params.id }}/>;
}
