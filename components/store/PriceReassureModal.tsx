'use client';

import { ShieldCheck } from 'lucide-react';

export default function PriceReassureModal({
  open,
  onContinue,
}: {
  open: boolean;
  onContinue: () => void;
}) {
  if (!open) return null;

  return (
    <div className="repair-confirm-overlay" role="presentation">
      <div
        className="repair-confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="price-reassure-title"
      >
        <div className="repair-confirm-icon" aria-hidden>
          <ShieldCheck size={28} />
        </div>
        <h2 id="price-reassure-title" className="repair-confirm-title">
          Price is confirmed after inspection
        </h2>
        <p className="repair-confirm-lead">
          No final repair price is shown now. After you share details, our inspection team will contact you, guide you
          on the device and issue, and share the estimate. No payment is due at this step.
        </p>
        <ul className="repair-confirm-list">
          <li>Next: phone condition, score, and market worth (indicative only).</li>
          <li>Final repair quote comes after inspection and approval.</li>
        </ul>
        <div className="repair-confirm-actions">
          <button type="button" className="btn btn-primary btn-lg" onClick={onContinue}>
            Got it — continue
          </button>
        </div>
      </div>
    </div>
  );
}
