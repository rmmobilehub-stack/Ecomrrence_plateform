import { Sparkles } from 'lucide-react';

export default function BrandMark({ size = 22, className = '' }: { size?: number; className?: string }) {
  return <span className={`brand-mark ${className}`} aria-hidden="true"><Sparkles size={size} strokeWidth={2.35}/></span>;
}
