/* eslint-disable no-console */
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const { loadEnvironment } = require('./load-env');
const { storeProfile, categoryProfiles, productProfiles } = require('./rm-mobile-hub-data');
const { bagsStoreProfile, bagsCategoryProfiles, bagsProductProfiles } = require('./bags-store-data');

function failOn(error, action) {
  if (error) throw new Error(`${action}: ${error.message}`);
}

async function seedDatabase() {
  loadEnvironment();
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secretKey) {
    throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local before seeding.');
  }

  const supabase = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const now = new Date().toISOString();

  let { data: superAdmin, error } = await supabase
    .from('super_admins')
    .select('*')
    .eq('email', 'super@platform.com')
    .maybeSingle();
  failOn(error, 'Reading super admin');
  const superPasswordHash = await bcrypt.hash('admin123', 12);
  if (!superAdmin) {
    ({ data: superAdmin, error } = await supabase
      .from('super_admins')
      .insert({ id: randomUUID(), name: 'Super Admin', email: 'super@platform.com', password_hash: superPasswordHash, created_at: now })
      .select('*')
      .single());
    failOn(error, 'Creating super admin');
  }

  let { data: admin, error: adminError } = await supabase
    .from('admins')
    .select('*')
    .eq('email', 'admin@demo.com')
    .maybeSingle();
  failOn(adminError, 'Reading demo admin');

  let { data: store, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', 'demo')
    .maybeSingle();
  failOn(storeError, 'Reading demo store');

  const storeId = store?.id || admin?.store_id || randomUUID();
  const adminId = admin?.id || randomUUID();
  const adminPasswordHash = await bcrypt.hash('admin123', 12);

  if (!store) {
    ({ data: store, error: storeError } = await supabase
      .from('stores')
      .insert({
        id: storeId,
        admin_id: null,
        slug: 'demo',
        ...storeProfile,
        contact_email: 'admin@demo.com',
        contact_widget_mode: 'both',
        is_active: true,
        created_at: now,
      })
      .select('*')
      .single());
    failOn(storeError, 'Creating demo store');
  }

  if (!admin) {
    ({ data: admin, error: adminError } = await supabase
      .from('admins')
      .insert({ id: adminId, name: 'RM Mobile Hub Admin', email: 'admin@demo.com', password_hash: adminPasswordHash, status: 'active', plan: 'pro', store_id: storeId, created_at: now })
      .select('*')
      .single());
    failOn(adminError, 'Creating demo admin');
  }

  if (admin.store_id !== store.id) {
    ({ data: admin, error: adminError } = await supabase.from('admins').update({ store_id: store.id }).eq('id', admin.id).select('*').single());
    failOn(adminError, 'Assigning demo admin to demo store');
  }

  ({ error: storeError } = await supabase.from('stores').update({ admin_id: admin.id }).eq('id', store.id));
  failOn(storeError, 'Linking the demo store primary administrator');

  const { count: categoryCount, error: countError } = await supabase
    .from('categories')
    .select('id', { count: 'exact', head: true })
    .eq('store_id', store.id);
  failOn(countError, 'Counting demo categories');

  if (!categoryCount) {
    const categoryIds = Object.fromEntries(categoryProfiles.map((category) => [category.slug, randomUUID()]));
    const { error: categoryError } = await supabase.from('categories').insert(categoryProfiles.map((category) => ({
      id: categoryIds[category.slug],
      store_id: store.id,
      ...category,
      created_at: now,
    })));
    failOn(categoryError, 'Creating demo categories');

    const products = productProfiles.map(({ category, ...product }) => ({
      id: randomUUID(),
      store_id: store.id,
      ...product,
      category_id: categoryIds[category],
      status: 'active',
      created_at: now,
      updated_at: now,
    }));
    const { error: productError } = await supabase.from('products').insert(products);
    failOn(productError, 'Creating demo products');
  }

  let { data: bagsStore, error: bagsStoreError } = await supabase.from('stores').select('*').eq('slug', 'bags').maybeSingle();
  failOn(bagsStoreError, 'Reading bags store');
  if (!bagsStore) {
    ({ data: bagsStore, error: bagsStoreError } = await supabase.from('stores').insert({
      id: randomUUID(), admin_id: null, slug: 'bags', ...bagsStoreProfile,
      contact_email: 'bags@demo.com', contact_widget_mode: 'chatbot', is_active: true, created_at: now,
    }).select('*').single());
    failOn(bagsStoreError, 'Creating bags store');
  }
  const { count: bagsCategoryCount, error: bagsCountError } = await supabase.from('categories').select('id', { count: 'exact', head: true }).eq('store_id', bagsStore.id);
  failOn(bagsCountError, 'Counting bags categories');
  if (!bagsCategoryCount) {
    const categoryIds = Object.fromEntries(bagsCategoryProfiles.map((category) => [category.slug, randomUUID()]));
    const { error: categoryError } = await supabase.from('categories').insert(bagsCategoryProfiles.map((category) => ({ id: categoryIds[category.slug], store_id: bagsStore.id, ...category, created_at: now })));
    failOn(categoryError, 'Creating bags categories');
    const { error: productError } = await supabase.from('products').insert(bagsProductProfiles.map(({ category, ...product }) => ({ id: randomUUID(), store_id: bagsStore.id, ...product, category_id: categoryIds[category], status: 'active', created_at: now, updated_at: now })));
    failOn(productError, 'Creating bags products');
  }

  console.log('Supabase seed complete.');
  console.log('Super admin: super@platform.com / admin123');
  console.log('Store admin: admin@demo.com / admin123');
  console.log(`Bags storefront: /store/bags (${bagsProductProfiles.length} products; assign admins in Super Admin)`);
}

if (require.main === module) {
  seedDatabase().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
}

module.exports = { seedDatabase };
