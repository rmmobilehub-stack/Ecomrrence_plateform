'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import { MessageCircle, ShieldCheck, Sparkles, Truck } from 'lucide-react';

export type HomeFeatureItem = {
  title: string;
  blurb: string;
  href: string;
  external?: boolean;
  icon: 'sparkles' | 'shield' | 'truck' | 'message';
};

const ICONS: Record<HomeFeatureItem['icon'], LucideIcon> = {
  sparkles: Sparkles,
  shield: ShieldCheck,
  truck: Truck,
  message: MessageCircle,
};

export default function HomeFeatureMarquee({ items }: { items: HomeFeatureItem[] }) {
  const loop = [...items, ...items, ...items];
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const pausedUntil = useRef(0);
  const interacting = useRef(false);
  const drag = useRef<{ x: number; scroll: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    const element = viewport.current;
    if (!element || !items.length) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame: number;
    let previous = 0;
    // Preserve subpixel motion even in browsers that round scrollLeft.
    let position = element.scrollLeft;
    const animate = (now: number) => {
      const elapsed = Math.min(now - (previous || now), 64);
      previous = now;
      const first = track.current?.children[0] as HTMLElement | undefined;
      const next = track.current?.children[items.length] as HTMLElement | undefined;
      const segment = first && next ? next.offsetLeft - first.offsetLeft : 0;
      if (segment && !reducedMotion.matches && !interacting.current && !document.hidden && now >= pausedUntil.current) {
        position = (position + elapsed * 0.044) % segment;
        element.scrollLeft = position;
      } else {
        position = element.scrollLeft;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [items.length]);
  const pauseAuto = () => { pausedUntil.current = performance.now() + 5000; };

  return (
    <div ref={viewport} className="home-feature-marquee" aria-label="Store highlights"
      onMouseEnter={() => { interacting.current = true; }}
      onMouseLeave={() => { if (!drag.current) interacting.current = false; pauseAuto(); }}
      onFocusCapture={() => { interacting.current = true; }}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) { interacting.current = false; pauseAuto(); } }}
      onTouchStart={() => { interacting.current = true; }}
      onTouchEnd={() => { interacting.current = false; pauseAuto(); }}
      onTouchCancel={() => { interacting.current = false; pauseAuto(); }}
      onWheel={pauseAuto}
      onDragStart={event => event.preventDefault()}
      onPointerDown={event => {
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        suppressClick.current = false;
        drag.current = { x: event.clientX, scroll: event.currentTarget.scrollLeft, moved: false };
      }}
      onPointerMove={event => {
        if (!drag.current) return;
        const distance = event.clientX - drag.current.x;
        if (Math.abs(distance) > 5) {
          drag.current.moved = true;
          event.currentTarget.setPointerCapture(event.pointerId);
        }
        if (drag.current.moved) event.currentTarget.scrollLeft = drag.current.scroll - distance;
      }}
      onPointerUp={event => {
        suppressClick.current = Boolean(drag.current?.moved);
        drag.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        interacting.current = event.pointerType === 'mouse' && event.currentTarget.matches(':hover');
        pauseAuto();
      }}
      onPointerCancel={() => { drag.current = null; interacting.current = false; pauseAuto(); }}
      onClickCapture={event => {
        if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; }
      }}
    >
      <div ref={track} className="home-feature-marquee-track">
        {loop.map((item, index) => {
          const Icon = ICONS[item.icon];
          const key = `${item.title}-${index}`;
          const body = (
            <>
              <span className="home-feature-chip-icon" aria-hidden>
                <Icon size={22} />
              </span>
              <span className="home-feature-chip-copy">
                <strong>{item.title}</strong>
                <em>{item.blurb}</em>
              </span>
              <span className="home-feature-chip-arrow" aria-hidden>
                →
              </span>
            </>
          );

          if (item.external) {
            return (
              <a key={key} className="home-feature-chip" href={item.href} rel="noreferrer">
                {body}
              </a>
            );
          }

          return (
            <Link key={key} className="home-feature-chip" href={item.href}>
              {body}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
