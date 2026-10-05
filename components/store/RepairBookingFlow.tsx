'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Phone, ShieldCheck, Smartphone, Wrench } from 'lucide-react';
import type { RepairIssue, RepairModel } from '@/lib/iphone-repair-catalog';
import { createWhatsAppUrl, isValidWhatsAppNumber } from '@/lib/whatsapp';
import { WhatsAppMark } from '@/components/store/WhatsAppButton';

const DoorstepLocationPicker = dynamic(() => import('@/components/store/DoorstepLocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="repair-address-map">
      <div className="repair-address-field">
        <span>Doorstep address</span>
        <textarea className="form-input" rows={4} disabled placeholder="Loading map…" />
      </div>
      <div className="repair-map-pane" style={{ height: 240 }} />
    </div>
  ),
});

type SimOption = { id: string; name: string; description: string };
type Preview = { modelName: string; colorName: string; colorHex: string };
type RepairBrandId = 'apple';

function isLightColor(hex: string) {
  const raw = hex.replace('#', '');
  const full = raw.length === 3 ? raw.split('').map((ch) => ch + ch).join('') : raw;
  const r = Number.parseInt(full.slice(0, 2), 16) / 255;
  const g = Number.parseInt(full.slice(2, 4), 16) / 255;
  const b = Number.parseInt(full.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.72;
}

function AppleMark({ size = 42 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M16.37 12.75c-.03-2.12 1.73-3.14 1.81-3.19-1-1.45-2.54-1.65-3.08-1.67-1.31-.13-2.56.77-3.22.77-.67 0-1.7-.75-2.8-.73-1.44.02-2.77.84-3.51 2.13-1.5 2.6-.38 6.45 1.08 8.56.71 1.03 1.56 2.19 2.68 2.15 1.08-.04 1.49-.69 2.79-.69 1.3 0 1.66.69 2.8.67 1.16-.02 1.89-1.05 2.59-2.09.82-1.19 1.16-2.34 1.18-2.4-.03-.01-2.25-.86-2.28-3.41ZM14.7 6.53c.58-.71.98-1.69.87-2.67-.84.03-1.86.56-2.47 1.27-.54.62-1.02 1.62-.89 2.57.94.07 1.91-.48 2.49-1.17Z"
      />
    </svg>
  );
}

export default function RepairBookingFlow({
  slug,
  storeName,
  whatsappNumber,
  initialModels,
  initialIssues,
  initialSimOptions,
}: {
  slug: string;
  storeName: string;
  whatsappNumber?: string;
  initialModels: RepairModel[];
  initialIssues: RepairIssue[];
  initialSimOptions: SimOption[];
}) {
  const [models] = useState<RepairModel[]>(initialModels);
  const [issues] = useState<RepairIssue[]>(initialIssues);
  const [simOptions] = useState<SimOption[]>(initialSimOptions);
  const [brandId, setBrandId] = useState<RepairBrandId | ''>('');
  const [modelId, setModelId] = useState('');
  const [colorId, setColorId] = useState('');
  const [simTypeId, setSimTypeId] = useState('');
  const [issueId, setIssueId] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ bookingNumber: string } | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [issueDetails, setIssueDetails] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
  });

  const selectedModel = useMemo(() => models.find((entry) => entry.id === modelId) ?? null, [models, modelId]);
  const selectedColor = selectedModel?.colors.find((entry) => entry.id === colorId) ?? null;
  const selectedIssue = issues.find((entry) => entry.id === issueId) ?? null;
  const selectedSim = simOptions.find((entry) => entry.id === simTypeId) ?? null;
  const selectedIssueDetail = (issueId && issueDetails[issueId]?.trim()) || '';
  const hasWhatsApp = isValidWhatsAppNumber(whatsappNumber);

  const repairWhatsAppMessage = useMemo(() => {
    const lines = [
      `*Repair request — ${storeName}*`,
      selectedModel ? `Model: ${selectedModel.name}` : '',
      selectedColor ? `Colour: ${selectedColor.name}` : '',
      selectedSim ? `SIM: ${selectedSim.name}` : '',
      selectedIssue ? `Issue: ${selectedIssue.name}` : '',
      selectedIssueDetail ? `Issue detail: ${selectedIssueDetail}` : '',
      form.name ? `Name: ${form.name}` : '',
      form.phone ? `Phone: ${form.phone}` : '',
      form.address || form.city ? `Address: ${[form.address, form.city].filter(Boolean).join(', ')}` : '',
      coords ? `Map: https://maps.google.com/?q=${coords.lat},${coords.lng}` : '',
      form.preferredDate || form.preferredTime
        ? `Preferred: ${[form.preferredDate, form.preferredTime].filter(Boolean).join(' ')}`
        : '',
      form.notes ? `Notes: ${form.notes}` : '',
      '',
      'Please confirm doorstep repair availability.',
    ].filter((line) => line !== '');
    return lines.join('\n');
  }, [storeName, selectedModel, selectedColor, selectedSim, selectedIssue, selectedIssueDetail, form, coords]);

  const whatsappHref = hasWhatsApp ? createWhatsAppUrl(whatsappNumber, repairWhatsAppMessage) : '';

  useEffect(() => {
    if (!modelId || !colorId) return void setPreview(null);
    let cancelled = false;
    fetch(`/api/store/${slug}/repair/preview?modelId=${encodeURIComponent(modelId)}&colorId=${encodeURIComponent(colorId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setPreview(data?.preview ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, modelId, colorId]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!modelId || !colorId || !simTypeId || !issueId) {
      return setError('Complete your phone, colour, SIM configuration and repair issue first.');
    }
    setSubmitting(true);
    try {
      const response = await fetch(`/api/store/${slug}/repair-bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          modelId,
          colorId,
          simTypeId,
          issueId,
          issueDetail: selectedIssueDetail,
          ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not place repair order');
      setDone({ bookingNumber: data.booking?.bookingNumber || 'REP' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not place repair order');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    const successMessage = [
      `*Repair order placed: ${done.bookingNumber}*`,
      `*Store:* ${storeName}`,
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `Address: ${form.address}, ${form.city}`,
      coords ? `Map: https://maps.google.com/?q=${coords.lat},${coords.lng}` : '',
      selectedModel ? `Model: ${selectedModel.name}` : '',
      selectedColor ? `Colour: ${selectedColor.name}` : '',
      selectedIssue ? `Issue: ${selectedIssue.name}` : '',
      selectedIssueDetail ? `Issue detail: ${selectedIssueDetail}` : '',
      '',
      'Please confirm this doorstep repair.',
    ]
      .filter(Boolean)
      .join('\n');
    const successWhatsApp = hasWhatsApp ? createWhatsAppUrl(whatsappNumber, successMessage) : '';

    return (
      <section className="repair-page">
        <div className="repair-success glass-card">
          <CheckCircle2 size={34} />
          <h2>Repair order placed</h2>
          <p>
            Order <strong>{done.bookingNumber}</strong> is saved. {storeName} will call <strong>{form.phone}</strong> to
            confirm the visit.
          </p>
          {successWhatsApp ? (
            <a className="whatsapp-btn repair-whatsapp-btn" href={successWhatsApp} rel="noreferrer">
              <WhatsAppMark />
              WhatsApp
            </a>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="repair-page repair-one-page">
      <div className="repair-hero repair-hero-branded">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="repair-hero-bg" src="/storefront/rm-iphone-repair-hero.png" alt="" />
        <div className="repair-hero-shade" />
        <div className="repair-hero-copy">
          <p className="home-section-kicker">
            <Wrench size={14} /> iPhone doorstep repair
          </p>
          <h1 className="title-with-underline">Doorstep iPhone repair</h1>
          <p>Pick your model and colour. We come to your address, repair it on the spot, and leave once it works again.</p>
          <ul className="repair-hero-points">
            <li>
              <ShieldCheck size={15} /> Exact model match
            </li>
            <li>
              <Smartphone size={15} /> Official colours
            </li>
            <li>
              <Phone size={15} /> At your door
            </li>
          </ul>
        </div>
      </div>

      <form className="repair-one-page-form" onSubmit={(event) => void submit(event)}>
        <div className="repair-panel">
          <h2>Choose brand</h2>
          <p className="repair-panel-sub">Select the brand of the phone you want repaired.</p>
          <div className="repair-brand-grid">
            <button
              type="button"
              className={`repair-brand-card ${brandId === 'apple' ? 'is-selected' : ''}`}
              onClick={() => {
                setError('');
                setBrandId('apple');
              }}
            >
              <span className="repair-brand-logo" aria-hidden>
                <AppleMark />
              </span>
              <strong>Apple</strong>
              <small>iPhone doorstep repair</small>
            </button>
          </div>
        </div>

        {brandId === 'apple' && (
          <div className="repair-panel">
            <h2>Choose your iPhone</h2>
            <p className="repair-panel-sub">Select the exact model you want repaired.</p>
            <div className="repair-model-grid">
              {models.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  className={`repair-model-card ${modelId === model.id ? 'is-selected' : ''}`}
                  onClick={() => {
                    setError('');
                    setModelId(model.id);
                    setColorId('');
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={model.imageUrl}
                    alt={model.name}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                      event.currentTarget.nextElementSibling?.classList.add('is-visible');
                    }}
                  />
                  <span className="repair-model-fallback" aria-hidden>
                    {model.name.replace('iPhone ', '')}
                  </span>
                  <strong>{model.name}</strong>
                </button>
              ))}
            </div>
          </div>
        )}

        {brandId === 'apple' && selectedModel && (
          <div className="repair-panel">
            <h2>Choose the exact colour</h2>
            <p className="repair-panel-sub">Select the colour currently on your {selectedModel.name}.</p>
            <div className="repair-color-grid">
              {selectedModel.colors.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  className={`repair-color-card ${colorId === color.id ? 'is-selected' : ''}`}
                  onClick={() => {
                    setError('');
                    setColorId(color.id);
                  }}
                >
                  <span
                    className={`repair-color-swatch-lg ${isLightColor(color.hex) ? 'is-light' : ''}`}
                    style={{ background: color.hex }}
                    aria-hidden
                  />
                  <strong>{color.name}</strong>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedModel && selectedColor && (
          <div className="repair-panel">
            <h2>SIM configuration</h2>
            <p className="repair-panel-sub">Choose the SIM setup in this phone so the technician can protect your connection.</p>
            <div className="repair-sim-grid">
              {simOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`repair-sim-card ${simTypeId === option.id ? 'is-selected' : ''}`}
                  onClick={() => {
                    setError('');
                    setSimTypeId(option.id);
                  }}
                >
                  <Smartphone size={19} />
                  <strong>{option.name}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedModel && selectedColor && simTypeId && (
          <div className="repair-panel">
            <h2>What needs repair?</h2>
            <div className="repair-issue-list">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`repair-issue-card ${issueId === issue.id ? 'is-selected' : ''}`}
                  onClick={() => {
                    setError('');
                    setIssueId(issue.id);
                  }}
                >
                  <strong>{issue.name}</strong>
                  <span>{issue.description}</span>
                  <input
                    className="form-input repair-issue-detail"
                    type="text"
                    maxLength={300}
                    placeholder="Explain your issue briefly…"
                    value={issueDetails[issue.id] || ''}
                    onClick={(event) => event.stopPropagation()}
                    onFocus={() => {
                      setError('');
                      setIssueId(issue.id);
                    }}
                    onKeyDown={(event) => event.stopPropagation()}
                    onChange={(event) => {
                      const value = event.target.value;
                      setIssueId(issue.id);
                      setIssueDetails((prev) => ({ ...prev, [issue.id]: value }));
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedModel && selectedColor && selectedSim && selectedIssue && (
          <>
            <div className="repair-panel">
              <h2>Confirm your device</h2>
              <p className="repair-panel-sub">The technician will receive these exact details.</p>
              <div className="repair-preview-card repair-preview-colorful">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="repair-preview-model-img" src={selectedModel.imageUrl} alt={selectedModel.name} />
                <div className="repair-preview-meta">
                  <strong>{preview?.modelName || selectedModel.name}</strong>
                  <span>Colour: {preview?.colorName || selectedColor.name}</span>
                  <span>SIM: {selectedSim.name}</span>
                  <span>Issue: {selectedIssue.name}</span>
                  {selectedIssueDetail ? <span>Detail: {selectedIssueDetail}</span> : null}
                  <span className="repair-preview-swatch" style={{ background: preview?.colorHex || selectedColor.hex }} />
                </div>
              </div>
            </div>

            <div className="repair-panel">
              <h2>Doorstep details</h2>
              <p className="repair-panel-sub">Where should we come for the repair?</p>
              <div className="repair-form-grid">
                <label>
                  <span>Full name</span>
                  <input
                    className="form-input"
                    required
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Phone</span>
                  <input
                    className="form-input"
                    required
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Email (optional)</span>
                  <input
                    className="form-input"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </label>
                <label>
                  <span>City</span>
                  <input
                    className="form-input"
                    required
                    value={form.city}
                    onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                  />
                </label>

                <div className="repair-span">
                  <DoorstepLocationPicker
                    address={form.address}
                    city={form.city}
                    onAddressChange={(address) => setForm((prev) => ({ ...prev, address }))}
                    onCityChange={(city) => setForm((prev) => ({ ...prev, city }))}
                    onLocationChange={setCoords}
                  />
                </div>

                <label>
                  <span>Preferred date</span>
                  <input
                    className="form-input"
                    type="date"
                    value={form.preferredDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, preferredDate: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Preferred time</span>
                  <input
                    className="form-input"
                    type="time"
                    value={form.preferredTime}
                    onChange={(e) => setForm((prev) => ({ ...prev, preferredTime: e.target.value }))}
                  />
                </label>
                <label className="repair-span">
                  <span>Notes</span>
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="Gate code, landmark, extra details…"
                    value={form.notes}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  />
                </label>
              </div>

              <div className="repair-submit-row">
                <button className="btn btn-primary btn-lg" disabled={submitting} type="submit">
                  <Phone size={16} />
                  {submitting ? 'Placing order…' : 'Place repair order'}
                </button>
                {whatsappHref ? (
                  <a className="whatsapp-btn repair-whatsapp-btn" href={whatsappHref} rel="noreferrer">
                    <WhatsAppMark />
                    WhatsApp
                  </a>
                ) : null}
              </div>
            </div>
          </>
        )}

        {error && <p className="form-error repair-error">{error}</p>}
      </form>
    </section>
  );
}
