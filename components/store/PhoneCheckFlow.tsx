'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Activity, BadgeCheck, ShoppingBag, Sparkles, TrendingUp, Wrench } from 'lucide-react';
import type { RepairModel } from '@/lib/iphone-repair-catalog';
import type { DeviceConditionInput, DeviceEstimate } from '@/lib/device-estimate';
import { DEFAULT_DEVICE_CONDITION } from '@/lib/device-estimate';
import DeviceConditionFields from '@/components/store/DeviceConditionFields';
import DeviceEstimateCard from '@/components/store/DeviceEstimateCard';
import { REPAIR_BRAND_OPTIONS } from '@/components/store/RepairBrandMarks';
import { storefrontPath } from '@/lib/storefront-paths';

type BrandId = (typeof REPAIR_BRAND_OPTIONS)[number]['id'] | '';

export default function PhoneCheckFlow({
  slug,
  storeName,
  initialModels,
}: {
  slug: string;
  storeName: string;
  initialModels: RepairModel[];
}) {
  const [models] = useState(initialModels);
  const [brandId, setBrandId] = useState<BrandId>('');
  const [modelId, setModelId] = useState('');
  const [condition, setCondition] = useState<DeviceConditionInput>(DEFAULT_DEVICE_CONDITION);
  const [estimate, setEstimate] = useState<DeviceEstimate | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [error, setError] = useState('');

  const selectedBrand = REPAIR_BRAND_OPTIONS.find((brand) => brand.id === brandId) ?? null;
  const selectedModel = useMemo(() => models.find((entry) => entry.id === modelId) ?? null, [models, modelId]);
  const shopHref = storefrontPath(slug, 'products');
  const repairHref = storefrontPath(slug, 'repair');
  const appleReady = brandId === 'apple';

  useEffect(() => {
    setEstimate(null);
    setError('');
  }, [brandId, modelId, condition]);

  const onBrandChange = (value: string) => {
    const brand = REPAIR_BRAND_OPTIONS.find((entry) => entry.id === value);
    if (!brand?.available) return;
    setBrandId(brand.id);
    setModelId('');
    setEstimate(null);
    window.setTimeout(() => {
      document.getElementById('phone-check-model')?.focus();
    }, 60);
  };

  const onModelChange = (value: string) => {
    setModelId(value);
    setEstimate(null);
    if (value) {
      window.setTimeout(() => {
        document.getElementById('phone-check-condition')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 90);
    }
  };

  const runEstimate = async () => {
    if (!appleReady || !modelId) {
      setError('Select Apple and your iPhone model first.');
      return;
    }
    setEstimating(true);
    setError('');
    try {
      const response = await fetch(`/api/store/${slug}/repair/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId,
          colorId: selectedModel?.colors[0]?.id || '',
          condition,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.estimate) throw new Error(data.error || 'Could not estimate');
      setEstimate(data.estimate as DeviceEstimate);
      window.setTimeout(() => {
        document.getElementById('phone-check-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 90);
    } catch (err) {
      setEstimate(null);
      setError(err instanceof Error ? err.message : 'Could not estimate');
    } finally {
      setEstimating(false);
    }
  };

  return (
    <section className="repair-page repair-one-page phone-check-page">
      <div className="phone-check-hero">
        <div className="phone-check-hero-copy">
          <p className="home-section-kicker">
            <Activity size={14} /> Phone Check
          </p>
          <h1 className="title-with-underline">Health score & market worth</h1>
          <p>
            {storeName}: choose brand, then model, then condition details. Get a health score, market worth band,
            and buy/repair suggestions. Final repair quote comes after inspection.
          </p>
          <div className="phone-check-hero-trust">
            <span><BadgeCheck size={15} /> Instant assessment</span>
            <span><TrendingUp size={15} /> Pakistan market range</span>
          </div>
        </div>
        <div className="phone-check-hero-art" aria-hidden="true">
          <div className="phone-check-hero-orbit" />
          <div className="phone-check-hero-device"><span className="phone-check-hero-island" /><span className="phone-check-hero-heart">92</span><small>HEALTH</small><i /><i /><i /></div>
          <div className="phone-check-score-card"><span>Estimated score</span><strong>9.2<span>/10</span></strong><em>Excellent condition</em></div>
        </div>
      </div>

      <div className="repair-panel">
        <header className="repair-panel-head">
          <p className="repair-panel-kicker">Select</p>
          <h2>
            Brand & <span className="section-title-accent">model</span>
          </h2>
          <p className="repair-panel-sub">Apple is available now. Other brands are listed as Coming soon.</p>
        </header>

        <div className="phone-check-selects">
          <label className="device-condition-field">
            <span>Brand</span>
            <select
              className="form-select"
              value={brandId}
              onChange={(event) => onBrandChange(event.target.value)}
            >
              <option value="">Choose brand</option>
              {REPAIR_BRAND_OPTIONS.map((brand) => (
                <option key={brand.id} value={brand.id} disabled={!brand.available}>
                  {brand.available ? brand.name : `${brand.name} — Coming soon`}
                </option>
              ))}
            </select>
          </label>

          <label className="device-condition-field">
            <span>Model</span>
            <select
              id="phone-check-model"
              className="form-select"
              value={modelId}
              disabled={!appleReady}
              onChange={(event) => onModelChange(event.target.value)}
            >
              <option value="">{appleReady ? 'Choose iPhone model' : 'Select Apple first'}</option>
              {appleReady
                ? models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))
                : null}
            </select>
          </label>
        </div>

        {selectedBrand && !selectedBrand.available ? (
          <p className="form-error repair-error">This brand is coming soon. Please select Apple.</p>
        ) : null}
      </div>

      {appleReady && selectedModel ? (
        <div className="repair-panel" id="phone-check-condition">
          <header className="repair-panel-head">
            <p className="repair-panel-kicker">Condition</p>
            <h2>
              Device <span className="section-title-accent">details</span>
            </h2>
            <p className="repair-panel-sub">
              {selectedModel.name} — add screen, battery %, ownership, and age details.
            </p>
          </header>
          <DeviceConditionFields
            value={condition}
            onChange={setCondition}
            modelName={selectedModel.name}
            modelImageUrl={selectedModel.imageUrl}
          />
          <div className="repair-estimate-actions">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              disabled={estimating}
              onClick={() => void runEstimate()}
            >
              <Sparkles size={16} />
              {estimating ? 'Calculating…' : 'Get score & suggestions'}
            </button>
            <small>Instant health score and Pakistan market worth based on the details you share.</small>
          </div>
          {error ? <p className="form-error repair-error">{error}</p> : null}
        </div>
      ) : null}

      {estimate ? (
        <div className="repair-panel" id="phone-check-result">
          <DeviceEstimateCard estimate={estimate} />

          <div className="phone-check-ctas">
            <Link className="btn btn-primary" href={shopHref}>
              <ShoppingBag size={16} /> Shop accessories
            </Link>
            <Link className="btn btn-secondary" href={repairHref}>
              <Wrench size={16} /> Book doorstep repair
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
