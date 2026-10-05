import Link from 'next/link';
import { ArrowRight, Facebook, Globe2, Instagram, MessageCircle, Music2, ShieldCheck, Sparkles, Truck, Twitter, Youtube } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { getActiveProductsForStore, getActiveStoreBySlug } from '@/lib/db';
import type { Store } from '@/lib/types';
import ProductCard from '@/components/store/ProductCard';
import HeroProductSlider, { type HeroSlide } from '@/components/store/HeroProductSlider';
import AdsBanner from '@/components/store/AdsBanner';
import LeadChatbot from '@/components/store/LeadChatbot';
import WhatsAppButton from '@/components/store/WhatsAppButton';
import Reveal from '@/components/store/Reveal';
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

function formatHeroTitle(title: string): ReactNode {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length < 3) return title;
  const head = words.slice(0, -2).join(' ');
  const accent = words.slice(-2).join(' ');
  return <>{head} <span className="hero-title-accent text-accent-glow">{accent}</span></>;
}

function formatSectionTitle(title: string, accentWords = 2): ReactNode {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length <= accentWords) return <span className="section-title-accent text-accent-glow">{title}</span>;
  const head = words.slice(0, -accentWords).join(' ');
  const accent = words.slice(-accentWords).join(' ');
  return <>{head} <span className="section-title-accent text-accent-glow">{accent}</span></>;
}

function announcementChips(announcement?: string) {
  const parts = (announcement || 'Cash on delivery')
    .split(/[•·|]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3);
  return parts.length ? parts : ['Cash on delivery'];
}

