'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'article' | 'li';
};

function shouldReveal(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  const viewH = window.innerHeight || document.documentElement.clientHeight;
  // Visible now, almost visible, or already scrolled past.
  return rect.top < viewH * 0.92 || rect.bottom < viewH * 0.55;
}

export default function Reveal({ children, className = '', delay = 0, as = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const Tag = as;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || shouldReveal(node)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting || shouldReveal(node)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: [0, 0.12, 0.2], rootMargin: '12% 0px 8% 0px' },
    );
    observer.observe(node);

    const onScroll = () => {
      if (shouldReveal(node)) {
        setVisible(true);
        observer.disconnect();
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const fallback = window.setTimeout(() => setVisible(true), 2400);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`reveal-on-scroll ${visible ? 'is-revealed' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
