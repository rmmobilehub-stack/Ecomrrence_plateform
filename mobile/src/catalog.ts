import type { Category, Product } from './types';

export type CatalogProduct = Product & { image: number };

export const SHOP_CATEGORIES: Category[] = [
  { id: 'chargers', name: 'Chargers', slug: 'chargers' },
  { id: 'cables', name: 'Cables', slug: 'cables' },
  { id: 'cases', name: 'Cases', slug: 'cases' },
  { id: 'protection', name: 'Protection', slug: 'protection' },
];

function item(
  id: string,
  name: string,
  price: number,
  comparePrice: number,
  discount: number,
  categoryId: string,
  image: number,
  description: string,
): CatalogProduct {
  return {
    id,
    storeId: 'local',
    name,
    slug: id,
    description,
    price,
    comparePrice,
    discount,
    images: [],
    thumbnail: '',
    categoryId,
    tags: [],
    stock: 24,
    sku: id.toUpperCase(),
    status: 'active',
    variants: [],
    image,
  };
}

export const SHOP_PRODUCTS: CatalogProduct[] = [
  item(
    'usb-c-20w',
    '20W USB-C Adapter',
    3490,
    4290,
    0,
    'chargers',
    require('./assets/products/rm-20w-usb-c-adapter.webp'),
    'Fast wall charger for everyday iPhone charging.',
  ),
  item(
    'uk-charger-set',
    '20W UK Charger + Cable',
    4490,
    5490,
    10,
    'chargers',
    require('./assets/products/rm-20w-uk-3-pin-charger-cable-set.webp'),
    'UK 3-pin adapter bundled with a braided cable.',
  ),
  item(
    'apple-cable-set',
    '20W Adapter + Cable',
    4990,
    5990,
    0,
    'cables',
    require('./assets/products/rm-apple-20w-adapter-cable.webp'),
    'Compact adapter and cable set for home or travel.',
  ),
  item(
    'clear-mag-case',
    'Clear Magnetic Case',
    2990,
    3790,
    15,
    'cases',
    require('./assets/products/rm-clear-magnetic-case.webp'),
    'MagSafe-ready clear case with raised camera protection.',
  ),
  item(
    'magsafe-charger',
    'Magnetic Wireless Charger',
    3990,
    4790,
    0,
    'chargers',
    require('./assets/products/rm-magnetic-wireless-charger.webp'),
    'Snap-on MagSafe pad for overnight charging.',
  ),
  item(
    'mag-power-bank',
    'Magnetic Power Bank',
    6490,
    7490,
    0,
    'chargers',
    require('./assets/products/rm-magnetic-power-bank.webp'),
    'Portable MagSafe battery pack for the day.',
  ),
  item(
    'lens-protector',
    'Camera Lens Protector',
    1490,
    1990,
    0,
    'protection',
    require('./assets/products/rm-camera-lens-protector.webp'),
    'Tempered glass cover for the iPhone camera ring.',
  ),
  item(
    'charge-stand',
    '3-in-1 Charging Stand',
    8990,
    10990,
    12,
    'chargers',
    require('./assets/products/rm-3-in-1-charging-stand.webp'),
    'Phone, Watch and earbuds on one nightstand dock.',
  ),
  item(
    'full-bundle',
    'Full Protection Bundle',
    5490,
    6990,
    20,
    'protection',
    require('./assets/products/rm-full-protection-bundle.webp'),
    'Case, screen and camera protection in one kit.',
  ),
  item(
    'car-charger',
    'Dual Port Car Charger',
    2490,
    2990,
    0,
    'chargers',
    require('./assets/products/rm-dual-port-car-charger.webp'),
    'Two-port charger for the car, built for fast USB-C.',
  ),
  item(
    'earbuds-case',
    'Earbuds Protective Case',
    1990,
    2490,
    0,
    'cases',
    require('./assets/products/rm-earbuds-protective-case.webp'),
    'Hard shell cover for charging case on the go.',
  ),
  item(
    'back-sheet',
    'Back Protection Sheet',
    990,
    1490,
    0,
    'protection',
    require('./assets/products/rm-back-protection-sheet.webp'),
    'Thin rear film that keeps the glass from scuffs.',
  ),
];

export function getCatalogProduct(id: string) {
  return SHOP_PRODUCTS.find(product => product.id === id) || null;
}

export function filterCatalog(search: string, categoryId: string, sortBy: string) {
  const query = search.trim().toLowerCase();
  let list = SHOP_PRODUCTS.filter(product => {
    const matchQuery = !query || product.name.toLowerCase().includes(query);
    const matchCategory = !categoryId || product.categoryId === categoryId;
    return matchQuery && matchCategory;
  });
  if (sortBy === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
  return list;
}
