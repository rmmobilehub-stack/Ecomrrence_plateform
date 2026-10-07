'use client';

import { useMemo } from 'react';
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

  if (!activeAds.length) return null;

  // Show first active ad only — no auto-rotate.
  const current = activeAds[0];
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
      </div>
    </section>
  );
}
