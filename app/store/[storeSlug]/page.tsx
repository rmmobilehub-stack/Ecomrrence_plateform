import Link from 'next/link';
import { ArrowRight, Facebook, Globe2, HeartPulse, Instagram, Mail, MapPin, MessageCircle, Music2, Phone, ShieldCheck, Sparkles, Truck, Twitter, Wrench, Youtube } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { getActiveProductsForStore, getActiveStoreBySlug } from '@/lib/db';
import type { Store } from '@/lib/types';
import ProductCard from '@/components/store/ProductCard';
import AdsBanner from '@/components/store/AdsBanner';
import HomeFeatureMarquee from '@/components/store/HomeFeatureMarquee';
import HomeJourneyStrip from '@/components/store/HomeJourneyStrip';
import LeadChatbot from '@/components/store/LeadChatbot';
import WhatsAppButton from '@/components/store/WhatsAppButton';
import Reveal from '@/components/store/Reveal';
import { calculateProductPrice } from '@/lib/pricing';
import { createWhatsAppUrl, isValidWhatsAppNumber, normalizeWhatsAppNumber } from '@/lib/whatsapp';
import { storefrontPath } from '@/lib/storefront-paths';

const DEFAULT_STOREFRONT_HERO_BANNER = '/storefront/hero-tech-accessories-banner.jpg';

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
  const featured = activeProducts.slice(0, 4);
  const shopHref = storefrontPath(store.slug, 'products');
  const phoneCheckHref = storefrontPath(store.slug, 'phone-check');
  const repairHref = storefrontPath(store.slug, 'repair');
  const checkoutHref = storefrontPath(store.slug, 'checkout');
  const aboutHref = `${storefrontPath(store.slug)}#about`;
  const title = store.heroTitle || 'Everyday pieces, picked with care.';
  const chatMessage = `Hello ${store.name}, I would like to know more about your products.`;
  const contactWidgetMode = store.contactWidgetMode ?? 'both';
  const showWhatsApp = ['whatsapp', 'both'].includes(contactWidgetMode) && isValidWhatsAppNumber(store.whatsappNumber);
  const showChatbot = ['chatbot', 'both'].includes(contactWidgetMode);
  const contactPhone = (store.contactPhone || '').trim();
  const contactEmail = (store.contactEmail || '').trim();
  const contactAddress = (store.contactAddress || '').trim();
  const hasConnectDetails = Boolean(contactPhone || contactEmail || contactAddress || isValidWhatsAppNumber(store.whatsappNumber));
  const phoneHref = contactPhone
    ? `tel:+${normalizeWhatsAppNumber(contactPhone) || contactPhone.replace(/\D/g, '')}`
    : '';
  const mapsHref = contactAddress
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(contactAddress)}&travelmode=driving`
    : '';
  const whatsappHref = isValidWhatsAppNumber(store.whatsappNumber)
    ? createWhatsAppUrl(store.whatsappNumber, chatMessage)
    : '';

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
    <section
      className="store-hero store-hero-static"
      style={{ ['--hero-banner' as string]: `url("${DEFAULT_STOREFRONT_HERO_BANNER}")` }}
    >
      <div className="store-hero-static-bg" aria-hidden />
      <div className="store-hero-shell">
        <div className="store-hero-content">
          <div className="hero-kicker-row" aria-label="Store highlights">
            {chips.map((chip) => <span key={chip} className="hero-kicker">{chip}</span>)}
          </div>
          <h1 className="store-hero-title title-with-underline">{formatHeroTitle(title)}</h1>
          <p className="store-hero-desc">
            {store.description || 'Chargers, cases, phone check and doorstep iPhone repair — in one place.'}
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary btn-lg" href={shopHref}>{store.heroCtaLabel || 'Shop collection'} <ArrowRight size={17}/></Link>
            <Link className="hero-phone-check-link" href={phoneCheckHref}><HeartPulse size={17}/><span>Phone check</span><ArrowRight size={16}/></Link>
            <Link className="hero-phone-check-link" href={repairHref}><Wrench size={17}/><span>Doorstep repair</span><ArrowRight size={16}/></Link>
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
            <p className="text-secondary">Chargers, cables and magnetic picks for everyday use.</p>
          </div>
        </Reveal>
        <Reveal delay={120}><Link className="collection-link" href={shopHref}>View all products <ArrowRight size={17}/></Link></Reveal>
      </div>
      {featured.length
        ? <div className="products-grid featured-products-grid">{featured.map((product) => <ProductCard key={product.id} product={product} slug={store.slug}/>)}</div>
        : <div className="empty-state">This store has no products yet.</div>}
    </section>

    <section className="store-values store-values-stream" aria-labelledby="store-values-title">
      <Reveal className="store-values-intro store-values-intro-refined">
          <p className="home-section-kicker">Power & protection</p>
          <h2 id="store-values-title" className="title-with-underline">Everything your iPhone needs, <span className="section-title-accent text-accent-glow">in one place.</span></h2>
          <p>Accessories, phone check and doorstep repair — with clear details and cash on delivery.</p>
      </Reveal>
      <HomeFeatureMarquee
        items={[
          { title: 'Fast charging', blurb: 'Power that keeps up', href: shopHref, icon: 'sparkles' },
          { title: 'Clear compatibility', blurb: 'Know what fits first', href: shopHref, icon: 'shield' },
          { title: 'Cash on delivery', blurb: 'Pay when it arrives', href: checkoutHref, icon: 'truck' },
          {
            title: 'Direct support',
            blurb: 'Chat when you need help',
            href: whatsappHref || aboutHref,
            external: Boolean(whatsappHref),
            icon: 'message',
          },
          { title: 'Phone check', blurb: 'Score before you buy or sell', href: storefrontPath(store.slug, 'phone-check'), icon: 'sparkles' },
          { title: 'Doorstep repair', blurb: 'We come to your address', href: repairHref, icon: 'shield' },
        ]}
      />
    </section>

    <section className="store-about-modern" id="about">
      {aboutImage ? <img className="store-about-modern-bg" src={aboutImage} alt="" loading="lazy" decoding="async"/> : <div className="store-about-modern-placeholder"><span>{store.name.charAt(0)}</span></div>}
      <div className="store-about-modern-shade"/>
      <Reveal className="store-about-modern-content" delay={60}>
        <p className="store-about-modern-kicker"><Sparkles size={14}/> About {store.name}</p>
        <h2 className="title-with-underline title-on-dark">{formatSectionTitle(store.aboutTitle || `Meet ${store.name}.`, 2)}</h2>
        <p>{store.aboutDescription || store.description || `Accessories, phone check and doorstep repair from ${store.name}.`}</p>
        <div className="store-about-modern-facts">
          <div><strong>Easy</strong><span>Simple checkout</span></div>
          <div><strong>COD</strong><span>Pay on delivery</span></div>
          <div><strong>{store.whatsappNumber || store.contactPhone ? 'Direct' : 'Email'}</strong><span>Personal support</span></div>
        </div>
        <div className="store-about-connect">
          <p className="store-about-connect-title">Connect with us</p>
          <p className="store-about-connect-hint">Accessories, phone check or doorstep repair.</p>
          {hasConnectDetails ? (
            <div className="store-about-contact store-about-contact-actions">
              {contactPhone && phoneHref ? (
                <a className="store-about-contact-row" href={phoneHref}>
                  <span className="store-about-contact-icon"><Phone size={17}/></span>
                  <span><em>Call our team</em></span>
                </a>
              ) : null}
              {contactEmail ? (
                <a className="store-about-contact-row" href={`mailto:${contactEmail}`}>
                  <span className="store-about-contact-icon"><Mail size={17}/></span>
                  <span><em>Send us an email</em></span>
                </a>
              ) : null}
              {contactAddress && mapsHref ? (
                <a className="store-about-contact-row" href={mapsHref} target="_blank" rel="noreferrer">
                  <span className="store-about-contact-icon"><MapPin size={17}/></span>
                  <span><em>Get directions to our store</em></span>
                </a>
              ) : null}
              {whatsappHref ? (
                <a className="store-about-contact-row is-whatsapp" href={whatsappHref} rel="noreferrer">
                  <span className="store-about-contact-icon"><MessageCircle size={17}/></span>
                  <span><em>Chat with us on WhatsApp</em></span>
                </a>
              ) : null}
            </div>
          ) : null}
          {socials.length > 0 ? (
            <div className="store-socials store-about-socials">
              <span>Social</span>
              <div>{socials.map(({ key, label, Icon, href }) => <a key={key} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}><Icon size={18}/></a>)}</div>
            </div>
          ) : null}
        </div>
        <div className="store-about-modern-actions">
          <Link className="btn btn-primary" href={shopHref}>Explore the collection <ArrowRight size={17}/></Link>
          <Link className="btn btn-secondary" href={repairHref}>Book repair <ArrowRight size={17}/></Link>
        </div>
      </Reveal>
      {aboutSecondaryImage && <div className="store-about-modern-product"><img src={aboutSecondaryImage} alt="A product from our collection" loading="lazy" decoding="async"/><span>Part of our collection</span></div>}
    </section>

    <section className="store-journey store-journey-stream">
      <div className="store-journey-header">
        <Reveal className="store-journey-copy store-journey-copy-refined">
          <p className="home-section-kicker">How it works</p>
          <h2 className="title-with-underline">Shop, check or repair — <span className="section-title-accent text-accent-glow">simple steps.</span></h2>
        </Reveal>
        <Reveal delay={100}><p className="store-journey-intro">Pick what you need, confirm online or on WhatsApp, and get help at your door when you need a repair.</p></Reveal>
      </div>
      <Reveal delay={60}>
        <HomeJourneyStrip
          steps={[
            { step: '01', title: 'Choose', blurb: 'Browse accessories or start phone check / repair.', href: shopHref, icon: 'choose' },
            { step: '02', title: 'Confirm', blurb: 'Checkout online or message us on WhatsApp.', href: checkoutHref, icon: 'confirm' },
            { step: '03', title: 'Receive', blurb: 'COD delivery, or doorstep repair at your address.', href: repairHref, icon: 'receive' },
          ]}
        />
      </Reveal>
      <Reveal delay={80} className="store-journey-cta">
        <div>
          <span>Doorstep iPhone repair</span>
          <strong>Need a <span className="section-title-accent text-accent-glow">repair</span> today?</strong>
          <p>Book a visit — we repair on the spot at your address.</p>
        </div>
        <div className="store-journey-cta-actions">
          <Link className="btn btn-primary btn-lg" href={repairHref}>Book repair <ArrowRight size={17}/></Link>
          <Link className="btn btn-secondary btn-lg" href={shopHref}>Shop accessories <ArrowRight size={17}/></Link>
        </div>
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
