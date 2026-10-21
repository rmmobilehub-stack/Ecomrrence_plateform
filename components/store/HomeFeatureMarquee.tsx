'use client';

import Link from 'next/link';
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

  return (
    <div className="home-feature-marquee" aria-label="Store highlights">
      <div className="home-feature-marquee-track">
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
