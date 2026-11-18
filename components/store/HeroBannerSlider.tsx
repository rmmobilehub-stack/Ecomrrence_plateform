'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroBannerSlider({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = active % images.length;
  useEffect(() => {
    if (paused || images.length < 2) return;
    const timer = window.setTimeout(() => setActive(value => (value + 1) % images.length), 4500);
    return () => window.clearTimeout(timer);
  }, [active, images.length, paused]);
  if (!images.length) return null;
  return <>
    <div className="hero-banner-images" aria-hidden="true">
      {images.map((image, index) => <div key={image}
        className={`store-hero-static-bg hero-banner-image ${index === current ? 'is-active' : ''}`}
        style={{ '--hero-banner': `url("${image.replace(/"/g, '%22')}")` } as CSSProperties} />)}
    </div>
    {images.length > 1 && <div className="hero-banner-controls" role="group" aria-label="Banner slideshow"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false); }}>
      <button type="button" aria-label="Previous banner" onClick={() => setActive(value => (value - 1 + images.length) % images.length)}><ChevronLeft size={19} /></button>
      <button type="button" aria-label="Next banner" onClick={() => setActive(value => (value + 1) % images.length)}><ChevronRight size={19} /></button>
    </div>}
  </>;
}
