'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Phone, ShieldCheck, Smartphone, Sparkles, Wrench } from 'lucide-react';
import type { RepairIssue, RepairModel } from '@/lib/iphone-repair-catalog';
import type { DeviceConditionInput, DeviceEstimate } from '@/lib/device-estimate';
import { DEFAULT_DEVICE_CONDITION } from '@/lib/device-estimate';
import { createWhatsAppUrl, isValidWhatsAppNumber } from '@/lib/whatsapp';
import { WhatsAppMark } from '@/components/store/WhatsAppButton';
import { REPAIR_BRAND_OPTIONS, RepairBrandMark } from '@/components/store/RepairBrandMarks';
import DeviceConditionFields from '@/components/store/DeviceConditionFields';
import DeviceEstimateCard from '@/components/store/DeviceEstimateCard';
import PriceReassureModal from '@/components/store/PriceReassureModal';
import { storefrontPath } from '@/lib/storefront-paths';

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

function formatPkr(value: number) {
  return `PKR ${value.toLocaleString('en-PK')}`;
}

function scrollToRepairStep(stepId: string) {
  window.setTimeout(() => {
    document.getElementById(stepId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 90);
}

function isLightColor(hex: string) {
  const raw = hex.replace('#', '');
  const full = raw.length === 3 ? raw.split('').map((ch) => ch + ch).join('') : raw;
  const r = Number.parseInt(full.slice(0, 2), 16) / 255;
  const g = Number.parseInt(full.slice(2, 4), 16) / 255;
  const b = Number.parseInt(full.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.72;
}

function RepairHeading({ kicker, title, accent, sub }: { kicker: string; title: string; accent?: string; sub: string }) {
  return (
    <header className="repair-panel-head">
      <p className="repair-panel-kicker">{kicker}</p>
      <h2>
        {title}
        {accent ? (
          <>
            {' '}
            <span className="section-title-accent">{accent}</span>
          </>
        ) : null}
      </h2>
      <p className="repair-panel-sub">{sub}</p>
    </header>
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
  const [showProceedModal, setShowProceedModal] = useState(false);
  const [showPriceReassure, setShowPriceReassure] = useState(false);
  const [priceReassureSeen, setPriceReassureSeen] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ bookingNumber: string } | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [issueDetails, setIssueDetails] = useState<Record<string, string>>({});
  const [condition, setCondition] = useState<DeviceConditionInput>(DEFAULT_DEVICE_CONDITION);
  const [estimate, setEstimate] = useState<DeviceEstimate | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState('');
  const [editCondition, setEditCondition] = useState(false);
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
      estimate
        ? `Device score: ${estimate.score}/100 · Market worth ~ ${formatPkr(estimate.marketValueMinPkr)}–${formatPkr(estimate.marketValueMaxPkr)}`
        : '',
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
  }, [storeName, selectedModel, selectedColor, selectedSim, selectedIssue, selectedIssueDetail, estimate, form, coords]);

  const whatsappHref = hasWhatsApp ? createWhatsAppUrl(whatsappNumber, repairWhatsAppMessage) : '';

  useEffect(() => {
    setEstimate(null);
    setEstimateError('');
  }, [
    modelId,
    colorId,
    issueId,
    condition.screenCondition,
    condition.bodyFlags,
    condition.partsChanged,
    condition.overallOutOf10,
    condition.batteryHealthPercent,
    condition.ageYears,
    condition.ownership,
    condition.additionalNote,
    selectedIssueDetail,
  ]);

  const selectIssue = (nextIssueId: string, options?: { skipScroll?: boolean }) => {
    setError('');
    setIssueId(nextIssueId);
    if (!priceReassureSeen) {
      setShowPriceReassure(true);
      return;
    }
    if (!options?.skipScroll) scrollToRepairStep('repair-step-confirm');
  };
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

  const validateBeforeBooking = () => {
    if (!modelId || !colorId || !simTypeId || !issueId) {
      setError('Complete your phone, colour, SIM configuration and repair issue first.');
      return false;
    }
    if (!estimate) {
      setError('Check your phone score and market worth before placing the repair order.');
      return false;
    }
    if (!form.name.trim() || !form.phone.trim() || !form.city.trim() || !form.address.trim()) {
      setError('Please fill in your name, phone, city and doorstep address.');
      return false;
    }
    setError('');
    return true;
  };

  const runDeviceEstimate = async () => {
    if (!modelId || !colorId || !issueId) {
      setEstimateError('Select model, colour and issue first.');
      return;
    }
    setEstimating(true);
    setEstimateError('');
    try {
      const response = await fetch(`/api/store/${slug}/repair/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId,
          colorId,
          issueId,
          issueDetail: selectedIssueDetail,
          condition,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.estimate) throw new Error(data.error || 'Could not estimate device value');
      setEstimate(data.estimate as DeviceEstimate);
      setEditCondition(false);
      scrollToRepairStep('repair-step-score');
    } catch (err) {
      setEstimate(null);
      setEstimateError(err instanceof Error ? err.message : 'Could not estimate device value');
    } finally {
      setEstimating(false);
    }
  };

  const requestPlaceOrder = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateBeforeBooking()) return;
    setShowProceedModal(true);
  };

  const placeRepairOrder = async () => {
    if (!validateBeforeBooking()) {
      setShowProceedModal(false);
      return;
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
          deviceCondition: condition,
          deviceEstimate: estimate,
          ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not place repair order');
      setShowProceedModal(false);
      setDone({ bookingNumber: data.booking?.bookingNumber || 'REP' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not place repair order');
      setShowProceedModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <section className="repair-page">
        <div className="repair-success glass-card">
          <CheckCircle2 size={34} />
          <h2>Repair request received</h2>
          <p>
            Booking <strong>{done.bookingNumber}</strong> is saved. Our inspection team will contact you on{' '}
            <strong>{form.phone}</strong>
            {form.email ? <> or <strong>{form.email}</strong></> : null} to guide you on your device and share the
            final repair estimate. <strong>No payment is due now.</strong>
          </p>
          <Link className="btn btn-primary" href={storefrontPath(slug, 'products')}>Continue shopping</Link>
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

      <form className="repair-one-page-form" onSubmit={requestPlaceOrder}>
        <div className="repair-panel" id="repair-step-brand">
          <RepairHeading
            kicker="Brand"
            title="Choose your"
            accent="brand"
            sub="Apple is available now. More brands open soon."
          />
          <div className="repair-brand-grid">
            {REPAIR_BRAND_OPTIONS.map((brand) =>
              brand.available ? (
                <button
                  key={brand.id}
                  type="button"
                  className={`repair-brand-card ${brandId === brand.id ? 'is-selected' : ''}`}
                  onClick={() => {
                    setError('');
                    setBrandId(brand.id as RepairBrandId);
                    scrollToRepairStep('repair-step-model');
                  }}
                >
                  <span className={`repair-brand-logo repair-brand-logo--${brand.id}`} aria-hidden>
                    <RepairBrandMark id={brand.id} />
                  </span>
                  <strong>{brand.name}</strong>
                  <small>{brand.blurb}</small>
                </button>
              ) : (
                <div key={brand.id} className="repair-brand-card is-coming-soon" aria-disabled="true">
                  <span className={`repair-brand-logo repair-brand-logo--${brand.id}`} aria-hidden>
                    <RepairBrandMark id={brand.id} />
                  </span>
                  <strong>{brand.name}</strong>
                  <small>{brand.blurb}</small>
                  <span className="repair-brand-soon" aria-hidden="true">
                    <span className="repair-brand-soon-badge">Coming soon</span>
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {brandId === 'apple' && (
          <div className="repair-panel" id="repair-step-model">
            <RepairHeading
              kicker="Model"
              title="Choose your"
              accent="iPhone"
              sub="Select the exact model you want repaired."
            />
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
                    scrollToRepairStep('repair-step-colour');
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
          <div className="repair-panel" id="repair-step-colour">
            <RepairHeading
              kicker="Colour"
              title="Choose the exact"
              accent="colour"
              sub={`Select the colour currently on your ${selectedModel.name}.`}
            />
            <div className="repair-color-grid">
              {selectedModel.colors.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  className={`repair-color-card ${colorId === color.id ? 'is-selected' : ''}`}
                  onClick={() => {
                    setError('');
                    setColorId(color.id);
                    scrollToRepairStep('repair-step-sim');
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
          <div className="repair-panel" id="repair-step-sim">
            <RepairHeading
              kicker="SIM"
              title="SIM"
              accent="configuration"
              sub="Choose the SIM setup in this phone so the technician can protect your connection."
            />
            <div className="repair-sim-grid">
              {simOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`repair-sim-card ${simTypeId === option.id ? 'is-selected' : ''}`}
                  onClick={() => {
                    setError('');
                    setSimTypeId(option.id);
                    scrollToRepairStep('repair-step-issue');
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
          <div className="repair-panel" id="repair-step-issue">
            <RepairHeading
              kicker="Issue"
              title="What needs"
              accent="repair?"
              sub="Tell us what’s wrong so we bring the right parts."
            />
            <div className="repair-issue-list">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`repair-issue-card ${issueId === issue.id ? 'is-selected' : ''}`}
                  onClick={() => selectIssue(issue.id)}
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
                    onFocus={() => selectIssue(issue.id, { skipScroll: true })}
                    onKeyDown={(event) => event.stopPropagation()}
                    onChange={(event) => {
                      const value = event.target.value;
                      selectIssue(issue.id, { skipScroll: true });
                      setIssueDetails((prev) => ({ ...prev, [issue.id]: value }));
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedModel && selectedColor && selectedSim && selectedIssue && (
          <div className="repair-panel repair-panel-compact" id="repair-step-confirm">
            <RepairHeading
              kicker="Confirm"
              title="Confirm your"
              accent="device"
              sub="The technician will receive these exact details."
            />
            <div className={`repair-confirm-score-row${estimate ? ' has-score' : ''}`}>
              <div className="repair-preview-card repair-preview-colorful repair-preview-compact repair-device-summary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="repair-preview-model-img" src={selectedModel.imageUrl} alt={selectedModel.name} />
                <div className="repair-preview-meta">
                  <strong>{preview?.modelName || selectedModel.name}</strong>
                  <div className="repair-device-facts">
                    <div className="repair-device-fact">
                      <span>Colour</span>
                      <strong>
                        <span className="repair-preview-swatch" style={{ background: preview?.colorHex || selectedColor.hex }} />
                        {preview?.colorName || selectedColor.name}
                      </strong>
                    </div>
                    <div className="repair-device-fact">
                      <span>SIM</span>
                      <strong>{selectedSim.name}</strong>
                    </div>
                    <div className="repair-device-fact">
                      <span>Issue</span>
                      <strong>{selectedIssue.name}</strong>
                    </div>
                    {selectedIssueDetail ? (
                      <div className="repair-device-fact">
                        <span>Detail</span>
                        <strong>{selectedIssueDetail}</strong>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {estimate ? (
                <div id="repair-step-score" className="repair-confirm-score-side">
                  <DeviceEstimateCard estimate={estimate} compact />
                </div>
              ) : null}
            </div>

            {!estimate || editCondition ? (
              <div className="repair-score-inputs">
                <p className="device-condition-label">Condition for score</p>
                <DeviceConditionFields
                  value={condition}
                  onChange={setCondition}
                  hideHero
                />
                <div className="repair-estimate-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={estimating}
                    onClick={() => void runDeviceEstimate()}
                  >
                    <Sparkles size={16} />
                    {estimating ? 'Calculating…' : estimate ? 'Update score' : 'Get score & market worth'}
                  </button>
                  {estimate && editCondition ? (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEditCondition(false)}
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
                {estimateError ? <p className="form-error repair-error">{estimateError}</p> : null}
              </div>
            ) : (
              <div className="repair-score-inputs is-collapsed">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setEditCondition(true)}
                >
                  Edit condition & recalculate
                </button>
              </div>
            )}
          </div>
        )}

        {selectedModel && selectedColor && selectedSim && selectedIssue && estimate && (
          <div className="repair-panel repair-panel-compact" id="repair-step-visit">
            <RepairHeading
              kicker="Visit"
              title="Doorstep"
              accent="details"
              sub="Where should we come for the repair?"
            />
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
                <span>Email (for booking confirmation)</span>
                <input
                  className="form-input"
                  type="email"
                  required
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
        )}

        {error && <p className="form-error repair-error">{error}</p>}
      </form>

      {showProceedModal ? (
        <div
          className="repair-confirm-overlay"
          role="presentation"
          onClick={() => !submitting && setShowProceedModal(false)}
        >
          <div
            className="repair-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="repair-proceed-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="repair-confirm-icon" aria-hidden>
              <ShieldCheck size={28} />
            </div>
            <h2 id="repair-proceed-title" className="repair-confirm-title">
              Price is confirmed later
            </h2>
            <p className="repair-confirm-lead">
              Your booking will be placed now. Our inspection team will contact you, guide you based on the device and
              issue, and share the <strong>final estimate</strong>.
            </p>
            <ul className="repair-confirm-list">
              <li>This is only a repair request — no payment is due now.</li>
              <li>The team will share next steps by call or WhatsApp.</li>
              <li>After the estimate, you can approve and continue with the repair.</li>
            </ul>
            <div className="repair-confirm-actions">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={submitting}
                onClick={() => setShowProceedModal(false)}
              >
                Go back
              </button>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                disabled={submitting}
                onClick={() => void placeRepairOrder()}
              >
                {submitting ? 'Placing…' : 'Got it — place order'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <PriceReassureModal
        open={showPriceReassure}
        onContinue={() => {
          setShowPriceReassure(false);
          setPriceReassureSeen(true);
          scrollToRepairStep('repair-step-confirm');
        }}
      />
    </section>
  );
}
