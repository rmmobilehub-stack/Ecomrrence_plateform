'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { MessageCircle, Sparkles, Truck } from 'lucide-react';

export type HomeJourneyStep = {
  step: string;
  title: string;
  blurb: string;
  href: string;
  icon?: 'choose' | 'confirm' | 'receive';
};

const ICONS: Record<NonNullable<HomeJourneyStep['icon']>, LucideIcon> = {
  choose: Sparkles,
  confirm: MessageCircle,
  receive: Truck,
};

export default function HomeJourneyStrip({ steps }: { steps: HomeJourneyStep[] }) {
  return (
    <ol className="home-journey-rail" aria-label="How it works">
      <span className="home-journey-rail-line" aria-hidden />
      {steps.map((item, index) => {
        const Icon = ICONS[item.icon ?? (index === 0 ? 'choose' : index === 1 ? 'confirm' : 'receive')];
        return (
          <li key={item.title} className="home-journey-rail-step">
            <Link className="home-journey-rail-card" href={item.href}>
              <span className="home-journey-rail-mark" aria-hidden>
                <span className="home-journey-rail-dot" />
              </span>
              <span className="home-journey-rail-watermark" aria-hidden>
                {item.step}
              </span>
              <span className="home-journey-rail-icon" aria-hidden>
                <Icon size={20} />
              </span>
              <strong className="home-journey-rail-title">{item.title}</strong>
              <em className="home-journey-rail-blurb">{item.blurb}</em>
              <span className="home-journey-rail-go" aria-hidden>
                Continue →
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
