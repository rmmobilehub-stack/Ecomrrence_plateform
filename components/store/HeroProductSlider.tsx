'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

export type HeroSlide = { src: string; label: string; href: string; mode?: 'product' | 'campaign' };

const AUTOPLAY_MS = 5200;

/** Prefer sharp local PNG heroes over heavily compressed seed webps. */
function resolveHeroSrc(src: string) {
  if (src.startsWith('/storefront/') && src.endsWith('.webp')) return src.replace(/\.webp$/, '.png');
  return src;
}

export default function HeroProductSlider({ slides, storeName }: { slides: HeroSlide[]; storeName: string }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setActive((current) => Math.min(current, Math.max(slides.length - 1, 0)));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2 || paused || reduceMotion.current) return;
    setProgressKey((key) => key + 1);
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [slides.length, paused, active]);

  if (!slides.length) {
    return (
      <div className="hero-showcase hero-showcase-empty" aria-label={`${storeName} collection`}>
        <div className="hero-showcase-empty-mark"><Sparkles size={34} /></div>
        <span>Fresh finds</span>
        <strong>Your next favourite is waiting.</strong>
      </div>
    );
  }

  const previous = () => setActive((current) => (current - 1 + slides.length) % slides.length);
  const next = () => setActive((current) => (current + 1) % slides.length);
  const goTo = (index: number) => setActive(index);

  return (
    <div
      className="hero-showcase"
      aria-roledescription="carousel"
      aria-label={`${storeName} featured products`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
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

      {slides.length > 1 && (
        <div className="hero-slider-ui">
          {!reduceMotion.current && (
            <span className="hero-slider-progress" aria-hidden="true">
              <span key={progressKey} className={paused ? 'is-paused' : ''} style={{ animationDuration: `${AUTOPLAY_MS}ms` }} />
            </span>
          )}
          <div className="hero-slider-dots" role="tablist" aria-label="Featured slides">
            {slides.map((slide, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-label={`Show ${slide.label}`}
                aria-selected={index === active}
                className={index === active ? 'active' : ''}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
          <div className="hero-slider-controls">
            <button type="button" onClick={previous} aria-label="Previous featured product"><ArrowLeft size={17} /></button>
            <button type="button" onClick={next} aria-label="Next featured product"><ArrowRight size={17} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
