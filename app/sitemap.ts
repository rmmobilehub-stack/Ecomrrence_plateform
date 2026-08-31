import type { MetadataRoute } from 'next';
import { readDb } from '@/lib/db';
import type { Product, Store } from '@/lib/types';
import { storefrontPath } from '@/lib/storefront-paths';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// The sitemap is database-backed and must be generated at request time.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [stores, products] = await Promise.all([readDb<Store>('stores'), readDb<Product>('products')]);
  const activeStores = stores.filter(store => store.isActive);
  const activeStoreIds = new Set(activeStores.map(store => store.id));
  const entries: MetadataRoute.Sitemap = [];
  const absoluteStorefrontUrl = (slug: string, path = '') => `${siteUrl}${storefrontPath(slug, path) === '/' ? '' : storefrontPath(slug, path)}`;

  for (const store of activeStores) {
    const storeHome = absoluteStorefrontUrl(store.slug);
    entries.push({ url: storeHome, lastModified: store.createdAt, changeFrequency: 'daily', priority: 0.9 });
    entries.push({ url: absoluteStorefrontUrl(store.slug, 'products'), lastModified: store.createdAt, changeFrequency: 'daily', priority: 0.8 });
  }
  for (const product of products.filter(product => activeStoreIds.has(product.storeId) && product.status === 'active')) {
    const store = activeStores.find(entry => entry.id === product.storeId);
    if (store) entries.push({ url: absoluteStorefrontUrl(store.slug, `products/${product.id}`), lastModified: product.updatedAt || product.createdAt || new Date(), changeFrequency: 'weekly', priority: 0.7 });
  }
  return entries;
}
