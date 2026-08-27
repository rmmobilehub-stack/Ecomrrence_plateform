/* eslint-disable no-console */
const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const dataDir = path.join(process.cwd(), 'data');
const files = ['super-admins.json', 'admins.json', 'stores.json', 'products.json', 'categories.json', 'orders.json', 'notifications.json', 'discounts.json'];

async function read(filename) {
  try { return JSON.parse(await fs.readFile(path.join(dataDir, filename), 'utf8')); } catch { return []; }
}
async function write(filename, value) { await fs.writeFile(path.join(dataDir, filename), JSON.stringify(value, null, 2)); }

async function main() {
  await fs.mkdir(dataDir, { recursive: true });
  const records = Object.fromEntries(await Promise.all(files.map(async file => [file, await read(file)])));
  const now = new Date().toISOString();
  let superAdmin = records['super-admins.json'].find(item => item.email === 'super@platform.com');
  if (!superAdmin) {
    superAdmin = { id: randomUUID(), name: 'Super Admin', email: 'super@platform.com', passwordHash: await bcrypt.hash('admin123', 12), createdAt: now };
    records['super-admins.json'].push(superAdmin);
  } else if (!await bcrypt.compare('admin123', superAdmin.passwordHash)) {
    // Repair older demo data whose documented credentials no longer match.
    superAdmin.passwordHash = await bcrypt.hash('admin123', 12);
  }
  let admin = records['admins.json'].find(item => item.email === 'admin@demo.com');
  let store = records['stores.json'].find(item => item.slug === 'demo');
  if (!admin || !store) {
    const storeId = store?.id || randomUUID(); const adminId = admin?.id || randomUUID();
    if (!admin) { admin = { id: adminId, name: 'Demo Admin', email: 'admin@demo.com', passwordHash: await bcrypt.hash('admin123', 12), status: 'active', plan: 'pro', storeId, createdAt: now }; records['admins.json'].push(admin); }
    if (!store) { store = { id: storeId, adminId, name: 'Demo Store', slug: 'demo', description: 'A carefully curated demo storefront.', logo: '', banner: '', primaryColor: '#6c63ff', currency: 'USD', contactEmail: 'admin@demo.com', socialLinks: {}, isActive: true, createdAt: now }; records['stores.json'].push(store); }
  }
  if (admin && !await bcrypt.compare('admin123', admin.passwordHash)) {
    // Same self-repair for the documented demo store administrator.
    admin.passwordHash = await bcrypt.hash('admin123', 12);
  }
  if (records['categories.json'].filter(item => item.storeId === store.id).length === 0) {
    const apparel = { id: randomUUID(), storeId: store.id, name: 'Apparel', slug: 'apparel', description: 'Everyday essentials', createdAt: now };
    const accessories = { id: randomUUID(), storeId: store.id, name: 'Accessories', slug: 'accessories', description: 'Finishing touches', createdAt: now };
    records['categories.json'].push(apparel, accessories);
    const products = [
      { name: 'Classic Everyday Tee', price: 24, comparePrice: 30, stock: 30, categoryId: apparel.id, sku: 'TEE-001', description: 'A soft, reliable tee made for every day.', variants: [{ name: 'Size', options: ['S', 'M', 'L', 'XL'], priceModifier: 0 }] },
      { name: 'Canvas Weekend Tote', price: 38, comparePrice: 0, stock: 15, categoryId: accessories.id, sku: 'TOT-001', description: 'A roomy canvas tote for your daily essentials.', variants: [] },
      { name: 'Relaxed Hoodie', price: 54, comparePrice: 65, stock: 20, categoryId: apparel.id, sku: 'HOD-001', description: 'Comfortable warmth with a relaxed fit.', variants: [{ name: 'Size', options: ['S', 'M', 'L', 'XL'], priceModifier: 0 }] },
    ].map(product => ({ id: randomUUID(), storeId: store.id, slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), discount: 0, images: [], thumbnail: '', tags: [], status: 'active', customProperties: [], createdAt: now, updatedAt: now, ...product }));
    records['products.json'].push(...products);
  }
  await Promise.all(files.map(file => write(file, records[file])));
  console.log('Seed complete. Super admin: super@platform.com / admin123; Demo admin: admin@demo.com / admin123');
}
main().catch(error => { console.error(error); process.exit(1); });