export default async function StoreHome({ params }: { params: { storeSlug: string } }) {
  const store = await getActiveStoreBySlug(params.storeSlug);
  if (!store) return null;
  const activeProducts = await getActiveProductsForStore(store.id);
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

  const chips = announcementChips(store.announcement);

  return <main>
    <section className="store-hero">
      <HeroProductSlider slides={slides} storeName={store.name}/>
      <div className="store-hero-shell">
        <div className="store-hero-content">
          <div className="hero-kicker-row" aria-label="Store highlights">
            {chips.map((chip) => <span key={chip} className="hero-kicker">{chip}</span>)}
          </div>
          <h1 className="store-hero-title title-with-underline">{formatHeroTitle(title)}</h1>
          {store.description && <p className="store-hero-desc">{store.description}</p>}
          <div className="hero-actions">
            <Link className="btn btn-primary btn-lg" href={shopHref}>{store.heroCtaLabel || 'Shop collection'} <ArrowRight size={17}/></Link>
            <Link className="hero-story-link" href="#about">Meet {store.name} <ArrowRight size={16}/></Link>
          </div>
          <ul className="hero-trust-row">
            <li><Truck size={15}/><span>Cash on delivery</span></li>
            <li><ShieldCheck size={15}/><span>Clear compatibility</span></li>
            <li><MessageCircle size={15}/><span>Direct support</span></li>
          </ul>
        </div>
      </div>
    </section>

    <AdsBanner ads={store.ads} />

    <section className="store-section featured-section">
      <div className="section-heading">
        <Reveal className="section-heading-copy featured-heading-copy">
          <div>
            <h2 className="title-with-underline">{formatSectionTitle('Featured charging essentials', 1)}</h2>
            <p className="text-secondary">Fast chargers, durable cables and magnetic accessories for your Apple setup.</p>
          </div>
        </Reveal>
        <Reveal delay={120}><Link className="collection-link" href={shopHref}>View all products <ArrowRight size={17}/></Link></Reveal>
      </div>
      {featured.length
        ? <div className="products-grid">{featured.map((product) => <ProductCard key={product.id} product={product} slug={store.slug}/>)}</div>
        : <div className="empty-state">This store has no products yet.</div>}
    </section>

    <section className="store-values" aria-labelledby="store-values-title">
      <Reveal className="store-values-intro store-values-intro-refined">
          <p className="home-section-kicker">Power & protection, made simple</p>
          <h2 id="store-values-title" className="title-with-underline">Everything your iPhone needs, <span className="section-title-accent text-accent-glow">in one place.</span></h2>
          <p>Choose the right charger, cable or protection with clear details, helpful support and cash-on-delivery ordering.</p>
      </Reveal>
      <div className="store-values-grid">
        <Reveal as="article" delay={40}>
          <div className="value-card-top"><span className="value-card-index">01</span><span className="value-card-icon"><Sparkles size={21}/></span></div>
          <div><strong>Fast charging</strong><p>Practical power accessories selected for everyday performance.</p></div>
        </Reveal>
        <Reveal as="article" delay={100}>
          <div className="value-card-top"><span className="value-card-index">02</span><span className="value-card-icon"><ShieldCheck size={21}/></span></div>
          <div><strong>Device-friendly picks</strong><p>Clear compatibility details help you choose with confidence.</p></div>
        </Reveal>
        <Reveal as="article" delay={160}>
          <div className="value-card-top"><span className="value-card-index">03</span><span className="value-card-icon"><Truck size={21}/></span></div>
          <div><strong>Cash on delivery</strong><p>Place your order simply and pay when it reaches you.</p></div>
        </Reveal>
        <Reveal as="article" delay={220}>
          <div className="value-card-top"><span className="value-card-index">04</span><span className="value-card-icon"><MessageCircle size={21}/></span></div>
          <div><strong>Direct support</strong><p>Ask about chargers or compatibility through chat and WhatsApp.</p></div>
        </Reveal>
      </div>
    </section>

    <section className="store-about-modern" id="about">
      {aboutImage ? <img className="store-about-modern-bg" src={aboutImage} alt="" loading="lazy" decoding="async"/> : <div className="store-about-modern-placeholder"><span>{store.name.charAt(0)}</span></div>}
      <div className="store-about-modern-shade"/>
      <Reveal className="store-about-modern-content" delay={60}>
        <p className="store-about-modern-kicker"><Sparkles size={14}/> About {store.name}</p>
        <h2 className="title-with-underline title-on-dark">{formatSectionTitle(store.aboutTitle || `Meet ${store.name}.`, 2)}</h2>
        <p>{store.aboutDescription || store.description || `Explore ${store.name} and order directly through our simple storefront.`}</p>
        <div className="store-about-modern-facts">
          <div><strong>Easy</strong><span>Simple checkout</span></div>
          <div><strong>COD</strong><span>Pay on delivery</span></div>
          <div><strong>{store.whatsappNumber ? 'Direct' : 'Email'}</strong><span>Personal support</span></div>
        </div>
        <div className="store-about-modern-actions">
          <Link className="btn btn-primary" href={shopHref}>Explore the collection <ArrowRight size={17}/></Link>
          {socials.length > 0 && <div className="store-socials"><span>Connect with us</span><div>{socials.map(({ key, label, Icon, href }) => <a key={key} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}><Icon size={18}/></a>)}</div></div>}
        </div>
      </Reveal>
      {aboutSecondaryImage && <div className="store-about-modern-product"><img src={aboutSecondaryImage} alt="A product from our collection" loading="lazy" decoding="async"/><span>Part of our collection</span></div>}
    </section>

    <section className="store-journey">
      <div className="store-journey-header">
        <Reveal className="store-journey-copy store-journey-copy-refined">
          <p className="home-section-kicker">From power pick to doorstep</p>
          <h2 className="title-with-underline">A simpler way to upgrade <span className="section-title-accent text-accent-glow">your everyday setup.</span></h2>
        </Reveal>
        <Reveal delay={100}><p className="store-journey-intro">Pick the right accessory, confirm it your way and receive it at your doorstep with clear support throughout.</p></Reveal>
      </div>
      <div className="store-journey-steps">
        <Reveal as="article" delay={40}>
          <div className="journey-step-meta"><span>01</span><span className="journey-step-icon"><Sparkles size={19}/></span></div>
          <div className="journey-step-copy"><strong>Choose your accessory</strong><p>Compare ports, power and compatibility before you order.</p></div>
        </Reveal>
        <Reveal as="article" delay={110}>
          <div className="journey-step-meta"><span>02</span><span className="journey-step-icon"><MessageCircle size={19}/></span></div>
          <div className="journey-step-copy"><strong>Confirm your order</strong><p>Checkout online or send the selected product through WhatsApp.</p></div>
        </Reveal>
        <Reveal as="article" delay={180}>
          <div className="journey-step-meta"><span>03</span><span className="journey-step-icon"><Truck size={19}/></span></div>
          <div className="journey-step-copy"><strong>Receive and pay</strong><p>We confirm delivery details, dispatch your order and you pay on arrival.</p></div>
        </Reveal>
      </div>
      <Reveal delay={80} className="store-journey-cta">
        <div>
          <span>Keep every device ready</span>
          <strong>Find the right <span className="section-title-accent text-accent-glow">power accessory</span> today.</strong>
          <p>Chargers, cables, cases and magnetic essentials—all in one place.</p>
        </div>
        <Link className="btn btn-primary btn-lg" href={shopHref}>Shop all accessories <ArrowRight size={17}/></Link>
      </Reveal>
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
