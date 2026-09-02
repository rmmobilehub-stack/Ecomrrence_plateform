const bagsStoreProfile = {
  name: 'Urban Carry Bags',
  description: 'Refined ladies handbags and dependable men\'s bags for work, travel and everyday routines.',
  logo: '',
  banner: '/storefront/bags-hero.png',
  hero_title: 'Carry every day with confidence.',
  hero_cta_label: 'Shop ladies & men\'s bags',
  announcement: 'Premium bags · Cash on delivery',
  hero_slides: ['/storefront/bags-hero.png', '/storefront/bags-ladies-tote.png', '/storefront/bags-mens-messenger.png'],
  about_title: 'Thoughtful bags for work, weekends and everywhere between.',
  about_description: 'Urban Carry Bags brings together polished ladies handbags and practical men\'s carry essentials. Every piece is selected for useful organization, comfortable carrying, durable materials and a timeless everyday look.',
  about_image: '/storefront/bags-ladies-crossbody.png',
  primary_color: '#9a5d37',
  currency: 'PKR',
  delivery_fee: 250,
  free_delivery_threshold: 10000,
  social_links: {},
};

const bagsCategoryProfiles = [
  { name: 'Ladies Bags', slug: 'ladies-bags', description: 'Elegant totes, shoulder bags and crossbody styles for everyday use.' },
  { name: 'Men\'s Bags', slug: 'mens-bags', description: 'Messenger bags, backpacks and practical work or travel carry.' },
];

const bagsProductProfiles = [
  {
    name: 'Camel Structured Ladies Tote', slug: 'camel-structured-ladies-tote',
    description: 'A polished everyday tote with a spacious lined interior, secure top closure and structured silhouette. Designed to carry daily essentials comfortably from office hours to weekend plans.',
    price: 8499, compare_price: 10499, discount: 0,
    images: ['/storefront/bags-ladies-tote.png', '/storefront/bags-ladies-tote-rear.png', '/storefront/bags-ladies-tote-interior.png'],
    thumbnail: '/storefront/bags-ladies-tote.png', category: 'ladies-bags',
    tags: ['ladies tote', 'structured bag', 'office bag', 'camel'], stock: 24, sku: 'UCB-L-TOTE-CAM',
    custom_properties: [{ key: 'Material', value: 'Premium textured vegan leather', type: 'text' }, { key: 'Interior', value: 'Lined with organizer pockets', type: 'text' }],
    variants: [{ name: 'Colour', options: ['Camel', 'Black', 'Ivory'], priceModifier: 0 }],
  },
  {
    name: 'Burgundy Classic Crossbody Bag', slug: 'burgundy-classic-crossbody-bag',
    description: 'A compact ladies crossbody with an adjustable strap, secure flap and organized interior. Its rich burgundy tone adds a refined finish without sacrificing everyday convenience.',
    price: 6499, compare_price: 7999, discount: 0,
    images: ['/storefront/bags-ladies-crossbody.png', '/storefront/bags-ladies-crossbody-rear.png', '/storefront/bags-ladies-crossbody-interior.png'],
    thumbnail: '/storefront/bags-ladies-crossbody.png', category: 'ladies-bags',
    tags: ['ladies crossbody', 'shoulder bag', 'burgundy', 'compact bag'], stock: 31, sku: 'UCB-L-XBODY-BUR',
    custom_properties: [{ key: 'Material', value: 'Pebbled vegan leather', type: 'text' }, { key: 'Strap', value: 'Adjustable crossbody strap', type: 'text' }],
    variants: [{ name: 'Colour', options: ['Burgundy', 'Tan', 'Black'], priceModifier: 0 }],
  },
  {
    name: 'Executive Leather Messenger Bag', slug: 'executive-leather-messenger-bag',
    description: 'A refined men\'s work bag with a padded laptop sleeve, practical organizer pockets and an adjustable shoulder strap. The structured flap design moves comfortably between meetings and daily commutes.',
    price: 11999, compare_price: 14499, discount: 0,
    images: ['/storefront/bags-mens-messenger.png', '/storefront/bags-mens-messenger-rear.png', '/storefront/bags-mens-messenger-interior.png'],
    thumbnail: '/storefront/bags-mens-messenger.png', category: 'mens-bags',
    tags: ['mens messenger', 'laptop bag', 'office bag', 'brown leather'], stock: 18, sku: 'UCB-M-MSG-ESP',
    custom_properties: [{ key: 'Laptop fit', value: 'Up to 15.6 inches', type: 'text' }, { key: 'Material', value: 'Premium synthetic leather', type: 'text' }],
    variants: [{ name: 'Colour', options: ['Espresso Brown', 'Black'], priceModifier: 0 }],
  },
  {
    name: 'Metro Pro Travel Backpack', slug: 'metro-pro-travel-backpack',
    description: 'A clean modern men\'s backpack with padded laptop protection, breathable back support and organized zip compartments. Built for office commutes, university days and short trips.',
    price: 9999, compare_price: 12499, discount: 0,
    images: ['/storefront/bags-mens-backpack.png', '/storefront/bags-mens-backpack-rear.png', '/storefront/bags-mens-backpack-interior.png'],
    thumbnail: '/storefront/bags-mens-backpack.png', category: 'mens-bags',
    tags: ['mens backpack', 'travel bag', 'laptop backpack', 'black'], stock: 27, sku: 'UCB-M-BPK-BLK',
    custom_properties: [{ key: 'Laptop fit', value: 'Up to 16 inches', type: 'text' }, { key: 'Back panel', value: 'Padded and breathable', type: 'text' }],
    variants: [],
  },
];

module.exports = { bagsStoreProfile, bagsCategoryProfiles, bagsProductProfiles };
