import Link from 'next/link';
import { ArrowRight, Facebook, Globe2, Instagram, Music2, Twitter, Youtube } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { readDb } from '@/lib/db';
import type { Product, Store } from '@/lib/types';
import ProductCard from '@/components/store/ProductCard';
import HeroProductSlider, { type HeroSlide } from '@/components/store/HeroProductSlider';
import LeadChatbot from '@/components/store/LeadChatbot';
import WhatsAppButton from '@/components/store/WhatsAppButton';
import { calculateProductPrice } from '@/lib/pricing';
import { isValidWhatsAppNumber } from '@/lib/whatsapp';
import { storefrontPath } from '@/lib/storefront-paths';

function safePublicUrl(value?: string) {
  if (!value) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
}

export default async function StoreHome({ params }: { params: { storeSlug: string } }) {
  const [stores, products] = await Promise.all([readDb<Store>('stores'), readDb<Product>('products')]);
  const store = stores.find((entry) => entry.slug === params.storeSlug && entry.isActive)!;
  const activeProducts = products.filter((product) => product.storeId === store.id && product.status === 'active');
  const featured = activeProducts.slice(0, 8);
  const shopHref = storefrontPath(store.slug, 'products');
  const title = store.heroTitle || 'Everyday pieces, picked with care.';
  const chatMessage = `Hello ${store.name}, I would like to know more about your products.`;
  const contactWidgetMode = store.contactWidgetMode ?? 'both';
  const showWhatsApp = ['whatsapp', 'both'].includes(contactWidgetMode) && isValidWhatsAppNumber(store.whatsappNumber);
  const showChatbot = ['chatbot', 'both'].includes(contactWidgetMode);

  const productSlides: HeroSlide[] = activeProducts
    .map((product) => ({
      src: product.thumbnail || product.images?.[0] || '',
      label: product.name,
      href: storefrontPath(store.slug, `products/${product.id}`),
      mode: 'product' as const,
    }))
    .filter((slide) => Boolean(slide.src))
    .slice(0, 6);
  const configuredSlides = (store.heroSlides ?? []).filter(Boolean).map((src, index) => ({
    src,
    label: `${store.name} collection ${index + 1}`,
    href: shopHref,
    mode: 'campaign' as const,
  }));
  const slides = configuredSlides.length
    ? configuredSlides
    : productSlides.length
      ? productSlides
      : store.banner
        ? [{ src: store.banner, label: store.name, href: shopHref, mode: 'campaign' as const }]
        : [];

  const productImages = featured.map((product) => product.thumbnail || product.images?.[0] || '').filter(Boolean);
  const aboutImage = store.aboutImage || productImages[0] || '';
  const aboutSecondaryImage = productImages.find((image) => image !== aboutImage) || productImages[1] || '';
  const socialOptions: { key: keyof Store['socialLinks']; label: string; Icon: LucideIcon }[] = [
    { key: 'instagram', label: 'Instagram', Icon: Instagram },
    { key: 'facebook', label: 'Facebook', Icon: Facebook },
    { key: 'tiktok', label: 'TikTok', Icon: Music2 },
    { key: 'youtube', label: 'YouTube', Icon: Youtube },
    { key: 'twitter', label: 'X / Twitter', Icon: Twitter },
    { key: 'website', label: 'Website', Icon: Globe2 },
  ];
  const socials = socialOptions
    .map((option) => ({ ...option, href: safePublicUrl(store.socialLinks?.[option.key]) }))
    .filter((profile) => Boolean(profile.href));

  return <main>
    <section className="store-hero">
      <HeroProductSlider slides={slides} storeName={store.name}/>
      <div className="store-hero-shell">
        <div className="store-hero-content">
          <p className="hero-kicker">{store.announcement || 'Cash on delivery'}</p>
          <h1 className="store-hero-title">{title}</h1>
          {store.description && <p className="store-hero-desc">{store.description}</p>}
          <div className="hero-actions">
            <Link className="btn btn-primary btn-lg" href={shopHref}>{store.heroCtaLabel || 'Shop collection'} <ArrowRight size={17}/></Link>
          </div>
        </div>
      </div>
    </section>

    <section className="store-section featured-section">
      <div className="section-heading">
        <div className="section-heading-copy"><span className="section-number">01</span><div><h2>Featured products</h2><p className="text-secondary">A quick look at what is available right now.</p></div></div>
        <Link className="collection-link" href={shopHref}>View all products <ArrowRight size={17}/></Link>
      </div>
      {featured.length
        ? <div className="products-grid">{featured.map((product) => <ProductCard key={product.id} product={product} slug={store.slug}/>)}</div>
        : <div className="empty-state">This store has no products yet.</div>}
    </section>

    <section className="store-about" id="about">
      <div className="store-about-heading"><span>02 / About</span><h2>{store.aboutTitle || `Meet ${store.name}.`}</h2></div>
      <div className="store-about-layout">
        <div className="store-about-gallery">
          <div className="store-about-primary">{aboutImage ? <img src={aboutImage} alt={`${store.name} collection`}/> : <div className="store-about-placeholder"><span>{store.name.charAt(0)}</span></div>}</div>
          {aboutSecondaryImage && <div className="store-about-secondary"><img src={aboutSecondaryImage} alt="A product from our collection"/></div>}
          <span className="store-about-label">Our collection</span>
        </div>
        <div className="store-about-copy">
          <p>{store.aboutDescription || store.description || `Explore ${store.name} and order directly through our simple storefront.`}</p>
          <div className="store-about-facts">
            <div><strong>Easy</strong><span>Simple checkout</span></div>
            <div><strong>COD</strong><span>Pay on delivery</span></div>
            <div><strong>{store.whatsappNumber ? 'Direct' : 'Email'}</strong><span>Order support</span></div>
          </div>
          {socials.length > 0 && <div className="store-socials"><span>Connect with us</span><div>{socials.map(({ key, label, Icon, href }) => <a key={key} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}><Icon size={18}/></a>)}</div></div>}
          <Link className="about-shop-link" href={shopHref}>Explore all products <ArrowRight size={17}/></Link>
        </div>
      </div>
    </section>

    {(showWhatsApp || showChatbot) && <div className={`store-contact-dock ${showWhatsApp && showChatbot ? 'contact-dock-both' : 'contact-dock-single'}`}>
      {showWhatsApp && <WhatsAppButton number={store.whatsappNumber} message={chatMessage} label="WhatsApp" className="floating-whatsapp"/>}
      {showChatbot && <LeadChatbot
        slug={store.slug}
        storeName={store.name}
        description={store.aboutDescription || store.description}
        currency={store.currency}
        deliveryFee={Number(store.deliveryFee || 0)}
        freeDeliveryThreshold={Number(store.freeDeliveryThreshold || 0)}
        products={activeProducts.slice(0, 6).map((product) => ({ name: product.name, price: calculateProductPrice(product.price, product.discount) }))}
        shopHref={shopHref}
      />}
    </div>}
  </main>;
}
