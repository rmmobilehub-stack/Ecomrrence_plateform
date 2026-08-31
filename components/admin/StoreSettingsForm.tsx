'use client';

import { useEffect, useState } from 'react';
import ImageUpload from './ImageUpload';

type StoreData = {
  name: string; slug: string; description: string; logo: string; banner: string;
  heroSlides: string[]; heroTitle?: string; heroCtaLabel?: string; announcement?: string;
  aboutTitle?: string; aboutDescription?: string; aboutImage?: string;
  primaryColor: string; currency: string; contactEmail: string; whatsappNumber?: string;
  contactWidgetMode?: 'chatbot' | 'whatsapp' | 'both' | 'none';
  deliveryFee?: number; freeDeliveryThreshold?: number; isActive?: boolean;
  socialLinks: {
    instagram?: string; facebook?: string; twitter?: string; tiktok?: string;
    youtube?: string; website?: string;
  };
};

type Props = { brandOnly?: boolean; complete?: boolean; endpoint?: string };

export default function StoreSettingsForm({ brandOnly = false, complete = false, endpoint = '/api/admin/store' }: Props) {
  const [store, setStore] = useState<StoreData | null>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(endpoint)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? 'Could not load store settings.');
        setStore({ ...data.store, heroSlides: data.store.heroSlides ?? [], socialLinks: data.store.socialLinks ?? {}, contactWidgetMode: data.store.contactWidgetMode ?? 'both' });
      })
      .catch((error: Error) => setMessage(error.message));
  }, [endpoint]);

  if (!store) return <>{message && <p className="form-error">{message}</p>}<div className="skeleton" style={{ height: 280 }}/></>;

  const field = (key: keyof StoreData, label: string, type = 'text', placeholder?: string) => <label className="form-group">
    <span className="form-label">{label}</span>
    <input className="form-input" type={type} placeholder={placeholder} value={String(store[key] ?? '')} onChange={(event) => setStore({ ...store, [key]: event.target.value })}/>
  </label>;

  const socialField = (key: keyof StoreData['socialLinks'], label: string, placeholder: string) => <label className="form-group">
    <span className="form-label">{label}</span>
    <input className="form-input" type="url" placeholder={placeholder} value={store.socialLinks[key] ?? ''} onChange={(event) => setStore({ ...store, socialLinks: { ...store.socialLinks, [key]: event.target.value } })}/>
  </label>;

  const numberField = (key: 'deliveryFee' | 'freeDeliveryThreshold', label: string, hint: string) => <label className="form-group">
    <span className="form-label">{label}</span>
    <input className="form-input" type="number" min="0" step="0.01" value={store[key] ?? 0} onChange={(event) => setStore({ ...store, [key]: Number(event.target.value) })}/>
    <small className="form-hint">{hint}</small>
  </label>;

  const businessPanel = <section className="glass-card form-panel">
    <h2>Business information</h2>
    <p className="form-hint brand-settings-hint">Public contact, delivery and social media details for this storefront.</p>
    <div className="grid-2">{field('name', 'Store name')}{field('slug', 'Store URL slug')}</div>
    <div className="grid-2">{field('contactEmail', 'Contact email', 'email')}{field('whatsappNumber', 'WhatsApp order number', 'tel', '923001234567')}</div>
    <p className="form-hint">Use international format without + or spaces. Once saved, the tracked WhatsApp order button appears on every product page.</p>
    <label className="form-group"><span className="form-label">Homepage contact buttons</span><select className="form-select" value={store.contactWidgetMode ?? 'both'} onChange={(event) => setStore({ ...store, contactWidgetMode: event.target.value as StoreData['contactWidgetMode'] })}><option value="chatbot">Chatbot only</option><option value="whatsapp">WhatsApp only</option><option value="both">Chatbot and WhatsApp</option><option value="none">Hide both</option></select><small className="form-hint">WhatsApp appears only when a valid WhatsApp order number is saved.</small></label>
    <h3 className="settings-section-title">Delivery offer</h3>
    <div className="grid-2">{numberField('deliveryFee', 'Delivery fee', 'Set 0 for always free delivery.')}{numberField('freeDeliveryThreshold', 'Free delivery above', 'Set 0 to disable the threshold offer.')}</div>
    <div className="grid-2">
      <label className="form-group"><span className="form-label">Currency</span><select className="form-select" value={store.currency} onChange={(event) => setStore({ ...store, currency: event.target.value })}><option>USD</option><option>PKR</option><option>EUR</option><option>GBP</option></select></label>
      {complete && <label className="form-group status-toggle-card"><span><strong>Store status</strong><small>Customers can open this storefront</small></span><input type="checkbox" checked={store.isActive !== false} onChange={(event) => setStore({ ...store, isActive: event.target.checked })}/></label>}
    </div>
    <h3 className="settings-section-title">Social media</h3>
    <div className="grid-3 social-settings-grid">
      {socialField('instagram', 'Instagram URL', 'https://instagram.com/yourbrand')}
      {socialField('facebook', 'Facebook URL', 'https://facebook.com/yourbrand')}
      {socialField('tiktok', 'TikTok URL', 'https://tiktok.com/@yourbrand')}
      {socialField('youtube', 'YouTube URL', 'https://youtube.com/@yourbrand')}
      {socialField('twitter', 'X / Twitter URL', 'https://x.com/yourbrand')}
      {socialField('website', 'Website URL', 'https://yourbrand.com')}
    </div>
  </section>;

  const brandPanel = <section className="glass-card form-panel">
    <h2>Storefront content & design</h2>
    <p className="form-hint brand-settings-hint">Control the public hero slider, About section and brand styling.</p>
    <div className="grid-2">{brandOnly && field('name', 'Store name')}{field('primaryColor', 'Accent color', 'color')}</div>
    <label className="form-group"><span className="form-label">Short brand description</span><textarea className="form-input form-textarea" value={store.description} onChange={(event) => setStore({ ...store, description: event.target.value })}/></label>
    <div className="grid-2">{field('heroTitle', 'Hero headline', 'text', 'A brighter way to shop.')}{field('heroCtaLabel', 'Primary button label', 'text', 'Explore collection')}</div>
    {field('announcement', 'Header announcement', 'text', 'Cash on delivery')}
    <div className="grid-2">
      <div><label className="form-label">Store logo</label><ImageUpload images={store.logo ? [store.logo] : []} onChange={(images) => setStore({ ...store, logo: images[0] ?? '' })}/></div>
      <div><label className="form-label">Fallback hero image</label><ImageUpload images={store.banner ? [store.banner] : []} onChange={(images) => setStore({ ...store, banner: images[0] ?? '' })}/></div>
    </div>
    <div className="settings-media-block"><label className="form-label">Hero slider images</label><p className="form-hint">Upload multiple campaign images. When empty, active product images rotate automatically.</p><ImageUpload images={store.heroSlides} onChange={(heroSlides) => setStore({ ...store, heroSlides })}/></div>
    <h3 className="settings-section-title">About your business</h3>
    {field('aboutTitle', 'About heading', 'text', 'Thoughtfully selected for everyday life.')}
    <label className="form-group"><span className="form-label">Business story</span><textarea className="form-input form-textarea about-editor" placeholder="Tell customers what your business stands for, what you sell and why they should choose you." value={store.aboutDescription ?? ''} onChange={(event) => setStore({ ...store, aboutDescription: event.target.value })}/></label>
    <div className="settings-media-block"><label className="form-label">About section image</label><ImageUpload images={store.aboutImage ? [store.aboutImage] : []} onChange={(images) => setStore({ ...store, aboutImage: images[0] ?? '' })}/></div>
  </section>;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage('');
    try {
      const response = await fetch(endpoint, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(store) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Could not save.');
      setStore({ ...data.store, heroSlides: data.store.heroSlides ?? [], socialLinks: data.store.socialLinks ?? {}, contactWidgetMode: data.store.contactWidgetMode ?? 'both' });
      setMessage('Saved successfully.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save.'); }
    finally { setSaving(false); }
  };

  return <form className="editor-form storefront-editor" onSubmit={submit}>
    {complete ? <>{businessPanel}{brandPanel}</> : brandOnly ? brandPanel : businessPanel}
    {message && <p className={message === 'Saved successfully.' ? 'text-success' : 'form-error'}>{message}</p>}
    <div className="editor-actions"><button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</button></div>
  </form>;
}
