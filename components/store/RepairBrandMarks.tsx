type BrandMarkId =
  | 'apple'
  | 'samsung'
  | 'google'
  | 'xiaomi'
  | 'oneplus'
  | 'oppo'
  | 'infinix'
  | 'vivo';

export function RepairBrandMark({ id }: { id: BrandMarkId }) {
  switch (id) {
    case 'apple':
      return (
        <svg className="repair-brand-svg" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M16.37 12.75c-.03-2.12 1.73-3.14 1.81-3.19-1-1.45-2.54-1.65-3.08-1.67-1.31-.13-2.56.77-3.22.77-.67 0-1.7-.75-2.8-.73-1.44.02-2.77.84-3.51 2.13-1.5 2.6-.38 6.45 1.08 8.56.71 1.03 1.56 2.19 2.68 2.15 1.08-.04 1.49-.69 2.79-.69 1.3 0 1.66.69 2.8.67 1.16-.02 1.89-1.05 2.59-2.09.82-1.19 1.16-2.34 1.18-2.4-.03-.01-2.25-.86-2.28-3.41ZM14.7 6.53c.58-.71.98-1.69.87-2.67-.84.03-1.86.56-2.47 1.27-.54.62-1.02 1.62-.89 2.57.94.07 1.91-.48 2.49-1.17Z"
          />
        </svg>
      );
    case 'samsung':
      return <span className="repair-brand-word is-samsung">SAMSUNG</span>;
    case 'google':
      return <span className="repair-brand-word is-google">Google</span>;
    case 'xiaomi':
      return <span className="repair-brand-word is-xiaomi">mi</span>;
    case 'oneplus':
      return <span className="repair-brand-word is-oneplus">1+</span>;
    case 'oppo':
      return <span className="repair-brand-word is-oppo">oppo</span>;
    case 'infinix':
      return <span className="repair-brand-word is-infinix">Infinix</span>;
    case 'vivo':
      return <span className="repair-brand-word is-vivo">vivo</span>;
    default:
      return null;
  }
}

export type RepairBrandOption = {
  id: BrandMarkId;
  name: string;
  blurb: string;
  available: boolean;
};

export const REPAIR_BRAND_OPTIONS: RepairBrandOption[] = [
  { id: 'apple', name: 'Apple', blurb: 'iPhone repair', available: true },
  { id: 'samsung', name: 'Samsung', blurb: 'Galaxy repair', available: false },
  { id: 'google', name: 'Google', blurb: 'Pixel repair', available: false },
  { id: 'xiaomi', name: 'Xiaomi', blurb: 'Mi & Redmi', available: false },
  { id: 'oneplus', name: 'OnePlus', blurb: 'OnePlus repair', available: false },
  { id: 'oppo', name: 'OPPO', blurb: 'OPPO repair', available: false },
  { id: 'infinix', name: 'Infinix', blurb: 'Infinix repair', available: false },
  { id: 'vivo', name: 'Vivo', blurb: 'Vivo repair', available: false },
];
