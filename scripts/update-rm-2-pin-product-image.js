/* eslint-disable no-console */
const { createClient } = require('@supabase/supabase-js');
const { loadEnvironment } = require('./load-env');

async function updateTwoPinProductImage() {
  loadEnvironment();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const storeSlug = process.env.DEFAULT_STORE_SLUG || 'demo';
  if (!url || !key) throw new Error('Supabase credentials are missing.');

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data: store, error: storeError } = await supabase.from('stores').select('id').eq('slug', storeSlug).single();
  if (storeError || !store) throw new Error(storeError?.message || 'Store not found.');

  const image = '/storefront/rm-20w-usb-c-2-pin-adapter-product.png';
  const { error } = await supabase
    .from('products')
    .update({ thumbnail: image, images: [image] })
    .eq('store_id', store.id)
    .eq('slug', '20w-usb-c-2-pin-charger-adapter');
  if (error) throw new Error(error.message);
  console.log('Updated only the RM Mobile Hub 20W 2-pin adapter image.');
}

updateTwoPinProductImage().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
