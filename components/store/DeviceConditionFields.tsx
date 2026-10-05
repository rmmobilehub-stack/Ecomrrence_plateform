'use client';

import type {
  BodyFlag,
  ChangedPart,
  DeviceConditionInput,
  OwnershipStatus,
  ScreenCondition,
} from '@/lib/device-estimate';
import {
  BODY_FLAG_OPTIONS,
  OWNERSHIP_OPTIONS,
  PARTS_CHANGED_OPTIONS,
  SCREEN_CONDITION_OPTIONS,
  toggleBodyFlag,
  toggleChangedPart,
} from '@/lib/device-estimate';

export default function DeviceConditionFields({
  value,
  onChange,
  modelName,
  modelImageUrl,
  hideHero = false,
}: {
  value: DeviceConditionInput;
  onChange: (next: DeviceConditionInput) => void;
  modelName?: string;
  modelImageUrl?: string;
  hideHero?: boolean;
}) {
  return (
    <div className="device-condition-panel">
      {!hideHero && modelName && modelImageUrl ? (
        <div className="device-condition-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={modelImageUrl} alt={modelName} />
          <div>
            <p className="device-condition-label">Checking</p>
            <strong>{modelName}</strong>
            <small>Honest details give a better score and market worth</small>
          </div>
        </div>
      ) : null}

      <div className="device-condition-block">
        <p className="device-condition-label">Screen inside</p>
        <div className="device-choice-row">
          {SCREEN_CONDITION_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`device-choice-chip ${value.screenCondition === option.id ? 'is-selected' : ''}`}
              onClick={() => onChange({ ...value, screenCondition: option.id as ScreenCondition })}
            >
              <strong>{option.label}</strong>
            </button>
          ))}
        </div>
      </div>

      <div className="device-condition-block">
        <p className="device-condition-label">Body</p>
        <div className="device-choice-row is-four">
          {BODY_FLAG_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`device-choice-chip ${value.bodyFlags.includes(option.id) ? 'is-selected' : ''}`}
              onClick={() =>
                onChange({ ...value, bodyFlags: toggleBodyFlag(value.bodyFlags, option.id as BodyFlag) })
              }
            >
              <strong>{option.label}</strong>
            </button>
          ))}
        </div>
      </div>

      <div className="device-condition-block">
        <p className="device-condition-label">Any part changed?</p>
        <div className="device-check-row is-parts">
          {PARTS_CHANGED_OPTIONS.map((option) => (
            <label key={option.id} className="device-check">
              <input
                type="checkbox"
                checked={value.partsChanged.includes(option.id)}
                onChange={() =>
                  onChange({
                    ...value,
                    partsChanged: toggleChangedPart(value.partsChanged, option.id as ChangedPart),
                  })
                }
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="device-condition-grid">
        <label className="device-condition-field">
          <span>Overall condition</span>
          <select
            className="form-select"
            value={value.overallOutOf10}
            onChange={(event) => onChange({ ...value, overallOutOf10: Number(event.target.value) })}
          >
            {Array.from({ length: 10 }, (_, index) => 10 - index).map((n) => (
              <option key={n} value={n}>
                {n}/10
              </option>
            ))}
          </select>
        </label>

        <label className="device-condition-field">
          <span>Battery health %</span>
          <input
            className="form-input"
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            value={value.batteryHealthPercent}
            onChange={(event) =>
              onChange({
                ...value,
                batteryHealthPercent: Math.min(100, Math.max(0, Number(event.target.value) || 0)),
              })
            }
          />
        </label>

        <label className="device-condition-field">
          <span>Phone age (years used)</span>
          <input
            className="form-input"
            type="number"
            min={0}
            max={12}
            step={0.5}
            value={value.ageYears}
            onChange={(event) =>
              onChange({
                ...value,
                ageYears: Math.min(12, Math.max(0, Number(event.target.value) || 0)),
              })
            }
          />
        </label>

        <label className="device-condition-field">
          <span>Ownership / status</span>
          <select
            className="form-select"
            value={value.ownership}
            onChange={(event) =>
              onChange({ ...value, ownership: event.target.value as OwnershipStatus })
            }
          >
            {OWNERSHIP_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="device-condition-field device-note-field">
        <span>Additional note</span>
        <textarea
          className="form-input"
          rows={3}
          maxLength={500}
          placeholder="Extra detail — previous repair shop, box missing, Face ID note…"
          value={value.additionalNote}
          onChange={(event) => onChange({ ...value, additionalNote: event.target.value })}
        />
      </label>
    </div>
  );
}
