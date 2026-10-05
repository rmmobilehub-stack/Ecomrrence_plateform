'use client';

import { useEffect, useMemo, useState } from 'react';
import type { StoreAd } from '@/lib/types';

function safeHttpUrl(value?: string) {
  if (!value) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return value.startsWith('/') ? value : '';
  }
}

function youtubeId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) return parsed.pathname.replace('/', '') || null;
    if (parsed.hostname.includes('youtube.com')) {
      return parsed.searchParams.get('v') || parsed.pathname.split('/embed/')[1]?.split('/')[0] || null;
    }
  } catch {
    return null;
  }
  return null;
}

function vimeoId(url: string) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('vimeo.com')) return null;
    const match = parsed.pathname.match(/\/(\d+)/);
    return match?.[1] || null;
  } catch {
    return null;
  }
}

function embedSrc(url: string) {
  const yt = youtubeId(url);
  if (yt) return `https://www.youtube.com/embed/${yt}?rel=0&modestbranding=1&playsinline=1`;
  const vimeo = vimeoId(url);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo}?title=0&byline=0&portrait=0`;
  return '';
}

function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

function AdMedia({ ad }: { ad: StoreAd }) {
  const mediaUrl = safeHttpUrl(ad.mediaUrl);
  if (!mediaUrl) return null;

  if (ad.type === 'video' || isDirectVideo(mediaUrl) || embedSrc(mediaUrl)) {
    const embed = embedSrc(mediaUrl);
    if (embed) {
      return (
        <iframe
          className="store-ads-media"
          src={embed}
          title={ad.title || 'Store ad'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      );
    }
    if (isDirectVideo(mediaUrl) || ad.type === 'video') {
      return (
        <video className="store-ads-media" src={mediaUrl} controls playsInline preload="metadata" />
      );
    }
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img className="store-ads-media" src={mediaUrl} alt={ad.title || 'Store promotion'} loading="lazy" decoding="async" />;
}

export default function AdsBanner({ ads }: { ads?: StoreAd[] }) {
  const activeAds = useMemo(
    () => (ads ?? []).filter((ad) => ad.isActive && safeHttpUrl(ad.mediaUrl)),
    [ads]
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (activeAds.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % activeAds.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [activeAds.length]);

  useEffect(() => {
    if (index >= activeAds.length) setIndex(0);
  }, [activeAds.length, index]);

  if (!activeAds.length) return null;

  const current = activeAds[Math.min(index, activeAds.length - 1)];
  const link = safeHttpUrl(current.linkUrl);
  const mediaUrl = safeHttpUrl(current.mediaUrl);
  const isVideo = current.type === 'video' || isDirectVideo(mediaUrl) || Boolean(embedSrc(mediaUrl));
  const media = <AdMedia ad={current} />;

  return (
    <section className="store-ads-banner" aria-label="Store promotions">
      <div className="store-ads-shell">
        <div className="store-ads-frame">
          {!isVideo && link ? (
            <a className="store-ads-link" href={link} target="_blank" rel="noreferrer" aria-label={current.title || 'Open promotion'}>
              {media}
            </a>
          ) : (
            media
          )}
          {(current.title || (isVideo && link)) && (
            <div className="store-ads-caption">
              {current.title && <span>{current.title}</span>}
              {isVideo && link && (
                <a href={link} target="_blank" rel="noreferrer" className="store-ads-cta">
                  Learn more
                </a>
              )}
            </div>
          )}
        </div>
        {activeAds.length > 1 && (
          <div className="store-ads-dots" role="tablist" aria-label="Ad slides">
            {activeAds.map((ad, adIndex) => (
              <button
                key={ad.id}
                type="button"
                role="tab"
                aria-selected={adIndex === index}
                aria-label={`Show ad ${adIndex + 1}`}
                className={adIndex === index ? 'is-active' : undefined}
                onClick={() => setIndex(adIndex)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
