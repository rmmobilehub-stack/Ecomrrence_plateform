import type { Metadata } from 'next';
import StoreHome from './store/[storeSlug]/page';
import StoreLayout, { generateMetadata as generateStoreMetadata } from './store/[storeSlug]/layout';
import { defaultStoreSlug } from '@/lib/storefront-paths';

const storeSlug = defaultStoreSlug;

// The homepage reads the live default store from Supabase.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return generateStoreMetadata({ params: { storeSlug } });
}

export default function Home() {
  return (
    <StoreLayout params={{ storeSlug }}>
      <StoreHome params={{ storeSlug }} />
    </StoreLayout>
  );
}
