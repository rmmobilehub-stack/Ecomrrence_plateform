import { getSupabaseAdmin } from './supabase';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import type { Category, Product, Store } from './types';

const TABLE_BY_COLLECTION = {
  'super-admins': 'super_admins',
  'admins': 'admins',
  'stores': 'stores',
  'products': 'products',
  'categories': 'categories',
  'orders': 'orders',
  'notifications': 'notifications',
  'discounts': 'discounts',
  'leads': 'leads',
} as const;

type Collection = keyof typeof TABLE_BY_COLLECTION;

function tableFor(collection: string): string {
  const table = TABLE_BY_COLLECTION[collection as Collection];
  if (!table) throw new Error(`Unknown database collection: ${collection}`);
  return table;
}

function camelToSnake(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function snakeToCamel(value: string): string {
  return value.replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase());
}

// Nested JSONB values intentionally keep the application's camelCase shape.
function toDatabaseRow(value: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .map(([key, entry]) => [camelToSnake(key), entry])
  );
}

export function toApplicationRow<T>(value: Record<string, unknown>): T {
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [snakeToCamel(key), entry])
  ) as T;
}

function databaseError(action: string, error: { message: string; code?: string }): Error {
  const suffix = error.code ? ` (${error.code})` : '';
  return new Error(`Supabase ${action} failed${suffix}: ${error.message}`);
}

async function readAllRows(table: string, columns = '*'): Promise<Record<string, unknown>[]> {
  const pageSize = 1000;
  const rows: Record<string, unknown>[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await getSupabaseAdmin()
      .from(table)
      .select(columns)
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw databaseError(`read from ${table}`, error);

    const page = (data ?? []) as unknown as Record<string, unknown>[];
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

export async function readDb<T>(collection: string): Promise<T[]> {
  const rows = await readAllRows(tableFor(collection));
  return rows.map((row) => toApplicationRow<T>(row));
}

// Storefront reads use precise database filters instead of downloading every
// row and filtering in Node. The short cache absorbs repeated page/layout/
// metadata reads while still keeping catalogue edits visible quickly.
export const getActiveStoreBySlug = cache(async (slug: string): Promise<Store | null> =>
  unstable_cache(
    async () => {
      const { data, error } = await getSupabaseAdmin()
        .from('stores')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw databaseError(`read store ${slug}`, error);
      return data ? toApplicationRow<Store>(data as Record<string, unknown>) : null;
    },
    ['storefront-store', slug],
    { revalidate: 60 }
  )()
);

export const getActiveProductsForStore = cache(async (storeId: string): Promise<Product[]> =>
  unstable_cache(
    async () => {
      const { data, error } = await getSupabaseAdmin()
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw databaseError(`read active products for store ${storeId}`, error);
      return (data ?? []).map((row) => toApplicationRow<Product>(row as Record<string, unknown>));
    },
    ['storefront-products', storeId],
    { revalidate: 60 }
  )()
);

export const getCategoriesForStore = cache(async (storeId: string): Promise<Category[]> =>
  unstable_cache(
    async () => {
      const { data, error } = await getSupabaseAdmin()
        .from('categories')
        .select('*')
        .eq('store_id', storeId)
        .order('name', { ascending: true });
      if (error) throw databaseError(`read categories for store ${storeId}`, error);
      return (data ?? []).map((row) => toApplicationRow<Category>(row as Record<string, unknown>));
    },
    ['storefront-categories', storeId],
    { revalidate: 300 }
  )()
);

export const getActiveProductById = cache(async (storeId: string, id: string): Promise<Product | null> =>
  unstable_cache(
    async () => {
      const { data, error } = await getSupabaseAdmin()
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .eq('id', id)
        .eq('status', 'active')
        .maybeSingle();
      if (error) throw databaseError(`read product ${id}`, error);
      return data ? toApplicationRow<Product>(data as Record<string, unknown>) : null;
    },
    ['storefront-product', storeId, id],
    { revalidate: 60 }
  )()
);

/**
 * Replaces a collection while preserving the old data-layer API. This is used
 * for small bulk operations such as marking all notifications as read.
 */
export async function writeDb<T extends { id: string }>(collection: string, data: T[]): Promise<void> {
  const client = getSupabaseAdmin();
  const table = tableFor(collection);
  const existing = await readAllRows(table, 'id');

  if (data.length > 0) {
    const { error } = await client.from(table).upsert(
      data.map((item) => toDatabaseRow(item as Record<string, unknown>)),
      { onConflict: 'id' }
    );
    if (error) throw databaseError(`write to ${collection}`, error);
  }

  const retainedIds = new Set(data.map((item) => item.id));
  const staleIds = existing
    .map((item) => item.id as string)
    .filter((id) => !retainedIds.has(id));

  for (let index = 0; index < staleIds.length; index += 200) {
    const { error } = await client.from(table).delete().in('id', staleIds.slice(index, index + 200));
    if (error) throw databaseError(`remove stale rows from ${collection}`, error);
  }
}

export async function findById<T extends { id: string }>(
  collection: string,
  id: string
): Promise<T | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(tableFor(collection))
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw databaseError(`find in ${collection}`, error);
  return data ? toApplicationRow<T>(data) : null;
}

export async function insertOne<T extends object>(
  collection: string,
  item: T
): Promise<T> {
  const { data, error } = await getSupabaseAdmin()
    .from(tableFor(collection))
    .insert(toDatabaseRow(item as Record<string, unknown>))
    .select('*')
    .single();
  if (error) throw databaseError(`insert into ${collection}`, error);
  return toApplicationRow<T>(data);
}

export async function updateOne<T extends { id: string }>(
  collection: string,
  id: string,
  updates: Partial<T>
): Promise<T | null> {
  const { data, error } = await getSupabaseAdmin()
    .from(tableFor(collection))
    .update(toDatabaseRow(updates as Record<string, unknown>))
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw databaseError(`update ${collection}`, error);
  return data ? toApplicationRow<T>(data) : null;
}

export async function deleteOne<T extends { id: string }>(
  collection: string,
  id: string
): Promise<boolean> {
  const { data, error } = await getSupabaseAdmin()
    .from(tableFor(collection))
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();
  if (error) throw databaseError(`delete from ${collection}`, error);
  return Boolean(data);
}
