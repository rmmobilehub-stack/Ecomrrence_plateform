'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';

export type HeroSlide = { src: string; label: string; href: string; mode?: 'product' | 'campaign' };

export default function HeroProductSlider({ slides, storeName }: { slides: HeroSlide[]; storeName: string }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive((current) => Math.min(current, Math.max(slides.length - 1, 0)));
    if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 4500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) {
    return <div className="hero-showcase hero-showcase-empty" aria-label={`${storeName} collection`}>
      <div className="hero-showcase-empty-mark"><Sparkles size={34}/></div>
      <span>Fresh finds</span><strong>Your next favourite is waiting.</strong>
    </div>;
  }

  const previous = () => setActive((current) => (current - 1 + slides.length) % slides.length);
  const next = () => setActive((current) => (current + 1) % slides.length);

  return <div className="hero-showcase" aria-roledescription="carousel" aria-label={`${storeName} featured products`}>
    {slides.map((slide, index) => <Link
      key={`${slide.src}-${index}`}
      href={slide.href}
      className={`hero-slide hero-slide-${slide.mode || 'product'}-mode ${index === active ? 'active' : ''}`}
      aria-hidden={index !== active}
      aria-label={slide.label}
      tabIndex={index === active ? 0 : -1}
      style={{ '--hero-image': `url("${slide.src.replace(/"/g, '%22')}")` } as CSSProperties}
    />)}
    {slides.length > 1 && <>
      <div className="hero-slider-ui">
        <div className="hero-slider-dots" aria-hidden="true">{slides.map((_, index) => <span key={index} className={index === active ? 'active' : ''}/>)}</div>
        <div className="hero-slider-controls">
          <button type="button" onClick={previous} aria-label="Previous featured product"><ArrowLeft size={17}/></button>
          <button type="button" onClick={next} aria-label="Next featured product"><ArrowRight size={17}/></button>
        </div>
      </div>
    </>}
  </div>;
}
