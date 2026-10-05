'use client';

import { ImagePlus, Link2, LoaderCircle, Megaphone, Trash2, Video } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import type { StoreAd } from '@/lib/types';
import { useAdminStore } from '@/components/admin/useAdminStore';

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `ad-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function detectType(url: string): 'image' | 'video' {
  const value = url.toLowerCase();
  if (
    value.includes('youtube.com') ||
    value.includes('youtu.be') ||
    value.includes('vimeo.com') ||
    /\.(mp4|webm|ogg|mov)(\?|$)/.test(value)
  ) {
    return 'video';
  }
  return 'image';
}

export default function AdsManager() {
  const store = useAdminStore();
  const fileInput = useRef<HTMLInputElement>(null);
  const formId = useId();
  const [ads, setAds] = useState<StoreAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    mediaUrl: '',
    linkUrl: '',
    type: 'image' as 'image' | 'video',
    isActive: true,
  });

  useEffect(() => {
    fetch('/api/admin/store')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        setAds(Array.isArray(data?.store?.ads) ? data.store.ads : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = async (nextAds: StoreAd[]) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/admin/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ads: nextAds }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Could not save ads');
      setAds(Array.isArray(data.store?.ads) ? data.store.ads : nextAds);
      setMessage('Ads saved. Active banners appear on your storefront.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save ads');
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError('');
    const body = new FormData();
    body.append('files', files[0]);
    try {
      const response = await fetch('/api/upload', { method: 'POST', body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Upload failed');
      const url = data.urls?.[0] ?? '';
      if (url) setForm((current) => ({ ...current, mediaUrl: url, type: 'image' }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const addAd = async (event: React.FormEvent) => {
    event.preventDefault();
    const mediaUrl = form.mediaUrl.trim();
    if (!mediaUrl) {
      setError('Add an image/video link or upload an image.');
      return;
    }
    const next: StoreAd = {
      id: createId(),
      title: form.title.trim() || 'Store promotion',
      mediaUrl,
      linkUrl: form.linkUrl.trim(),
      type: form.type === 'video' ? 'video' : detectType(mediaUrl),
      isActive: form.isActive,
      createdAt: new Date().toISOString(),
    };
    const nextAds = [next, ...ads].slice(0, 12);
    await persist(nextAds);
    setForm({ title: '', mediaUrl: '', linkUrl: '', type: 'image', isActive: true });
  };

  if (loading) {
    return <div className="glass-card empty-state">Loading ads…</div>;
  }

  return (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">STOREFRONT PROMOTIONS</p>
          <h1 className="page-title">Ads</h1>
          <p className="page-subtitle">
            Add image or video banners for {store?.name ?? 'your store'}. Use an uploaded picture or paste any image, MP4, YouTube or Vimeo link.
          </p>
        </div>
      </div>

      <form className="glass-card ads-admin-form" onSubmit={(event) => void addAd(event)}>
        <div className="ads-admin-form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor={`${formId}-title`}>Title</label>
            <input
              id={`${formId}-title`}
              className="form-input"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Summer sale / New arrivals"
              maxLength={120}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor={`${formId}-type`}>Media type</label>
            <select
              id={`${formId}-type`}
              className="form-select"
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value as 'image' | 'video' })}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div className="form-group ads-admin-span">
            <label className="form-label" htmlFor={`${formId}-media`}>Media URL</label>
            <div className="ads-admin-media-row">
              <input
                id={`${formId}-media`}
                className="form-input"
                value={form.mediaUrl}
                onChange={(event) => {
                  const mediaUrl = event.target.value;
                  setForm({ ...form, mediaUrl, type: detectType(mediaUrl) });
                }}
                placeholder="https://… image, mp4, YouTube or Vimeo"
                required
              />
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                hidden
                onChange={(event) => void uploadImage(event.target.files)}
              />
              <button
                type="button"
                className="btn btn-secondary"
                disabled={uploading}
                onClick={() => fileInput.current?.click()}
              >
                {uploading ? <LoaderCircle className="spin" size={16} /> : <ImagePlus size={16} />}
                {uploading ? 'Uploading…' : 'Upload image'}
              </button>
            </div>
          </div>
          <div className="form-group ads-admin-span">
            <label className="form-label" htmlFor={`${formId}-link`}>Click link (optional)</label>
            <input
              id={`${formId}-link`}
              className="form-input"
              value={form.linkUrl}
              onChange={(event) => setForm({ ...form, linkUrl: event.target.value })}
              placeholder="https://… where the banner should open"
            />
          </div>
          <label className="ads-admin-toggle">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
            />
            Show on storefront
          </label>
        </div>
        <div className="ads-admin-actions">
          <button className="btn btn-primary" disabled={saving || uploading}>
            <Megaphone size={16} />
            {saving ? 'Saving…' : 'Add ad'}
          </button>
          {message && <p className="form-success">{message}</p>}
          {error && <p className="form-error">{error}</p>}
        </div>
      </form>

      <div className="ads-admin-list">
        {ads.length === 0 ? (
          <div className="glass-card empty-state">No ads yet. Add your first banner above.</div>
        ) : (
          ads.map((ad) => (
            <article className="glass-card ads-admin-card" key={ad.id}>
              <div className="ads-admin-preview">
                {ad.type === 'video' ? (
                  <div className="ads-admin-video-fallback"><Video size={22} /><span>Video ad</span></div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ad.mediaUrl} alt={ad.title || 'Ad preview'} />
                )}
              </div>
              <div className="ads-admin-card-body">
                <div>
                  <strong>{ad.title || 'Untitled ad'}</strong>
                  <small>{ad.type === 'video' ? 'Video' : 'Image'}{ad.linkUrl ? ' · linked' : ''}</small>
                </div>
                <p className="ads-admin-url"><Link2 size={14} />{ad.mediaUrl}</p>
                <div className="ads-admin-card-actions">
                  <span className={`badge badge-${ad.isActive ? 'success' : 'muted'}`}>
                    {ad.isActive ? 'active' : 'hidden'}
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={saving}
                    onClick={() => void persist(ads.map((item) => item.id === ad.id ? { ...item, isActive: !item.isActive } : item))}
                  >
                    {ad.isActive ? 'Hide' : 'Show'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    disabled={saving}
                    onClick={() => {
                      if (confirm('Delete this ad?')) void persist(ads.filter((item) => item.id !== ad.id));
                    }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </>
  );
}
