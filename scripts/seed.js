/* eslint-disable no-console */
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const { loadEnvironment } = require('./load-env');

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
      .insert({ id: adminId, name: 'Demo Admin', email: 'admin@demo.com', password_hash: adminPasswordHash, status: 'active', plan: 'pro', store_id: storeId, created_at: now })
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
        name: 'Demo Store',
        slug: 'demo',
        description: 'Comfort-first apparel and useful everyday accessories, selected to make shopping simple.',
        logo: '',
        banner: '',
        hero_title: 'Everyday essentials, made easy.',
        hero_cta_label: 'Shop the collection',
        hero_slides: [],
        about_title: 'Simple pieces for real, everyday routines.',
        about_description: 'We focus on practical wardrobe essentials and everyday carry pieces that are easy to choose, easy to order, and made for repeat use.',
        primary_color: '#6c63ff',
        currency: 'USD',
        contact_email: 'admin@demo.com',
        contact_widget_mode: 'both',
        social_links: {},
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
    const apparelId = randomUUID();
    const accessoriesId = randomUUID();
    const { error: categoryError } = await supabase.from('categories').insert([
      { id: apparelId, store_id: store.id, name: 'Apparel', slug: 'apparel', description: 'Everyday essentials', created_at: now },
      { id: accessoriesId, store_id: store.id, name: 'Accessories', slug: 'accessories', description: 'Finishing touches', created_at: now },
    ]);
    failOn(categoryError, 'Creating demo categories');

    const products = [
      { name: 'Classic Everyday Tee', price: 24, compare_price: 30, stock: 30, category_id: apparelId, sku: 'TEE-001', description: 'A soft, reliable tee made for every day.', variants: [{ name: 'Size', options: ['S', 'M', 'L', 'XL'], priceModifier: 0 }] },
      { name: 'Canvas Weekend Tote', price: 38, compare_price: 0, stock: 15, category_id: accessoriesId, sku: 'TOT-001', description: 'A roomy canvas tote for your daily essentials.', variants: [] },
      { name: 'Relaxed Hoodie', price: 54, compare_price: 65, stock: 20, category_id: apparelId, sku: 'HOD-001', description: 'Comfortable warmth with a relaxed fit.', variants: [{ name: 'Size', options: ['S', 'M', 'L', 'XL'], priceModifier: 0 }] },
    ].map((product) => ({
      id: randomUUID(), store_id: store.id,
      slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      description: '', discount: 0, images: [], thumbnail: '', tags: [], status: 'active',
      custom_properties: [], created_at: now, updated_at: now, ...product,
    }));
    const { error: productError } = await supabase.from('products').insert(products);
    failOn(productError, 'Creating demo products');
  }

  console.log('Supabase seed complete.');
  console.log('Super admin: super@platform.com / admin123');
  console.log('Demo admin: admin@demo.com / admin123');
}

if (require.main === module) {
  seedDatabase().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
}

module.exports = { seedDatabase };
