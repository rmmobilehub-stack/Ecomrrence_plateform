import type { MetadataRoute } from 'next';
import { readDb } from '@/lib/db';
import type { Product, Store } from '@/lib/types';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [stores, products] = await Promise.all([readDb<Store>('stores.json'), readDb<Product>('products.json')]);
  const activeStores = stores.filter(store => store.isActive);
  const activeStoreIds = new Set(activeStores.map(store => store.id));
  const entries: MetadataRoute.Sitemap = [];

  for (const store of activeStores) {
    entries.push({ url: `${siteUrl}/store/${store.slug}`, lastModified: store.createdAt, changeFrequency: 'daily', priority: 0.9 });
    entries.push({ url: `${siteUrl}/store/${store.slug}/products`, lastModified: store.createdAt, changeFrequency: 'daily', priority: 0.8 });
  }
  for (const product of products.filter(product => activeStoreIds.has(product.storeId) && product.status === 'active')) {
    const store = activeStores.find(entry => entry.id === product.storeId);
    if (store) entries.push({ url: `${siteUrl}/store/${store.slug}/products/${product.id}`, lastModified: product.updatedAt || product.createdAt || new Date(), changeFrequency: 'weekly', priority: 0.7 });
  }
  return entries;
}
