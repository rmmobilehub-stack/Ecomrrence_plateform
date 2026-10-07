'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';

export type HeroSlide = { src: string; label: string; href: string; mode?: 'product' | 'campaign' };

const AUTOPLAY_MS = 3500;

/** Prefer sharp local PNG heroes over heavily compressed seed webps. */
function resolveHeroSrc(src: string) {
  if (src.startsWith('/storefront/') && src.endsWith('.webp')) return src.replace(/\.webp$/, '.png');
  return src;
}

export default function HeroProductSlider({ slides, storeName }: { slides: HeroSlide[]; storeName: string }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive((current) => Math.min(current, Math.max(slides.length - 1, 0)));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) {
    return (
      <div className="hero-showcase hero-showcase-empty" aria-label={`${storeName} collection`}>
        <div className="hero-showcase-empty-mark"><Sparkles size={34} /></div>
        <span>Fresh finds</span>
        <strong>Your next favourite is waiting.</strong>
      </div>
    );
  }

  return (
    <div
      className="hero-showcase"
      aria-roledescription="carousel"
      aria-label={`${storeName} featured products`}
    >
      {slides.map((slide, index) => (
        <Link
          key={`${slide.src}-${index}`}
          href={slide.href}
          className={`hero-slide hero-slide-${slide.mode || 'product'}-mode ${index === active ? 'active' : ''}`}
          aria-hidden={index !== active}
          aria-label={slide.label}
          tabIndex={index === active ? 0 : -1}
          style={{ '--hero-image': `url("${resolveHeroSrc(slide.src).replace(/"/g, '%22')}")` } as CSSProperties}
        />
      ))}
    </div>
  );
}
