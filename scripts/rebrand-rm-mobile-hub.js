/* eslint-disable no-console */
const { randomUUID } = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const { loadEnvironment } = require('./load-env');
const { storeProfile, categoryProfiles, productProfiles } = require('./rm-mobile-hub-data');

function failOn(error, action) {
  if (error) throw new Error(`${action}: ${error.message}`);
}

async function rebrandRmMobileHub() {
  loadEnvironment();
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const slug = process.env.DEFAULT_STORE_SLUG || 'demo';
  if (!url || !secretKey) throw new Error('Supabase credentials are missing from .env.local.');

  const supabase = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const now = new Date().toISOString();

  const { data: store, error: storeReadError } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single();
  failOn(storeReadError, 'Reading the default store');

  const { error: storeUpdateError } = await supabase
    .from('stores')
    .update(storeProfile)
    .eq('id', store.id);
  failOn(storeUpdateError, 'Updating the RM Mobile Hub storefront');

  const { error: adminUpdateError } = await supabase
    .from('admins')
    .update({ name: 'RM Mobile Hub Admin' })
    .eq('id', store.admin_id);
  failOn(adminUpdateError, 'Updating the store administrator name');

  const { data: existingCategories, error: categoryReadError } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: true });
  failOn(categoryReadError, 'Reading categories');

  const categoryIds = {};
  for (let index = 0; index < categoryProfiles.length; index += 1) {
    const profile = categoryProfiles[index];
    const current = existingCategories.find((item) => item.slug === profile.slug) || existingCategories[index];
    const id = current?.id || randomUUID();
    const row = { id, store_id: store.id, ...profile, created_at: current?.created_at || now };
    const { error } = await supabase.from('categories').upsert(row, { onConflict: 'id' });
    failOn(error, `Saving category ${profile.name}`);
    categoryIds[profile.slug] = id;
  }

  const { data: existingProducts, error: productReadError } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: true });
  failOn(productReadError, 'Reading products');

  const retainedProductIds = [];
  for (let index = 0; index < productProfiles.length; index += 1) {
    const profile = productProfiles[index];
    const current = existingProducts.find((item) => item.slug === profile.slug) || existingProducts[index];
    const id = current?.id || randomUUID();
    const { category, ...product } = profile;
    const row = {
      id,
      store_id: store.id,
      ...product,
      category_id: categoryIds[category],
      status: 'active',
      created_at: current?.created_at || now,
      updated_at: now,
    };
    const { error } = await supabase.from('products').upsert(row, { onConflict: 'id' });
    failOn(error, `Saving product ${profile.name}`);
    retainedProductIds.push(id);
  }

  const staleProductIds = existingProducts
    .map((product) => product.id)
    .filter((id) => !retainedProductIds.includes(id));
  if (staleProductIds.length) {
    const { error } = await supabase
      .from('products')
      .update({ status: 'archived', updated_at: now })
      .in('id', staleProductIds);
    failOn(error, 'Archiving unrelated old products');
  }

  console.log(`RM Mobile Hub rebrand complete: ${productProfiles.length} products and ${categoryProfiles.length} categories are active.`);
}

if (require.main === module) {
  rebrandRmMobileHub().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
}

module.exports = { rebrandRmMobileHub };
