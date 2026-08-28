import Link from 'next/link';
import { readDb } from '@/lib/db';
import type { Product, Store } from '@/lib/types';
import ProductCard from '@/components/store/ProductCard';
import WhatsAppButton from '@/components/store/WhatsAppButton';

export default async function StoreHome({ params }: { params: { storeSlug: string } }) {
  const [stores, products] = await Promise.all([readDb<Store>('stores'), readDb<Product>('products')]);
  const store = stores.find(entry => entry.slug === params.storeSlug && entry.isActive)!;
  const featured = products.filter(product => product.storeId === store.id && product.status === 'active').slice(0, 8);
  const title = store.heroTitle || `A brighter way to shop ${store.name}.`;
  const chatMessage = `Hello ${store.name}, I would like to know more about your products.`;

  return <main><section className="store-hero" style={store.banner ? { backgroundImage: `url(${store.banner})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}><div className="store-hero-bg"/><div className="store-hero-content"><p className="eyebrow">CURATED FOR EVERYDAY LIVING</p><h1 className="store-hero-title">{title}</h1><p className="store-hero-desc">{store.description || 'Discover thoughtful products, a smooth checkout and a storefront made around you.'}</p><div className="hero-actions"><Link className="btn btn-primary btn-lg" href={`/store/${store.slug}/products`}>{store.heroCtaLabel || 'Explore collection'} <span>→</span></Link><Link className="btn btn-secondary btn-lg" href={`/store/${store.slug}/products`}>View new arrivals</Link></div><div className="hero-benefits"><div><strong>Easy checkout</strong><span>Cash on delivery</span></div><div><strong>Curated picks</strong><span>Made to be loved</span></div><div><strong>Secure order</strong><span>We'll confirm with you</span></div></div></div></section><section className="store-section"><div className="section-heading"><div><p className="eyebrow">HANDPICKED FOR YOU</p><h2>Featured products</h2><p className="text-secondary">Latest pieces selected for your collection.</p></div><Link className="btn btn-ghost" href={`/store/${store.slug}/products`}>Browse every product →</Link></div>{featured.length ? <div className="products-grid">{featured.map(product => <ProductCard key={product.id} product={product} slug={store.slug}/>)}</div> : <div className="empty-state">This store has no products yet.</div>}</section><section className="store-promise"><div><p className="eyebrow">SHOP WITH CONFIDENCE</p><h2>Simple from first click to delivery.</h2></div><p>Every order is reviewed before dispatch, and you pay when it reaches your door.</p></section><WhatsAppButton number={store.whatsappNumber} message={chatMessage} label="WhatsApp" className="floating-whatsapp"/></main>;
}
