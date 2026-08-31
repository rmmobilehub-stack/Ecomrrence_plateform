export const defaultStoreSlug = process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG || process.env.DEFAULT_STORE_SLUG || 'demo';

export function storefrontBasePath(slug: string): string {
  return slug === defaultStoreSlug ? '' : `/store/${slug}`;
}

export function storefrontPath(slug: string, path = ''): string {
  const base = storefrontBasePath(slug);
  const suffix = path ? `/${path.replace(/^\/+/, '')}` : '';
  return `${base}${suffix}` || '/';
}
