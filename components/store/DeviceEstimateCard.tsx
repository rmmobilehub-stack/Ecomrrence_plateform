'use client';

import type { DeviceEstimate } from '@/lib/device-estimate';

function formatPkr(value: number) {
  return `PKR ${value.toLocaleString('en-PK')}`;
}

function scoreTone(score: number) {
  if (score >= 80) return 'is-strong';
  if (score >= 60) return 'is-good';
  if (score >= 40) return 'is-fair';
  return 'is-weak';
}

export default function DeviceEstimateCard({
  estimate,
  compact = false,
  footnote = 'Indicative market band only. Final repair quote comes after inspection.',
}: {
  estimate: DeviceEstimate;
  compact?: boolean;
  footnote?: string;
}) {
  const radius = compact ? 46 : 54;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, estimate.score)) / 100;
  const offset = circumference * (1 - progress);
  const tone = scoreTone(estimate.score);
  const insights = estimate.suggestions
    .filter((tip) => tip !== footnote)
    .slice(0, compact ? 2 : 4);
  const buys = (estimate.buySuggestions || []).slice(0, compact ? 2 : 4);

  return (
    <div className={`device-estimate-card ${tone}${compact ? ' is-compact' : ''}`}>
      <div className="device-estimate-score-wrap">
        <div className="device-estimate-ring" aria-hidden>
          <svg viewBox="0 0 128 128">
            <circle className="device-estimate-ring-track" cx="64" cy="64" r={radius} />
            <circle
              className="device-estimate-ring-value"
              cx="64"
              cy="64"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="device-estimate-ring-label">
            <strong>{estimate.score}</strong>
            <span>/100</span>
          </div>
        </div>
        <p className="device-estimate-score-label">{estimate.scoreLabel}</p>
        <span className="device-estimate-badge">Health score</span>
      </div>

      <div className="device-estimate-body">
        <div className="device-estimate-worth-row">
          <span className="device-estimate-kicker">Market worth</span>
          <p>
            <strong>{formatPkr(estimate.marketValueMinPkr)}</strong>
            <span> – </span>
            <strong>{formatPkr(estimate.marketValueMaxPkr)}</strong>
          </p>
        </div>

        {!compact ? <p className="device-estimate-summary">{estimate.summary}</p> : null}

        {insights.length ? (
          <div className="device-estimate-section">
            <h3>Insights</h3>
            <ul>
              {insights.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {buys.length ? (
          <div className="device-estimate-section is-buy">
            <h3>Suggested to buy / consider</h3>
            <div className="device-estimate-chips">
              {buys.map((tip) => (
                <span key={tip}>{tip}</span>
              ))}
            </div>
          </div>
        ) : null}

        <p className="device-estimate-footnote">{footnote}</p>
      </div>
    </div>
  );
}
