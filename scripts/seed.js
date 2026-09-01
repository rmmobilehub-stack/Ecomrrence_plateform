/* eslint-disable no-console */
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const { loadEnvironment } = require('./load-env');
const { storeProfile, categoryProfiles, productProfiles } = require('./rm-mobile-hub-data');

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
  } else if (!await bcrypt.compare('admin123', superAdmin.password_hash)) {
    ({ error } = await supabase.from('super_admins').update({ password_hash: superPasswordHash }).eq('id', superAdmin.id));
    failOn(error, 'Updating super admin password');
  }

  let { data: admin, error: adminError } = await supabase
    .from('admins')
    .select('*')
    .eq('email', 'admin@demo.com')
    .maybeSingle();
  failOn(adminError, 'Reading demo admin');

  const storeId = admin?.store_id || randomUUID();
  const adminId = admin?.id || randomUUID();
  const adminPasswordHash = await bcrypt.hash('admin123', 12);
  if (!admin) {
    ({ data: admin, error: adminError } = await supabase
      .from('admins')
      .insert({ id: adminId, name: 'RM Mobile Hub Admin', email: 'admin@demo.com', password_hash: adminPasswordHash, status: 'active', plan: 'pro', store_id: storeId, created_at: now })
      .select('*')
      .single());
    failOn(adminError, 'Creating demo admin');
  } else if (!await bcrypt.compare('admin123', admin.password_hash)) {
    ({ error: adminError } = await supabase.from('admins').update({ password_hash: adminPasswordHash }).eq('id', admin.id));
    failOn(adminError, 'Updating demo admin password');
  }

  let { data: store, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .maybeSingle();
  failOn(storeError, 'Reading demo store');
  if (!store) {
    ({ data: store, error: storeError } = await supabase
      .from('stores')
      .insert({
        id: storeId,
        admin_id: adminId,
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

  console.log('Supabase seed complete.');
  console.log('Super admin: super@platform.com / admin123');
  console.log('Store admin: admin@demo.com / admin123');
}

if (require.main === module) {
  seedDatabase().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
}

module.exports = { seedDatabase };
